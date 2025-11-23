import { Sidenav, Nav } from 'rsuite';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import DetailIcon from '@rsuite/icons/Detail';
import ListIcon from '@rsuite/icons/List';
import UserInfoIcon from '@rsuite/icons/UserInfo';
import PeoplesIcon from '@rsuite/icons/Peoples';
import GridIcon from '@rsuite/icons/Grid';
import TagIcon from '@rsuite/icons/Tag';
import MessageIcon from '@rsuite/icons/Message';
import GearIcon from '@rsuite/icons/Gear';
import { useUser } from '../../context-api/user-context/UseUser';

function DashMenu() {
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
    '/app/delivery-location': { key: '3-5', parent: '3' },
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
//   const activeKey = menuKeyByPath[location.pathname];
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

  return (
    <>
    <div style={{ width: 240 }} className='hidden lg:block'>
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
                        <Nav.Item eventKey="3-5" as={Link} to="/app/delivery-location">Delivery Location</Nav.Item>
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
    </div>
    </>
  )
}

export default DashMenu