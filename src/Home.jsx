import {Helmet} from 'react-helmet'
import Footer from "./assets/components/Footer"
import MainHeader from "./assets/components/MainHeader"
import FeaturedProduct from "./assets/components/product/FeaturedProduct"
import RecentProduct from './assets/components/product/RecentProduct'
import TopHeader from "./assets/components/TopHeader"
import ShopByCategories from './assets/components/product/ShopByCategories'
import ProductHero from './assets/components/ProductHero'
import PlasticProducts from './assets/components/product/PlasticProducts'
import KitchenEquipmentProducts from './assets/components/product/KitchenEquipmentProducts'
import HouseholdPlasticsProducts from './assets/components/product/HouseholdPlasticsProducts'
import KitchenAppliancesProducts from './assets/components/product/KitchenAppliancesProducts'
import RecentlyViewedProducts from './assets/components/product/RecentlyViewedProducts'
import { SubscribePopUp } from './assets/components/SubscribePopUp'
import WhatsAppChat from './assets/components/WhatsAppChat'
import GiftItemsProducts from './assets/components/product/HouseholdPlasticsProducts'

function Home() {
  return (
    <>
    <Helmet>
      <title>Home - Posh Choice Store</title>
      <meta name="description" content="Posh Choice Store is a trusted eCommerce destination for high-quality souvenirs materials and household essentials. We offer a wide range of products including home decor, kitchenware, and personal care items to meet your everyday needs." />
    </Helmet>
    <SubscribePopUp />
    <TopHeader />
    <MainHeader />
    <ProductHero />
    <ShopByCategories />
    <FeaturedProduct />
    <RecentProduct />
    <KitchenEquipmentProducts />
    {/* <HouseholdPlasticsProducts /> */}
    <GiftItemsProducts />
    <KitchenAppliancesProducts />
    {/* <PlasticProducts /> */}
    <RecentlyViewedProducts />
    <Footer />
    <WhatsAppChat />
    </>
  )
}

export default Home