import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, QueryClient, useQueryClient } from '@tanstack/react-query';
import { useCart } from '../../context-api/cart/UseCart';
import { useUser } from '../../context-api/user-context/UseUser';
import { FaSpinner, FaShoppingCart, FaCheckCircle, FaExclamationCircle, FaUpload, FaTimes, FaCheck } from 'react-icons/fa';
import { API_BASE_URL } from '../../../config/api';
import { fetchDeliveryLocations } from '../../../services/deliveryLocationApi';
import { uploadPaymentProof } from '../../../services/orderApi';

const CheckoutMain = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { cart, loading: cartLoading, formatPrice, clearCart } = useCart();
  const { user, token } = useUser();
  const [showPaymentFields] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
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
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    note: '',
    country: 'Nigeria',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
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
        setShippingAddress(prev => ({ ...prev, fullName: user.name || '' }));
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

  const handlePaymentChange = useCallback((e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  // Handle proof file selection
  const handleProofFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  // Check if proof is ready (File object or URL string)
  const isProofReady = proofUrl && (proofUrl instanceof File || typeof proofUrl === 'string');

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
    isLoading,
    // isError,
    isSuccess,
    // error,
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

    if (showPaymentFields) {
      if (!paymentDetails.cardNumber.trim()) errors.cardNumber = 'Card Number is required.';
      if (!paymentDetails.expiryDate.trim()) errors.expiryDate = 'Expiry Date is required.';
      if (!paymentDetails.cvv.trim()) errors.cvv = 'CVV is required.';
      if (!paymentDetails.cardName.trim()) errors.cardName = 'Name on Card is required.';
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

    // Build paymentResult object based on payment method
    let paymentResult = {};
    if (paymentMethod === 'Bank Transfer') {
      paymentResult = { bankReference };
    } else if (paymentMethod === 'Credit/Debit Card') {
      paymentResult = { ...paymentDetails };
    } else if (paymentMethod === 'WhatsApp') {
      paymentResult = {
        whatsappMessage: `Order via WhatsApp: ${cart.items.map(item => `${item.name} x${item.quantity}`).join(', ')}`
      };
    }

    const orderData = {
      orderItems: validOrderItems, // Use the filtered valid order items
      shippingAddress: shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice: subtotal,
      taxPrice: taxAmount,
      shippingPrice: estimatedShipping,
      totalPrice: totalAmount,
    };

    setIsSubmitting(true);
    mutate(orderData);
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50 p-6 rounded-lg shadow-md">
        <FaSpinner className="animate-spin text-blue-500 text-4xl mr-3" />
        <p className="text-xl text-gray-700">Loading your cart for checkout...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white p-8 rounded-lg shadow-xl text-gray-700">
        <FaShoppingCart className="text-gray-400 text-6xl mb-6" />
        <h2 className="text-3xl font-bold mb-3">Your Cart is Empty</h2>
        <p className="text-lg text-center mb-6">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/app/shop"
          className="bg-purple-500 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start Shopping!
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-green-50 p-8 rounded-lg shadow-xl text-green-800">
        <FaCheckCircle className="text-green-500 text-7xl mb-6 animate-bounce" />
        <h2 className="text-4xl font-extrabold mb-4 text-center">Order Placed Successfully!</h2>
        <p className="text-lg text-center mb-8 max-w-md">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>
        <Link
          to="/app/orders"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          View Your Orders
        </Link>
        <Link
          to="/app/shop"
          className="mt-4 text-purple-500 hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // WhatsApp order message and number
  const whatsappNumber = "2348157574797"; // Posh Choice WhatsApp number
  const orderLines = cart.items.map(item => `• ${item.name} x${item.quantity} @ ${formatPrice(parseFloat(item.price))} = ${formatPrice(parseFloat(item.price) * item.quantity)}`);
  const subtotalLine = `Subtotal: ${formatPrice(subtotal)}`;
  const shippingLine = `Shipping: ${formatPrice(estimatedShipping)}`;
  const taxLine = `Tax (${taxRate * 100}%): ${formatPrice(taxAmount)}`;
  const totalLine = `Total: ${formatPrice(totalAmount)}`;
  const addressLine = `Shipping Address:\n${shippingAddress.fullName}\n${shippingAddress.address1}${shippingAddress.address2 ? ", " + shippingAddress.address2 : ""}\n${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zipCode}\n${shippingAddress.country}\n\nNOTE: ${shippingAddress.note || 'None'}`;
  const contactLine = user && user.email ? `Email: ${user.email}` : '';
  const whatsappOrderMessage =
    `I would like to place an order on Posh Choice:\n\n` +
    orderLines.join("\n") +
    `\n\n${subtotalLine}\n${shippingLine}\n${taxLine}\n${totalLine}\n\n${addressLine}` +
    (contactLine ? `\n${contactLine}` : '');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Checkout</h1>

      {/* Important Delivery Notice */}
      <div className="mb-8 p-6 bg-yellow-50 border-4 border-purple-400 rounded-lg shadow-md">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
            ⚠️ IMPORTANT DELIVERY INFORMATION
          </h3>
          
          <div className="text-gray-800 space-y-3">
            <p className="font-semibold text-red-600">
              Please note the waybill fee on the website is the flatrate. If your item is bulky, you will be called to balance up.
            </p>
            
            <div>
              <p className="font-bold text-gray-900 mb-2">PLEASE TAKE NOTE OF OUR DELIVERY TIMES BELOW:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Delivery within Lagos:</strong> 24-48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Delivery to South West & South East:</strong> 1-2 working days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Delivery to North & South South:</strong> 3-5 working days</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white shadow-lg rounded-lg p-6 space-y-8">

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                <input
                  type="text" id="fullName" name="fullName"
                  value={shippingAddress.fullName} onChange={handleShippingChange}
                  className={`w-full border ${validationErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                <input
                  type="email" id="email" name="email"
                  value={shippingAddress.email} onChange={handleShippingChange}
                  className={`w-full border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="your@email.com"
                  required
                />
                {validationErrors.email && <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                <input
                  type="tel" id="phone" name="phone"
                  value={shippingAddress.phone} onChange={handleShippingChange}
                  className={`w-full border ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="your phone number"
                  required
                />
                {validationErrors.phone && <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1*</label>
                <input
                  type="text" id="address1" name="address1"
                  value={shippingAddress.address1} onChange={handleShippingChange}
                  className={`w-full border ${validationErrors.address1 ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text" id="address2" name="address2"
                  value={shippingAddress.address2} onChange={handleShippingChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                <input
                  type="text" id="city" name="city"
                  value={shippingAddress.city} onChange={handleShippingChange}
                  className={`w-full border ${validationErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State / Region*</label>
                <input
                  type="text" id="state" name="state"
                  value={shippingAddress.state} onChange={handleShippingChange}
                  className={`w-full border ${validationErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country*</label>
                <select
                  id="country" name="country"
                  value={shippingAddress.country} onChange={handleShippingChange}
                  className={`w-full border ${validationErrors.country ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                >
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Others">Others</option>
                  {/* Add more countries as needed */}
                </select>
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">Additional Note (Optional) - <span className='text-purple-500'>You can add any additional information for the seller here.</span></label>
                <textarea name="note" id="note" onChange={handleShippingChange} placeholder='Write a message for the seller here.' className="w-full border border-gray-300'rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
            </div>

            {/* Delivery location */}
            <div className='mt-4 lg:mt-0'>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Delivery Location</h2>
              <div>
                <label htmlFor="deliveryLocation" className="block text-sm font-medium text-gray-700 mb-2">Select Delivery Location*</label>
                <select
                  id="deliveryLocation"
                  name="deliveryLocation"
                  value={selectedDeliveryLocation || ''}
                  onChange={(e) => setSelectedDeliveryLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-3 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
                  required
                >
                  {deliveryLocations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name} - ₦{location.shippingAmount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="WhatsApp"
                    checked={paymentMethod === 'WhatsApp'}
                    onChange={() => setPaymentMethod('WhatsApp')}
                    className="mr-2"
                  />
                  Order Via WhatsApp <i className="fa-brands fa-square-whatsapp ml-1 text-green-700 text-[20px]"></i>
                </label>
                {/* <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                    className="mr-2"
                  />
                  Pick Up <i className="fa-solid fa-truck-fast ml-1 text-[20px] text-purple-500"></i>
                </label> */}
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Bank Transfer"
                    checked={paymentMethod === 'Bank Transfer'}
                    onChange={() => setPaymentMethod('Bank Transfer')}
                    className="mr-2"
                  />
                  Bank Transfer <i className="fa-solid fa-money-bill-transfer ml-1 text-purple-500 text-[20px]"></i>
                </label>
              </div>

              {/* Bank Transfer Fields */}
              {paymentMethod === 'Bank Transfer' && (
                <div className="mt-4 border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Bank Transfer Details</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><b>Bank Name:</b> Monipoint</p>
                      <p><b>Account Number:</b> 6974818482</p>
                      <p><b>Account Name:</b> Posh Choice Store</p>
                      <p className="text-red-600 font-semibold mt-2">Total Amount to Transfer: ₦{totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Bank Reference Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Transfer Reference (optional)
                    </label>
                    <input
                      type="text"
                      value={bankReference}
                      onChange={e => setBankReference(e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your bank transfer reference"
                    />
                  </div>

                  {/* Proof of Payment Upload */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaUpload className="text-purple-500" /> Upload Proof of Payment
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Upload a screenshot or receipt of your successful bank transfer (JPEG, PNG, GIF, or PDF - Max 5MB)
                    </p>

                    {!proofUrl ? (
                      <div className="space-y-3">
                        {/* File Upload Input */}
                        <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 hover:bg-purple-50 transition">
                          <label className="cursor-pointer flex items-center justify-center gap-2">
                            <FaUpload className="text-purple-500 text-lg" />
                            <span className="text-purple-600 font-medium">Click to upload or drag and drop</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/gif,application/pdf"
                              onChange={handleProofFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* File Preview */}
                        {proofPreview && (
                          <div className="mt-3 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
                            {proofPreview.startsWith('📄') ? (
                              <span className="text-sm text-gray-700">{proofPreview}</span>
                            ) : (
                              <img src={proofPreview} alt="Preview" className="h-16 w-16 object-cover rounded" />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setProofFile(null);
                                setProofPreview(null);
                              }}
                              className="text-red-500 hover:text-red-700 transition"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}

                        {/* Upload Button */}
                        {proofFile && !proofUrl && (
                          <button
                            type="button"
                            onClick={handleProofUpload}
                            disabled={proofUploading}
                            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition flex items-center justify-center gap-2"
                          >
                            {proofUploading ? (
                              <>
                                <FaSpinner className="animate-spin" /> Preparing...
                              </>
                            ) : (
                              <>
                                <FaCheck /> Click here to Confirm Proof
                              </>
                            )}
                          </button>
                        )}

                        {/* Error Message */}
                        {proofError && (
                          <div className="p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                            <FaExclamationCircle /> {proofError}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Proof Ready or Uploaded */
                      <div className="p-4 bg-green-100 border border-green-300 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaCheck className="text-green-600 text-xl" />
                          <div>
                            <p className="text-green-800 font-semibold">
                              {proofUrl instanceof File ? 'Proof Ready for Upload!' : 'Proof Uploaded Successfully!'}
                            </p>
                            <p className="text-green-700 text-sm">
                              {proofUrl instanceof File 
                                ? `File "${proofUrl.name}" will be uploaded when you place the order.`
                                : 'Your payment proof has been received by our team.'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveProof}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Error Message for Missing Proof */}
                  {validationErrors.proof && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                      <FaExclamationCircle /> {validationErrors.proof}
                    </div>
                  )}
                </div>
              )}

              {/* Credit/Debit Card Fields */}
              {paymentMethod === 'Credit/Debit Card' && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number*</label>
                      <input
                        type="text" id="cardNumber" name="cardNumber"
                        value={paymentDetails.cardNumber} onChange={handlePaymentChange}
                        className={`w-full border ${validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="XXXX XXXX XXXX XXXX"
                        maxLength="19"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (MM/YY)*</label>
                      <input
                        type="text" id="expiryDate" name="expiryDate"
                        value={paymentDetails.expiryDate} onChange={handlePaymentChange}
                        className={`w-full border ${validationErrors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV*</label>
                      <input
                        type="text" id="cvv" name="cvv"
                        value={paymentDetails.cvv} onChange={handlePaymentChange}
                        className={`w-full border ${validationErrors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="XXX"
                        maxLength="4"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Name on Card*</label>
                      <input
                        type="text" id="cardName" name="cardName"
                        value={paymentDetails.cardName} onChange={handlePaymentChange}
                        className={`w-full border ${validationErrors.cardName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Fields */}
              {paymentMethod === 'WhatsApp' && (
                <div className="mt-4">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappOrderMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Complete Purchase via WhatsApp
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    Clicking the button will open WhatsApp with your order details.
                  </p>
                </div>
              )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white shadow-lg rounded-lg p-6 h-fit sticky top-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Order Summary</h2>

          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {cart.items.map((item, index) => {
                // Helper to derive a stable string key for each cart item
                const getItemKey = (it, idx) => {
                  if (!it) return `item-${idx}`;
                  const pid = it.productId;
                  if (typeof pid === 'string' && pid.trim()) return String(pid);
                    if (pid && typeof pid === 'object') {
                    if (pid._id) return String(pid._id);
                    if (pid.id) return String(pid.id);
                    if (pid.slug) return String(pid.slug);
                    try { return JSON.stringify(pid); } catch { return `${it.name || 'unknown'}-${idx}`; }
                  }
                  return `${it.name || 'unknown'}-${idx}`;
                };

                const itemKey = getItemKey(item, index) + `-${index}`; // append index to guarantee uniqueness
                return (
                  <div key={itemKey} className="flex items-center justify-between text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <img
                        src={item.image || '/placehold.co/50x50/CCCCCC/000000?text=No+Image'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <span>
                        {item.name} <span className="text-gray-500">x {item.quantity}</span>
                      </span>
                    </div>
                    <span>{formatPrice(parseFloat(item.price) * item.quantity)}</span>
                  </div>
                );
            })}
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-3">
            <div className="flex justify-between text-lg text-gray-700">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-lg text-gray-700">
              <span>Shipping:</span>
              <span>{formatPrice(estimatedShipping)}</span>
            </div>
            <div className="flex justify-between text-lg text-gray-700">
              <span>Tax ({taxRate * 100}%):</span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 border-t border-gray-300 pt-3 mt-3">
              <span>Order Total:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full mt-8 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-md text-center transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {(isLoading || isSubmitting) ? (
              <>
                <FaSpinner className="animate-spin" /> Processing...
              </>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutMain;
