import { Helmet } from 'react-helmet'
import Footer from '../assets/components/Footer'
import TopHeader from '../assets/components/TopHeader'
import MainHeader from '../assets/components/MainHeader'
import WishlistMain from '../assets/components/dashboard-components/WishlistMain'
import RecentlyViewedProducts from '../assets/components/product/RecentlyViewedProducts'

function Wishlist() {
  return (
    <>
    <Helmet>
        <title>Wishlist - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <WishlistMain />
    <RecentlyViewedProducts />
    <Footer />
    </>
  )
}

export default Wishlist