import React from 'react'
import TopHeader from '../assets/components/TopHeader'
import MainHeader from '../assets/components/MainHeader'
import { Helmet } from 'react-helmet'
import ProductListForCustomers from '../assets/components/product/ProductListForCustomers'
import Footer from '../assets/components/Footer'
import RecentlyViewedProducts from '../assets/components/product/RecentlyViewedProducts'
import { SubscribePopUp } from '../assets/components/SubscribePopUp'

function Shop() {
  return (
    <>
    <Helmet>
        <title>Shop - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <ProductListForCustomers />
    <RecentlyViewedProducts />
    <Footer />
    <SubscribePopUp />
    </>
  )
}

export default Shop