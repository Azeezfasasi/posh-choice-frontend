import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaClipboardList, FaShoppingCart } from 'react-icons/fa';
import TopHeader from '../assets/components/TopHeader';
import MainHeader from '../assets/components/MainHeader';
import Footer from '../assets/components/Footer';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  // Show order number (orderNumber) if available in location.state
  const orderNumber = location.state?.orderNumber;

  return (
    <>
    <TopHeader />
    <MainHeader />
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
        <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6 animate-bounce" />

        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Order Placed Successfully!
        </h1>

        <p className="text-lg text-gray-700 mb-6">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>

        <p className="text-lg text-gray-700 mb-6 font-semibold">
          <span className='font-semibold text-blue-600'>Order NO:</span> {orderNumber ? orderNumber : orderId ? orderId : <span className="text-gray-400">Not available</span>}
        </p>

        <p className="text-md text-gray-600 mb-8">
          A confirmation email with your order details has been sent to your registered email address.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/app/userorderdetails"
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            <FaClipboardList className="mr-2" /> View Your Orders
          </Link>


          <Link
            to="/app/shop"
            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            <FaShoppingCart className="mr-2" /> Continue Shopping
          </Link>
        </div>

      </div>
    </div>
    <Footer />
    </>
  );
};

export default OrderSuccess;
