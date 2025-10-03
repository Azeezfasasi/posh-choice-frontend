import { Link } from 'react-router-dom';
import { Badge } from 'rsuite';
import mycarticon from '../../images/mycarticon.svg'; 
import { useCart } from '../../context-api/cart/UseCart';

function CartIcon() {
  const { cart, loading } = useCart(); 

  // Calculate the total number of items in the cart
  const itemCount = loading ? null : (cart?.items?.length || 0);

  return (
    <>
      {/* For larger screens (hidden on small, shown on large) */}
      <Link to="/app/cart" className='hidden lg:block relative'>
        <Badge content={itemCount > 0 ? itemCount : null} className=''>
          <img src={mycarticon} alt="Shopping Cart" className='w-10 h-10 pt-1' />
        </Badge>
      </Link>

      {/* For smaller screens (shown on small, hidden on large) */}
      <Link to="/app/cart" className='lg:hidden block relative mt-1'>
        <Badge content={itemCount > 0 ? itemCount : null}>
          <img src={mycarticon} alt="Shopping Cart" className='w-8 h-8' />
        </Badge>
      </Link>
    </>
  );
}

export default CartIcon;
