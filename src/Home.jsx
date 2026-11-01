import {Helmet} from 'react-helmet'
import Footer from "./assets/components/Footer"
import MainHeader from "./assets/components/MainHeader"
import FeaturedProduct from "./assets/components/product/FeaturedProduct"
import RecentProduct from './assets/components/product/RecentProduct'
import TopHeader from "./assets/components/TopHeader"
import ShopByCategories from './assets/components/product/ShopByCategories'
import ProductHero from './assets/components/ProductHero'
import CategoryProductRow from './assets/components/product/CategoryProductRow'
import RecentlyViewedProducts from './assets/components/product/RecentlyViewedProducts'
import TrustStrip from './assets/components/home/TrustStrip'
import QuoteBanner from './assets/components/home/QuoteBanner'
import { SubscribePopUp } from './assets/components/SubscribePopUp'
import WhatsAppChat from './assets/components/WhatsAppChat'

function Home() {
  return (
    <>
    <Helmet>
      <title>Posh Choice Store | Household Essentials, Kitchenware &amp; Gift Items</title>
      <meta name="description" content="Posh Choice Store is a trusted online store for quality household essentials, kitchenware, gift items and souvenirs, with bulk and custom orders for businesses and events." />
    </Helmet>
    <SubscribePopUp />
    <TopHeader />
    <MainHeader />
    <main>
      <ProductHero />
      <TrustStrip />
      <ShopByCategories />
      <FeaturedProduct />
      <RecentProduct />
      <QuoteBanner />
      <CategoryProductRow slug="kitchen-equipments" eyebrow="For the kitchen" title="Kitchen equipment" tone="cream" />
      <CategoryProductRow slug="gift-items" eyebrow="Gifts & souvenirs" title="Gift items" />
      <CategoryProductRow slug="kitchen-appliances" eyebrow="Appliances" title="Kitchen appliances" tone="cream" />
      <RecentlyViewedProducts />
    </main>
    <Footer />
    <WhatsAppChat />
    </>
  )
}

export default Home
