import { Link } from 'react-router-dom';
import heart from '../../images/heart.svg'; 

function WishlistIcon() {
  return (
    <>
      {/* For larger screens (hidden on small, shown on large) */}
      <Link to="/app/wishlist" className='hidden lg:block relative'>
          <img src={heart} alt="wishlist" className='w-10 h-10 pt-1' />
      </Link>

      {/* For smaller screens (shown on small, hidden on large) */}
      <Link to="/app/wishlist" className='lg:hidden block relative'>
        <img src={heart} alt="wishlist" className='w-8 h-8' />
      </Link>
    </>
  );
}

export default WishlistIcon;
