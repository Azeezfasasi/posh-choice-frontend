import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart } from '../../context-api/cart/UseCart';
import { useUser } from '../../context-api/user-context/UseUser';
import { AlertCircle, Check, CheckCircle2, Info, Landmark, Loader2, Lock, MessageCircle, ShoppingBag, UploadCloud, X } from 'lucide-react';
import PageHeader from '../PageHeader';
import { formatNaira } from '../../../utils/formatPrice';
import { API_BASE_URL } from '../../../config/api';
import { fetchDeliveryLocations } from '../../../services/deliveryLocationApi';
import { uploadPaymentProof } from '../../../services/orderApi';

const MAX_PROOF_SIZE = 4 * 1024 * 1024; // must match the backend upload limit

const CheckoutMain = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { cart, loading: cartLoading, clearCart } = useCart();
  const { user, token } = useUser();
  // No default: the customer must choose one of the methods shown
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState(null);
  
  // Bank Transfer Proof Upload State
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofUrl, setProofUrl] = useState(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [proofError, setProofError] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    note: '',
    country: 'Nigeria',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Fetch delivery locations on mount
  useEffect(() => {
    const loadDeliveryLocations = async () => {
      try {
        const locations = await fetchDeliveryLocations();
        setDeliveryLocations(locations);
        // Set first location as default
        if (locations.length > 0) {
          setSelectedDeliveryLocation(locations[0]._id);
        }
      } catch (error) {
        console.error('Error loading delivery locations:', error);
        setValidationErrors(prev => ({ ...prev, locations: 'Failed to load delivery locations' }));
      }
    };

    loadDeliveryLocations();
  }, []);

  useEffect(() => {
    if (user && user.shippingAddress) {
      setShippingAddress({
        fullName: user.name || '',
        email: user.email || '',
        address1: user.shippingAddress.address1 || '',
        address2: user.shippingAddress.address2 || '',
        city: user.shippingAddress.city || '',
        state: user.shippingAddress.state || '',
        zipCode: user.shippingAddress.zipCode || '',
        phone: user.shippingAddress.phone || '',
        note: user.shippingAddress.note || '',
        country: user.shippingAddress.country || 'Nigeria',
      });
    } else if (user) {
        setShippingAddress(prev => ({ ...prev, fullName: prev.fullName || user.name || '', email: prev.email || user.email || '' }));
    }
  }, [user]);

  const subtotal = cart?.items?.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0) || 0;
  
  // Get shipping amount based on selected delivery location
  const selectedLocation = deliveryLocations.find(loc => loc._id === selectedDeliveryLocation);
  const estimatedShipping = selectedLocation?.shippingAmount || 0;
  
  const taxRate = 0;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + estimatedShipping + taxAmount;

  const handleShippingChange = useCallback((e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  // Handle proof file selection
  const handleProofFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PROOF_SIZE) {
      setProofError('File is too large. Maximum size is 4MB.');
      return;
    }

    setProofError(null);
    setProofFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofPreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProofPreview(`📄 ${file.name}`);
    }
  };

  // Upload proof to Backend (which will handle Cloudinary upload)
  const handleProofUpload = async () => {
    console.log('handleProofUpload called', { proofFile, proofUrl });
    
    if (!proofFile) {
      console.warn('No proof file selected');
      setProofError('Please select a file first');
      return;
    }

    setProofUploading(true);
    setProofError(null);

    try {
      console.log('Confirming file for upload...', { fileName: proofFile.name, fileSize: proofFile.size, fileType: proofFile.type });
      
      // Store the file - it will be uploaded after order is created
      setProofUrl(proofFile); // Store the file object as proofUrl
      setProofFile(null); // Clear the file input
      // Keep proofPreview visible to show the confirmed file
      
      console.log('File confirmed and ready for upload after order creation', { newProofUrl: proofFile });
    } catch (error) {
      const errorMsg = error.message || 'Failed to prepare proof for upload';
      console.error('Proof preparation error:', error);
      setProofError(errorMsg);
    } finally {
      setProofUploading(false);
    }
  };

  // Remove uploaded proof
  const handleRemoveProof = () => {
    setProofUrl(null);
    setProofPreview(null);
    setProofFile(null);
    setProofError(null);
  };


  const createOrderApi = async (orderData) => {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authorization header only if user is logged in
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || responseData.error || 'Failed to create order');
    }
    return responseData;
  };

  const {
    mutate,
    isPending: isLoading,
    isSuccess,
    error: orderError,
  } = useMutation({
    mutationFn: createOrderApi,
    onSuccess: async (orderResponse) => {
      try {
        // Upload payment proof if Bank Transfer is selected
        if (paymentMethod === 'Bank Transfer' && proofUrl && orderResponse.order._id) {
          await uploadPaymentProof(orderResponse.order._id, proofUrl, token);
          console.log('Payment proof uploaded successfully for order', orderResponse.order._id);
        }
      } catch (proofUploadError) {
        console.error('Failed to upload payment proof to backend:', proofUploadError);
        // Don't prevent order success, but log the error
      }

      // ensure submitting flag is reset
      setIsSubmitting(false);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });

      navigate('/app/ordersuccess', {
        state: { orderId: orderResponse.order._id, orderNumber: orderResponse.order.orderNumber},
      });
    },
    onError: (err) => {
      console.error("Checkout mutation error:", err.message);
      // Reset submitting state on error
      setIsSubmitting(false);
    },
  });

  // Local submitting state to ensure button shows spinner reliably across react-query transitions
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!shippingAddress.fullName.trim()) errors.fullName = 'Full Name is required.';
    if (!paymentMethod) errors.paymentMethod = 'Please choose a payment method.';
    if (deliveryLocations.length > 0 && !selectedDeliveryLocation) errors.deliveryLocation = 'Please select a delivery location.';
    if (!shippingAddress.email.trim()) errors.email = 'Email is required for order notifications.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (shippingAddress.email && !emailRegex.test(shippingAddress.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!shippingAddress.address1.trim()) errors.address1 = 'Address Line 1 is required.';
    if (!shippingAddress.city.trim()) errors.city = 'City is required.';
    if (!shippingAddress.phone.trim()) errors.phone = 'Phone is required.';
    if (!shippingAddress.state.trim()) errors.state = 'State/Region is required.';
    if (!shippingAddress.country.trim()) errors.country = 'Country is required.';

    // Validate Bank Transfer proof upload
    if (paymentMethod === 'Bank Transfer' && !proofUrl) {
      console.warn('Bank Transfer selected but no proof URL', { paymentMethod, proofUrl });
      errors.proof = 'Payment proof is required for Bank Transfer. Please upload your proof of payment.';
    } else if (paymentMethod === 'Bank Transfer' && proofUrl) {
      console.log('Bank Transfer with valid proof', { proofUrl, isFile: proofUrl instanceof File });
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      errors.cart = 'Your cart is empty. Please add items to proceed.';
    } else {
        // Validate each item in the cart to ensure productId is valid
        const hasInvalidProductData = cart.items.some(item => {
            const currentProductId = (typeof item.productId === 'object' && item.productId !== null)
                                    ? item.productId._id
                                    : item.productId;
            return !currentProductId; // Checks for null, undefined, or empty string (if it becomes string)
        });

        if (hasInvalidProductData) {
            errors.cartItems = 'Some items in your cart have invalid product data (missing ID). Please review and re-add them.';
        }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCheckout = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Filter out items that have invalid productId before sending to backend
    // This is a defensive measure; the ideal fix is to prevent them from entering the cart.
    const validOrderItems = cart.items.map(item => {
        let pId;
        if (typeof item.productId === 'object' && item.productId !== null && item.productId._id) {
            pId = item.productId._id;
        } else if (typeof item.productId === 'string') {
            pId = item.productId;
        } else {
            // This item has an invalid productId, return null to filter it out
            return null;
        }

        return {
            productId: pId,
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price),
            image: item.image,
        };
    }).filter(item => item !== null); // Filter out null items

    if (validOrderItems.length === 0) {
        setValidationErrors(prev => ({ ...prev, cartItems: 'Your cart contains no valid products after filtering. Please add valid items.' }));
        return;
    }

    // Prices, shipping and totals are calculated by the server from the database;
    // the totals shown on this page are only an estimate for the customer.
    // Card details are never sent to our server.
    const orderData = {
      orderItems: validOrderItems.map(({ productId, name, quantity }) => ({ productId, name, quantity })),
      shippingAddress: shippingAddress,
      paymentMethod,
      deliveryLocationId: selectedDeliveryLocation,
      bankReference: paymentMethod === 'Bank Transfer' ? bankReference : undefined,
    };

    setIsSubmitting(true);
    mutate(orderData);
  };

  const fieldClass = (name) =>
    `w-full h-12 px-4 rounded-xl border bg-white text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-4 transition ${
      validationErrors[name] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-line focus:border-plum-400 focus:ring-plum-100'
    }`;

  const renderField = (name, label, props = {}) => (
    <div className={props.wide ? 'md:col-span-2' : ''}>
      <label htmlFor={name} className="block text-sm font-medium text-ink mb-1.5">
        {label}{props.optional ? <span className="text-ink-soft font-normal"> (optional)</span> : ''}
      </label>
      <input
        id={name}
        name={name}
        type={props.type || 'text'}
        value={shippingAddress[name] || ''}
        onChange={handleShippingChange}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        required={!props.optional}
        aria-invalid={Boolean(validationErrors[name])}
        className={fieldClass(name)}
      />
      {validationErrors[name] && <p className="mt-1.5 text-sm text-red-600">{validationErrors[name]}</p>}
    </div>
  );

  const stepTitle = (number, title) => (
    <h2 className="flex items-center gap-3 font-display text-xl md:text-2xl font-semibold text-ink mb-5">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-plum-600 text-white text-sm font-sans font-semibold">{number}</span>
      {title}
    </h2>
  );

  const pageHeader = <PageHeader title="Checkout" crumbs={[{ label: 'Cart', to: '/app/cart' }, { label: 'Checkout' }]} />;

  if (cartLoading && !cart) {
    return (
      <>
        {pageHeader}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid lg:grid-cols-[1fr_400px] gap-8" aria-busy="true">
          <div className="h-[32rem] rounded-3xl bg-cream animate-pulse" />
          <div className="h-80 rounded-3xl bg-cream animate-pulse" />
        </div>
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        {pageHeader}
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </span>
          <h2 className="font-display text-3xl font-semibold text-ink">Order placed</h2>
          <p className="mt-2 text-ink-soft">Thank you! Taking you to your order confirmation…</p>
        </div>
      </>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <>
        {pageHeader}
        <div className="max-w-xl mx-auto px-4 py-16 md:py-24 text-center">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-plum-50 text-plum-600 mb-5">
            <ShoppingBag className="w-8 h-8" strokeWidth={1.75} />
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Your cart is empty</h2>
          <p className="mt-2 text-ink-soft">Add items to your cart before checking out.</p>
          <Link to="/app/shop" className="mt-7 inline-flex rounded-full bg-plum-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-plum-700 transition">
            Start shopping
          </Link>
        </div>
      </>
    );
  }

  // WhatsApp order message
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '2348157574797';
  const orderLines = cart.items.map(item => `• ${item.name} x${item.quantity} = ${formatNaira(parseFloat(item.price) * item.quantity)}`);
  const addressLine = `Delivery address:\n${shippingAddress.fullName}\n${shippingAddress.address1}${shippingAddress.address2 ? ", " + shippingAddress.address2 : ""}\n${shippingAddress.city}, ${shippingAddress.state}\n${shippingAddress.country}${selectedLocation ? `\nDelivery location: ${selectedLocation.name}` : ''}\n\nNote: ${shippingAddress.note || 'None'}`;
  const contactLine = [shippingAddress.phone && `Phone: ${shippingAddress.phone}`, shippingAddress.email && `Email: ${shippingAddress.email}`].filter(Boolean).join('\n');
  const whatsappOrderMessage =
    `Hello Posh Choice, I would like to place an order:\n\n` +
    orderLines.join("\n") +
    `\n\nSubtotal: ${formatNaira(subtotal)}\nDelivery: ${formatNaira(estimatedShipping)}\nTotal: ${formatNaira(totalAmount)}\n\n${addressLine}` +
    (contactLine ? `\n\n${contactLine}` : '');

  const generalErrors = [validationErrors.cart, validationErrors.cartItems, validationErrors.locations, validationErrors.deliveryLocation, validationErrors.paymentMethod].filter(Boolean);
  const hasFieldErrors = Object.values(validationErrors).some(Boolean);

  const paymentOptions = [
    { value: 'Bank Transfer', title: 'Bank transfer', text: 'Transfer to our account and upload your receipt.', icon: Landmark },
    { value: 'WhatsApp', title: 'Order on WhatsApp', text: 'Confirm your order and payment with us on WhatsApp.', icon: MessageCircle },
  ];

  return (
    <>
      {pageHeader}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Delivery notice */}
          <div className="mb-8 rounded-2xl border border-gold/40 bg-gold-soft/60 p-5 md:p-6 flex gap-4">
            <Info className="w-5 h-5 text-[#8a6a1f] shrink-0 mt-0.5" />
            <div className="text-sm text-ink">
              <p className="font-semibold">Delivery information</p>
              <p className="mt-1 text-ink-soft">
                The delivery fee shown is a flat rate. If your item is bulky, we'll call you to settle the balance.
              </p>
              <ul className="mt-3 grid sm:grid-cols-3 gap-2 text-ink-soft">
                <li><span className="font-medium text-ink">Within Lagos:</span> 24–48 hours</li>
                <li><span className="font-medium text-ink">South West &amp; South East:</span> 1–2 working days</li>
                <li><span className="font-medium text-ink">North &amp; South South:</span> 3–5 working days</li>
              </ul>
            </div>
          </div>

          {(generalErrors.length > 0 || orderError) && (
            <div role="alert" className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="space-y-1">
                {orderError && <p><span className="font-semibold">We couldn't place your order.</span> {orderError.message}</p>}
                {generalErrors.map(msg => <p key={msg}>{msg}</p>)}
              </div>
            </div>
          )}
          {hasFieldErrors && generalErrors.length === 0 && !orderError && (
            <p role="alert" className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Please check the highlighted fields below.
            </p>
          )}

          <form onSubmit={handleSubmitCheckout} className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start" noValidate>
            <div className="space-y-10">
              {/* 1. Contact & delivery */}
              <div>
                {stepTitle(1, 'Contact & delivery address')}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {renderField('fullName', 'Full name', { autoComplete: 'name', wide: true })}
                  {renderField('email', 'Email address', { type: 'email', autoComplete: 'email', placeholder: 'For your order confirmation' })}
                  {renderField('phone', 'Phone number', { type: 'tel', autoComplete: 'tel', placeholder: 'e.g. 0801 234 5678' })}
                  {renderField('address1', 'Street address', { autoComplete: 'address-line1', wide: true })}
                  {renderField('address2', 'Apartment, landmark, etc.', { autoComplete: 'address-line2', optional: true, wide: true })}
                  {renderField('city', 'City', { autoComplete: 'address-level2' })}
                  {renderField('state', 'State', { autoComplete: 'address-level1' })}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-ink mb-1.5">Country</label>
                    <select id="country" name="country" value={shippingAddress.country} onChange={handleShippingChange} className={fieldClass('country')}>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="USA">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="deliveryLocation" className="block text-sm font-medium text-ink mb-1.5">Delivery location</label>
                    <select
                      id="deliveryLocation"
                      value={selectedDeliveryLocation || ''}
                      onChange={(e) => {
                        setSelectedDeliveryLocation(e.target.value);
                        setValidationErrors(prev => ({ ...prev, deliveryLocation: '' }));
                      }}
                      className={fieldClass('deliveryLocation')}
                    >
                      {deliveryLocations.length === 0 && <option value="">No delivery locations available</option>}
                      {deliveryLocations.map((location) => (
                        <option key={location._id} value={location._id}>
                          {location.name} ({formatNaira(location.shippingAmount)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="note" className="block text-sm font-medium text-ink mb-1.5">
                      Note for the seller <span className="text-ink-soft font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      rows="3"
                      value={shippingAddress.note}
                      onChange={handleShippingChange}
                      placeholder="Delivery instructions, preferred time, colour preferences…"
                      className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-ink-soft/70 focus:outline-none focus:border-plum-400 focus:ring-4 focus:ring-plum-100 transition"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Payment */}
              <div>
                {stepTitle(2, 'Payment')}
                <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Payment method">
                  {paymentOptions.map(option => {
                    const Icon = option.icon;
                    const selected = paymentMethod === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`relative flex gap-3 rounded-2xl border-2 p-4 cursor-pointer transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-plum-100 ${
                          selected ? 'border-plum-600 bg-plum-50/60' : validationErrors.paymentMethod ? 'border-red-300' : 'border-line hover:border-plum-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.value}
                          checked={selected}
                          onChange={() => {
                            setPaymentMethod(option.value);
                            setValidationErrors(prev => ({ ...prev, paymentMethod: '' }));
                          }}
                          className="sr-only"
                        />
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${selected ? 'bg-plum-600 text-white' : 'bg-cream text-plum-600'}`}>
                          <Icon className="w-5 h-5" strokeWidth={1.75} />
                        </span>
                        <span>
                          <span className="block font-semibold text-ink">{option.title}</span>
                          <span className="block text-sm text-ink-soft">{option.text}</span>
                        </span>
                        {selected && <Check className="absolute top-3 right-3 w-4 h-4 text-plum-600" />}
                      </label>
                    );
                  })}
                </div>
                {validationErrors.paymentMethod && <p className="mt-2 text-sm text-red-600">{validationErrors.paymentMethod}</p>}

                {paymentMethod === 'Bank Transfer' && (
                  <div className="mt-5 rounded-2xl border border-line bg-cream p-5 space-y-5">
                    <div>
                      <p className="text-sm font-semibold text-ink">Transfer {formatNaira(totalAmount)} to:</p>
                      <dl className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
                        <div className="rounded-xl bg-white border border-line p-3"><dt className="text-ink-soft text-xs">Bank</dt><dd className="font-semibold text-ink">Moniepoint</dd></div>
                        <div className="rounded-xl bg-white border border-line p-3"><dt className="text-ink-soft text-xs">Account number</dt><dd className="font-semibold text-ink tracking-wide">6974818482</dd></div>
                        <div className="rounded-xl bg-white border border-line p-3"><dt className="text-ink-soft text-xs">Account name</dt><dd className="font-semibold text-ink">Posh Choice Store</dd></div>
                      </dl>
                    </div>

                    <div>
                      <label htmlFor="bankReference" className="block text-sm font-medium text-ink mb-1.5">
                        Transfer reference <span className="text-ink-soft font-normal">(optional)</span>
                      </label>
                      <input
                        id="bankReference"
                        type="text"
                        value={bankReference}
                        onChange={e => setBankReference(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-plum-400 focus:ring-4 focus:ring-plum-100"
                        placeholder="e.g. the reference on your bank receipt"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-ink">Proof of payment</p>
                      <p className="text-xs text-ink-soft mt-0.5 mb-3">A screenshot or receipt of your transfer (JPEG, PNG, GIF or PDF, max 4MB).</p>

                      {!proofUrl ? (
                        <div className="space-y-3">
                          <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-plum-200 bg-white px-4 py-6 text-center cursor-pointer hover:bg-plum-50/50 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-plum-100">
                            <UploadCloud className="w-6 h-6 text-plum-600" />
                            <span className="text-sm font-semibold text-plum-700">Choose a file</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/gif,application/pdf"
                              onChange={handleProofFileChange}
                              className="sr-only"
                            />
                          </label>

                          {proofPreview && (
                            <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-line p-3">
                              {proofPreview.startsWith('📄') ? (
                                <span className="text-sm text-ink">{proofPreview}</span>
                              ) : (
                                <img src={proofPreview} alt="Selected proof of payment" className="h-14 w-14 object-cover rounded-lg" />
                              )}
                              <button
                                type="button"
                                onClick={() => { setProofFile(null); setProofPreview(null); }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-ink-soft hover:text-red-600 hover:bg-red-50"
                                aria-label="Remove selected file"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {proofFile && !proofUrl && (
                            <button
                              type="button"
                              onClick={handleProofUpload}
                              disabled={proofUploading}
                              className="w-full h-11 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink/90 disabled:opacity-60 transition inline-flex items-center justify-center gap-2"
                            >
                              {proofUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              {proofUploading ? 'Preparing…' : 'Use this file'}
                            </button>
                          )}

                          {proofError && <p className="text-sm text-red-600">{proofError}</p>}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="text-sm">
                              <p className="font-semibold text-emerald-900">Proof ready</p>
                              <p className="text-emerald-800">
                                {proofUrl instanceof File ? `"${proofUrl.name}" will be sent with your order.` : 'Your payment proof has been received.'}
                              </p>
                            </div>
                          </div>
                          <button type="button" onClick={handleRemoveProof} className="text-sm font-medium text-emerald-900 underline underline-offset-2">
                            Change
                          </button>
                        </div>
                      )}

                      {validationErrors.proof && <p className="mt-2 text-sm text-red-600">{validationErrors.proof}</p>}
                    </div>
                  </div>
                )}

                {paymentMethod === 'WhatsApp' && (
                  <div className="mt-5 rounded-2xl border border-line bg-cream p-5">
                    <p className="text-sm text-ink-soft">
                      Place your order below, then send us your order details on WhatsApp to arrange payment.
                    </p>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappOrderMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#25D366] bg-white px-5 py-2.5 text-sm font-semibold text-[#128C4A] hover:bg-[#25D366]/10 transition"
                    >
                      <MessageCircle className="w-4 h-4" /> Open WhatsApp with my order
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-28 rounded-3xl border border-line bg-cream p-6">
              <h2 className="font-display text-xl font-semibold text-ink">Order summary</h2>
              <ul className="mt-5 space-y-4 max-h-72 overflow-y-auto pr-1 pt-2">
                {cart.items.map((item, index) => (
                  <li key={`${item._id || item.name}-${index}`} className="flex items-center gap-3">
                    <span className="relative shrink-0">
                      <img
                        src={item.image || 'https://placehold.co/96x96/FAF8F5/4A5470?text=PC'}
                        alt=""
                        className="w-14 h-14 rounded-xl object-contain bg-white border border-line p-1"
                      />
                      <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-ink text-white text-[11px] font-semibold leading-5 text-center">
                        {item.quantity}
                      </span>
                    </span>
                    <span className="flex-1 min-w-0 text-sm text-ink line-clamp-2">{item.name}</span>
                    <span className="text-sm font-semibold text-ink whitespace-nowrap">{formatNaira(parseFloat(item.price) * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 pt-5 border-t border-line space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="font-semibold text-ink">{formatNaira(subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Delivery{selectedLocation ? ` (${selectedLocation.name})` : ''}</dt>
                  <dd className="font-semibold text-ink">{formatNaira(estimatedShipping)}</dd>
                </div>
              </dl>
              <div className="mt-5 pt-5 border-t border-line flex justify-between items-baseline">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-2xl font-bold text-ink">{formatNaira(totalAmount)}</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="mt-6 w-full h-12 rounded-full bg-plum-600 text-white font-semibold hover:bg-plum-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {(isLoading || isSubmitting) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {(isLoading || isSubmitting) ? 'Placing order…' : 'Place order'}
              </button>
              <p className="mt-4 text-xs text-ink-soft text-center">
                Final prices and delivery are confirmed when you place the order.
              </p>
            </aside>
          </form>
        </div>
      </section>
    </>
  );
};

export default CheckoutMain;
