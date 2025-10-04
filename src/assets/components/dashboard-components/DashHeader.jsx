import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import accountprofile from '../../images/accountprofile.svg';
import { useUser } from '../../context-api/user-context/UseUser';
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import DetailIcon from '@rsuite/icons/Detail';
import ListIcon from '@rsuite/icons/List';
import UserInfoIcon from '@rsuite/icons/UserInfo';
import PeoplesIcon from '@rsuite/icons/Peoples';
import GridIcon from '@rsuite/icons/Grid';
import TagIcon from '@rsuite/icons/Tag';
import MessageIcon from '@rsuite/icons/Message';
import GearIcon from '@rsuite/icons/Gear';
import { Sidenav, Nav } from 'rsuite';
import poshchoice2 from '../../images/poshchoice2.png';

function DashHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  // const [linkOpen, setLinkOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const {isSuperAdmin, isAdmin, isUser, isCustomer} = useUser()
  const location = useLocation();

  // Map route paths to eventKeys
  const menuKeyByPath = {
    '/app/dashboard': { key: '1', parent: null },
    '/app/adminorderlist': { key: '2', parent: null },
    '/app/products': { key: '3-1', parent: '3' },
    '/app/addproduct': { key: '3-2', parent: '3' },
    '/app/productcategories': { key: '3-3', parent: '3' },
    '/app/addproductcategory': { key: '3-4', parent: '3' },
    '/app/quote': { key: '4', parent: null },
    '/app/blogposts': { key: '5-1', parent: '5' },
    '/app/addnewpost': { key: '5-2', parent: '5' },
    '/app/sendnewsletter': { key: '6-1', parent: '6' },
    '/app/allnewsletter': { key: '6-2', parent: '6' },
    '/app/Newslettersubscribers': { key: '6-3', parent: '6' },
    '/app/allusers': { key: '7-1', parent: '7' },
    '/app/addnewuser': { key: '7-2', parent: '7' },
    '/app/changeuserpassword': { key: '7-3', parent: '7' },
    '/app/userorderdetails': { key: '8', parent: null },
    '/app/trackorder': { key: '9', parent: null },
    '/app/profile': { key: '10', parent: null },
    '/app/mysettings': { key: '11', parent: null },
  };
  // const activeKey = menuKeyByPath[location.pathname];
  // Normalize pathname to handle trailing slashes and query params
    const cleanPath = location.pathname.replace(/\/$/, '').split('?')[0];
    const routeInfo = menuKeyByPath[location.pathname] || menuKeyByPath[cleanPath];
    const activeKey = routeInfo ? routeInfo.key : null;
    // Compute defaultOpenKeys for Sidenav
    let defaultOpenKeys = [];
    if (routeInfo) {
        if (routeInfo.parent) {
            defaultOpenKeys = [routeInfo.parent];
        } else if (Object.values(menuKeyByPath).some(info => info.parent === routeInfo.key)) {
            defaultOpenKeys = [routeInfo.key];
        }
    }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.profile-dropdown')) setProfileMenuOpen(false);
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileMenuOpen]);

  return (
    <div className="bg-white py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-50 border-b border-solid border-gray-500">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <img
          src={poshchoice2}
          alt="logo image"
          className='w-[90px] h-[40px] md:w-[120px] md:h-[60px]'
        />
        {/* <h2 className='text-xl font-bold text-purple-500'>Posh Choice Store</h2> */}
      </Link>

      {/* Hamburger Icon (Mobile) */}
      <div className="lg:hidden flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-2 ml-4 relative profile-dropdown">
          <div className="relative">
            <img
              src={accountprofile}
              alt="profile"
              className="w-8 h-8 rounded-full border cursor-pointer"
              onClick={() => setProfileMenuOpen((open) => !open)}
            />
            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute top-10 right-[-150px] mt-2 w-44 bg-white border border-solid border-gray-300 rounded shadow-lg z-50 animate-fade-in">
                <Link to="/app/dashboard" className="block px-4 py-2 hover:bg-gray-100 text-[#0A1F44]" onClick={() => setProfileMenuOpen(false)}>Dashboard</Link>
                {(user?.role === 'admin' || user?.role === 'super admin') && (
                  <Link to="/app/products" className="block px-4 py-2 hover:bg-gray-100 text-[#0A1F44]" onClick={() => setProfileMenuOpen(false)}>All Products</Link>
                )}
                {(user?.role === 'admin' || user?.role === 'super admin') && (
                  <Link to="/app/adminorderlist" className="block px-4 py-2 hover:bg-gray-100 text-[#0A1F44]" onClick={() => setProfileMenuOpen(false)}>Manage Orders</Link>
                )}
                {user?.role === 'customer' && (
                <Link to="/app/userorderdetails" className="block px-4 py-2 hover:bg-gray-100 text-[#0A1F44]" onClick={() => setProfileMenuOpen(false)}>My Orders</Link>
                )}
                <Link to="/app/profile" className="block px-4 py-2 hover:bg-gray-100 text-[#0A1F44]" onClick={() => setProfileMenuOpen(false)}>Profile</Link>                
                <button
                  onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >Logout</button>
              </div>
            )}
          </div>
          <div className="flex flex-col text-xs cursor-pointer" onClick={() => setProfileMenuOpen((open) => !open)}>
            <span className="font-semibold">{user?.name || 'User'}</span>
            <span className="text-gray-500 capitalize">{user?.role}</span>
          </div>
        </div>
        <button
          className="lg:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-[#0A1F44] mb-1 transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block h-0.5 w-6 bg-[#0A1F44] mb-1 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block h-0.5 w-6 bg-[#0A1F44] transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Navigation */}
      <div className="hidden lg:flex space-x-6 font-medium text-[#0A1F44] items-center">
        <Link to="/">Home</Link>
        {user?.role === 'customer' && (
          <Link to="/app/wishlist">Wishlist</Link>
        )}
        {user?.role === 'customer' && (
          <Link to="/app/cart">Cart</Link>
        )}
        {user?.role === 'customer' && (
          <Link to="/app/trackorder">Track Orders</Link>
        )}
        {(user?.role === 'admin' || user?.role === 'super admin') && (
          <Link to="/app/products">All Products</Link>
        )}
        <Link to="/app/profile">Profile</Link>
        <div className="flex flex-row items-center gap-2 ml-4 relative profile-dropdown">
          <div className="relative">
            <img
              src={accountprofile}
              alt="profile"
              className="w-8 h-8 rounded-full border cursor-pointer"
              onClick={() => setProfileMenuOpen((open) => !open)}
            />
            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute top-10 right-[-90px] mt-2 w-44 bg-white border border-solid border-gray-300 rounded shadow-lg z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-solid border-gray-300">
                  <span className="font-semibold block">{user?.name || 'User'}</span>
                  <span className="text-gray-500 text-xs capitalize">{user?.role}</span>
                </div>
                <Link to="/app/dashboard" className="block px-4 py-2 hover:bg-gray-100 text-[#0A1F44]" onClick={() => setProfileMenuOpen(false)}>Dashboard</Link>
                {(user?.role === 'admin' || user?.role === 'super admin') && (
                  <Link to="/app/products" className="block px-4 py-2 hover:bg-gray-100 text-[#0A1F44]" onClick={() => setProfileMenuOpen(false)}>Manage Products</Link>
                )}
                <Link to="/app/profile" className="block px-4 py-2 hover:bg-gray-100 text-[#0A1F44]" onClick={() => setProfileMenuOpen(false)}>Profile</Link>
                {(user?.role === 'admin' || user?.role === 'super admin') && (
                  <Link to="/app/allusers" className="block px-4 py-2 hover:bg-gray-100 text-[#0A1F44]" onClick={() => setProfileMenuOpen(false)}>Users</Link>
                )}
                <Link to="/app/quote" className="block px-4 py-2 hover:bg-gray-100 text-[#0A1F44]" onClick={() => setProfileMenuOpen(false)}>Quotes</Link>
                <button
                  onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >Logout</button>
              </div>
            )}
          </div>
          <div className="flex flex-col text-xs cursor-pointer" onClick={() => setProfileMenuOpen((open) => !open)}>
            <span className="font-semibold">{user?.name || 'User'}</span>
            <span className="text-gray-500 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start pl-0 py-0 z-50 lg:hidden animate-fade-in border-b h-[600px] overflow-y-scroll overflow-x-hidden">
          <Sidenav defaultOpenKeys={defaultOpenKeys}>
            <Sidenav.Body>
                <Nav activeKey={activeKey}>
                    {(isSuperAdmin || isAdmin || isUser || isCustomer) && (
                    <Nav.Item eventKey="1" icon={<DashboardIcon />} as={Link} to="/app/dashboard">
                        Dashboard
                    </Nav.Item>
                    )}
                    {(isSuperAdmin || isAdmin) && (
                    <Nav.Item eventKey="2" icon={<TagIcon />} as={Link} to="/app/adminorderlist">
                        All Order 
                    </Nav.Item>
                    )}
                    {(isSuperAdmin || isAdmin) && (
                    <Nav.Menu eventKey="3" title="Product" icon={<GridIcon />}>
                        <Nav.Item eventKey="3-1" as={Link} to="/app/products">All Products</Nav.Item>
                        <Nav.Item eventKey="3-2" as={Link} to="/app/addproduct">Add Products</Nav.Item>
                        <Nav.Item eventKey="3-3" as={Link} to="/app/productcategories">Product Categories</Nav.Item>
                        <Nav.Item eventKey="3-4" as={Link} to="/app/addproductcategory">Add Product Category</Nav.Item>
                    </Nav.Menu>
                    )}
                    {(isSuperAdmin || isAdmin) && (
                    <Nav.Item eventKey="4" icon={<DetailIcon />} as={Link} to="/app/quote">
                        Quote Requests
                    </Nav.Item>
                    )}
                    {(isSuperAdmin || isAdmin) && (
                    <Nav.Menu eventKey="5" title="Blog Post" icon={<ListIcon />}>
                        <Nav.Item eventKey="5-1" as={Link} to="/app/blogposts">All Posts</Nav.Item>
                        <Nav.Item eventKey="5-2" as={Link} to="/app/addnewpost">Add New Post</Nav.Item>
                    </Nav.Menu>
                    )}
                    {(isSuperAdmin || isAdmin) && (
                    <Nav.Menu eventKey="6" title="Newsletter" icon={<MessageIcon />}>
                        <Nav.Item eventKey="6-1" as={Link} to="/app/sendnewsletter">Send Newsletter</Nav.Item>
                        <Nav.Item eventKey="6-2" as={Link} to="/app/allnewsletter">All Newsletters</Nav.Item>
                        <Nav.Item eventKey="6-3" as={Link} to="/app/Newslettersubscribers">Subscribers</Nav.Item>
                    </Nav.Menu>
                    )}
                    {(isSuperAdmin || isAdmin) && (
                    <Nav.Menu eventKey="7" title="Users" icon={<PeoplesIcon />}>
                        <Nav.Item eventKey="7-1" as={Link} to="/app/allusers">All Users</Nav.Item>
                        <Nav.Item eventKey="7-2" as={Link} to="/app/addnewuser">Add New User</Nav.Item>
                        <Nav.Item eventKey="7-3" as={Link} to="/app/changeuserpassword">Change User Password</Nav.Item>
                    </Nav.Menu>
                    )}
                    {(isUser || isCustomer) && (
                    <Nav.Item eventKey="8" icon={<TagIcon />} as={Link} to="/app/userorderdetails">
                        My Order
                    </Nav.Item>
                    )}
                    {(isUser || isCustomer) && (
                    <Nav.Item eventKey="9" icon={<TagIcon />} as={Link} to="/app/trackorder">
                        Track Your Orders
                    </Nav.Item>
                    )}
                    {(isSuperAdmin || isAdmin || isUser || isCustomer) && (
                    <Nav.Item eventKey="10" icon={<UserInfoIcon />} as={Link} to="/app/profile">
                        Profile
                    </Nav.Item>
                    )}
                </Nav>
            </Sidenav.Body>
          </Sidenav>
          <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="mt-4 ml-4 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition">Logout</button>
        </div>
      )}
    </div>
  );
}

export default DashHeader;