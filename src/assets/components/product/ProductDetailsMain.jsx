import { useEffect, useState, useContext } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ProductContext } from '../../context-api/product-context/ProductContext';
import { UserContext } from '../../context-api/user-context/UserContext';
import { useCart } from '../../context-api/cart/UseCart';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaHeart, FaShare, FaTags, FaSpinner, FaExpand } from 'react-icons/fa';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import whatsapp from '../../images/whatsapp.svg';

const ProductDetailsMain = () => {
  const { slug } = useParams();
  const {
    product,
    loading: productLoading, // Renamed to avoid conflict
    error: productError,     // Renamed to avoid conflict
    fetchProductBySlug,
    // formatPrice: productFormatPrice, 
    // calculateSalePrice: productCalculateSalePrice, 
    addProductReview,
  } = useContext(ProductContext);

  const { user } = useContext(UserContext); // Assuming useUser provides 'user'

  const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';

  function addToRecentlyViewed(product) {
    if (!product) return;
    let viewed = [];
    try {
      viewed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
    } catch {
      viewed = [];
    }
    // Remove if already exists
    viewed = viewed.filter(p => p._id !== product._id);
    // Add to front
    viewed.unshift(product);
    // Limit to 10
    if (viewed.length > 10) viewed = viewed.slice(0, 10);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewed));
  }

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product]);

  // Use the useCart hook
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    wishlist, // Get wishlist state to check if product is in it
    loading: cartLoading,  // Renamed to avoid conflict
    error: cartError,      // Renamed to avoid conflict
    success: cartSuccess,  // Renamed to avoid conflict
    formatPrice,           // Use the formatPrice from CartContext if it's universal
    calculateSalePrice     // Use the calculateSalePrice from CartContext if it's universal
  } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showNotification, setShowNotification] = useState(false); // State for notification
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Auto-hide notification
  useEffect(() => {
    if (cartSuccess || cartError) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [cartSuccess, cartError]);


  useEffect(() => {
    fetchProductBySlug(slug);
  }, [slug, fetchProductBySlug]);

  // Reset selected image and quantity when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1); // Reset quantity when a new product is loaded
    }
  }, [product]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    // Ensure quantity doesn't exceed stock if product.stockQuantity is available
    if (!isNaN(value) && value > 0 && value <= (product?.stockQuantity || 999)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.stockQuantity || 999)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData({
      ...reviewData,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
        // Use a more subtle notification or redirect to login instead of alert()
        alert('Please log in to submit a review.');
        return;
    }
    if (product && reviewData.comment && reviewData.rating !== undefined && reviewData.rating !== null) {
      await addProductReview(product._id, reviewData);
      setReviewData({
        rating: 5,
        comment: ''
      });
      setShowReviewForm(false);
    } else {
        alert('Please provide both a rating and a comment for your review.');
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stockQuantity === 0) {
      setShowNotification(true); // show product error
      return;
    }
    // Pass slug, name, image, price to addToCart
    await addToCart(
      product._id,
      quantity,
      product.slug,
      product.name,
      product.images && product.images[0] ? product.images[0].url : '',
      product.price
    );
  };


  const handleToggleWishlist = async () => {
    const isInWishlist = wishlist?.products?.some(item => item.productId === product._id);
    if (isInWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    }

    return stars;
  };

  // Display loading spinner while fetching product details
  if (productLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-blue-500 text-4xl mr-3" />
        <p className="text-xl text-gray-700">Loading product details...</p>
      </div>
    );
  }

  // Display error message if fetching product failed
  if (productError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative min-h-[50vh] flex items-center justify-center text-center">
        <strong className="font-bold mr-2">Error!</strong>
        <span className="block sm:inline">{productError}</span>
      </div>
    );
  }

  // Display "Product not found" if product is null after loading is complete and no error
  if (!product) {
    return (
      <div className="text-center py-8 min-h-[50vh] flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <p className="text-gray-600 mt-2">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/app/shop" className="mt-4 inline-block text-blue-600 hover:underline">
          Browse all products
        </Link>
      </div>
    );
  }

  const API_URL_BASE = import.meta.env.VITE_API_URL || '';

  // Determine if product is in wishlist
  const isInWishlist = wishlist?.products?.some(item => item.productId === product._id) || false;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Notification Popup */}
        {showNotification && (cartSuccess || cartError) && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white
            ${cartSuccess ? 'bg-green-500' : 'bg-red-500'} transition-opacity duration-500`}
            role="alert">
            {cartSuccess || cartError}
          </div>
        )}

        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link to="/app/shop" className="text-gray-500 hover:text-gray-700">Shop</Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden relative">
              {product.images && product.images.length > 0 && product.images[selectedImage]?.url ? (
                <>
                  <img
                    src={product.images[selectedImage].url.startsWith('http') ? product.images[selectedImage].url : `${API_URL_BASE}${product.images[selectedImage].url}`}
                    alt={product.name}
                    className="w-full h-[400px] md:h-[600px] object-center object-cover cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition"
                    title="View Fullscreen"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <FaExpand className="text-gray-700 text-lg" />
                  </button>
                  {/* (WhatsApp button moved below to the Add to Cart area) */}
                </>
              ) : (
                <img
                  src="/placehold.co/400x400/CCCCCC/000000?text=No+Image"
                  alt="No image available"
                  className="w-full h-full object-center object-cover"
                />
              )}
              {lightboxOpen && (
                <Lightbox
                  open={lightboxOpen}
                  close={() => setLightboxOpen(false)}
                  slides={product.images.map(img => ({ src: img.url.startsWith('http') ? img.url : `${API_URL_BASE}${img.url}` }))}
                  index={selectedImage}
                  on={{ view: ({ index }) => setSelectedImage(index) }}
                />
              )}
            </div>

            {/* Thumbnail Images - Made Scrollable */}
            {product.images && product.images.length > 1 && (
              <div className="flex flex-row gap-2 overflow-x-auto pb-2 scrollbar-thumb-rounded scrollbar-track-rounded scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-[70px] h-[70px] md:w-[100px] md:h-[100px] rounded-md overflow-hidden
                    ${selectedImage === index ? 'ring-2 ring-purple-500' : 'hover:opacity-75'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                  >
                    <img
                      src={image.url?.startsWith('http') ? image.url : `${API_URL_BASE}${image.url}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>

              {/* Category */}
              {product.category && (
                <p className="text-sm text-gray-500 mt-1">
                  Category: <Link to={`/app/productsbycategory/slug/${product.category.slug}`} className="text-purple-500 hover:underline">{product.category.name}</Link>
                </p>
              )}
              {/* /app/productsbycategory/slug/${cat.slug} */}

              {/* Ratings */}
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                </div>
                <span className="ml-2 text-gray-600 text-sm">
                  {product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mt-4">
              {product.onSale ? (
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(calculateSalePrice(product.price, product.discountPercentage))}
                  </p>
                  <p className="ml-3 text-lg text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </p>
                  {product.discountPercentage > 0 && (
                    <span className="ml-3 bg-red-100 text-red-700 px-2 py-1 text-xs font-medium rounded">
                      {product.discountPercentage}% OFF
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </p>
              )}

              {/* Stock Status */}
              <p className="mt-2 text-sm">
                Status: {' '}
                {product.stockQuantity > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({product.stockQuantity} available)</span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </p>
            </div>

            {/* Product attributes */}
            <div className="border-t border-b border-gray-200 py-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                {product.brand && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">Brand</dt>
                    <dd className="text-sm text-gray-900">{product.brand}</dd>
                  </>
                )}

                {product.sku && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">SKU</dt>
                    <dd className="text-sm text-gray-900">{product.sku}</dd>
                  </>
                )}

                {product.weight !== undefined && product.weight !== null && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">Weight</dt>
                    <dd className="text-sm text-gray-900">{product.weight} kg</dd>
                  </>
                )}

                {/* {(product.dimensions && (product.dimensions.length !== undefined || product.dimensions.width !== undefined || product.dimensions.height !== undefined)) && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                    <dd className="text-sm text-gray-900">
                      {(product.dimensions.length || 0)} × {(product.dimensions.width || 0)} × {(product.dimensions.height || 0)} cm
                    </dd>
                  </>
                )} */}
              </dl>
            </div>

            {/* Color and Size options */}
            <div className="space-y-4">
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Color</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    {product.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      ></div>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Size</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    {product.sizes.map((size, i) => (
                      <div
                        key={i}
                        className="px-3 py-1 border border-gray-300 rounded text-sm cursor-pointer hover:border-gray-500"
                      >
                        {size}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add to cart section */}
            {product.stockQuantity > 0 && (
              <div className="mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      type="button"
                      onClick={decrementQuantity}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      max={product.stockQuantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-12 text-center border-0 focus:ring-0 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={incrementQuantity}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity >= product.stockQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  {/* WhatsApp order link placed before Add to Cart */}
                  {(() => {
                    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '2348157574797';
                    const productUrl = `${window.location.origin}/app/product/${product.slug}`;
                    const unitPrice = formatPrice(product.price);
                    const totalPrice = formatPrice(product.price * quantity);
                    const buyerInfo = user && user.email ? `\nEmail: ${user.email}` : '';
                    const messageText = `I would like to order:%0A%0AProduct: ${product.name}%0AQuantity: ${quantity}%0AUnit Price: ${unitPrice}%0ATotal: ${totalPrice}%0A%0AProduct Link: ${productUrl}${buyerInfo}`;
                    const waLink = `https://wa.me/${whatsappNumber}?text=${messageText}`;
                    return (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border border-green-300 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 mb-2"
                        title="Order via WhatsApp"
                      >
                        <img src={whatsapp} alt="WhatsApp" className="h-4 w-4" />
                        Order Via WhatsApp
                      </a>
                    );
                  })()}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`flex-1 bg-purple-500 text-white px-6 py-3 rounded-md hover:bg-purple-600 flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer
                     ${(product.stockQuantity === 0 || cartLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={product.stockQuantity === 0 || cartLoading}
                  >
                    {cartLoading ? <FaSpinner className="animate-spin" /> : <FaShoppingCart />}
                    {cartLoading ? 'Adding...' : (product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart')}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`p-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${isInWishlist ? 'text-red-500 border-red-300 bg-red-50' : ''}`} 
                    title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    disabled={cartLoading}
                  >
                    <FaHeart />
                  </button>
                  
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center">
                  <FaTags className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.tags.map((tag, index) => (
                    <Link
                      key={index}
                      to={`/products?tag=${tag}`}
                      className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded hover:bg-gray-200"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <div className="text-lg font-medium text-gray-900 pb-2">Product Description</div>
          </div>

          <div className="mt-6 prose prose-sm max-w-none text-gray-500">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              // <p>{product.description}</p>
              <p dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }} />
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <div className="text-lg font-medium text-gray-900 pb-2">
              Customer Reviews ({product.numReviews})
            </div>
          </div>

          <div className="mt-6">
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {renderStars(review.rating)}
                      </div>
                      <div className="ml-2 font-medium">{review.name}</div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="mt-2 text-gray-800">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            )}

            {/* Add Review Button/Form */}
            <div className="mt-8">
              {showReviewForm ? (
                <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>

                  <div className="mb-4">
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <select
                      id="rating"
                      name="rating"
                      value={reviewData.rating}
                      onChange={handleReviewChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Good</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Review
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={reviewData.comment}
                      onChange={handleReviewChange}
                      rows="4"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Share your thoughts about this product"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-500 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-600 cursor-pointer"
                      disabled={!user}
                      title={!user ? "Log in to submit a review" : ""}
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 cursor-pointer"
                >
                  Write a Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailsMain;
