import React from 'react';
import './App.css';
import { UserProvider } from './assets/context-api/user-context/UserProvider';
import { QuoteProvider } from './assets/context-api/QuoteProvider';
import { Routes, Route } from 'react-router-dom';
import Home from "./Home";
import AboutUs from './AboutUs';
import OurServices from './OurServices';
import QuoteRequest from './QuoteRequest';
import ContactUs from './ContactUs';
import ScrollToTop from './assets/components/ScrollToTop';
import Dashboard from './app/Dashboard';
import Login from './Login';
import Register from './Register';
import ForgetPassword from './ForgetPassword';
import PrivateRoutes from './assets/components/routes/PrivateRoutes';
import 'rsuite/dist/rsuite-no-reset.min.css';
import Quote from './app/Quote';
import { BlogProvider } from './assets/context-api/blog-context/BlogProvider';
import AddNewPost from './app/AddNewPost';
import BlogPosts from './app/BlogPosts';
import EditBlogPost from './app/EditBlogPost';
import Blog from './app/Blog';
import BlogDetails from './app/BlogDetails';
import Profile from './app/Profile';
import AllUsers from './app/AllUsers';
import AddNewUser from './app/AddNewUser';
import { Settings } from 'lucide-react';
import MySettings from './app/MySettings';
import ChangeUserPassword from './app/ChangeUserPassword';
import { ProductProvider } from './assets/context-api/product-context/ProductProvider';
import AddProduct from './app/AddProduct';
import ProductDetails from './app/ProductDetails';
import Products from './app/Products';
import ProductCategories from './app/ProductCategories';
import AddProductCategory from './app/AddProductCategory';
import Shop from './app/Shop';
import EditProduct from './app/EditProduct';
import Cart from './app/Cart';
import { CartProvider } from './assets/context-api/cart/CartProvider';
import Wishlist from './app/WishList';
import Checkout from './app/Checkout';
import OrderSuccess from './app/OrderSuccess';
import UserOrderDetails from './app/UserOrderDetails';
import AdminOrderList from './app/AdminOrderList';
import TrackOrder from './app/TrackOrder';
import UpdateProductDetails from './app/UpdateProductDetails';
import ViewOrderDetails from './app/ViewOrderDetails';
import ViewUserOrderDetails from './app/ViewUserOrderDetails';
import EditProductCategories from './app/EditProductCategories';
import SendNewsletter from './app/SendNewsletter';
import AllNewsletter from './app/AllNewsletter';
import NewsletterSubscribers from './app/NewsletterSubscribers';
import ProductsByCategory from './app/ProductsByCategory';

function App() {
  return (
    <>
      <UserProvider>
        <QuoteProvider>
          <BlogProvider>
            <ProductProvider>
              <CartProvider>
                <ScrollToTop />
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgetpassword" element={<ForgetPassword />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/aboutus" element={<AboutUs />} />
                  <Route path="/ourservices" element={<OurServices />} />
                  <Route path="/quoterequest" element={<QuoteRequest />} />
                  <Route path="/contactus" element={<ContactUs />} />
                  <Route path="/app/blog" element={<Blog />} />
                  <Route path="/app/shop" element={<Shop />} />
                  <Route path="/app/cart" element={<Cart />} />
                  <Route path="/app/productdetails/slug/:slug" element={<ProductDetails />} />
                  <Route path="/app/productsbycategory/slug/:slug" element={<ProductsByCategory />} />
                  <Route path="/app/blogdetails/:id" element={<BlogDetails />} />
                  <Route path="/app/trackorder" element={<TrackOrder />} />

                  {/* Private/protected routes */}
                  <Route element={<PrivateRoutes />}>
                    <Route path="/app/dashboard" element={<Dashboard />} />
                    <Route path="/app/quote" element={<Quote />} />
                    <Route path="/app/addnewpost" element={<AddNewPost />} />
                    <Route path="/app/blogposts" element={<BlogPosts />} />
                    <Route path="/app/editblogpost/:id" element={<EditBlogPost />} />
                    <Route path="/app/profile" element={<Profile />} />
                    <Route path="/app/allusers" element={<AllUsers />} />
                    <Route path="/app/addnewuser" element={<AddNewUser />} />
                    <Route path="/app/mysettings" element={<MySettings />} />
                    <Route path="/app/changeuserpassword" element={<ChangeUserPassword />} />
                    <Route path="/app/addproduct" element={<AddProduct />} />
                    <Route path="/app/products" element={<Products />} />
                    <Route path="/app/productcategories" element={<ProductCategories />} />
                    <Route path="/app/editproductcategories/:id" element={<EditProductCategories />} />
                    <Route path="/app/addproductcategory" element={<AddProductCategory />} />
                    <Route path="/app/editproduct/:id" element={<EditProduct />} />
                    <Route path="/app/checkout" element={<Checkout />} />
                    <Route path="/app/wishlist" element={<Wishlist />} />
                    <Route path="/app/ordersuccess" element={<OrderSuccess />} />
                    <Route path="/app/userorderdetails" element={<UserOrderDetails />} />
                    <Route path="/app/adminorderlist" element={<AdminOrderList />} />
                    <Route path="/app/vieworderdetails/:id" element={<ViewOrderDetails />} />
                    <Route path="/app/viewuserorderdetails/:id" element={<ViewUserOrderDetails />} />
                    <Route path="/app/sendnewsletter" element={<SendNewsletter />} />
                    <Route path="/app/allnewsletter" element={<AllNewsletter />} />
                    <Route path="/app/Newslettersubscribers" element={<NewsletterSubscribers />} />
                  </Route>
                </Routes>
              </CartProvider>
            </ProductProvider>
          </BlogProvider>
        </QuoteProvider>
      </UserProvider>
    </>
  );
}

export default App;