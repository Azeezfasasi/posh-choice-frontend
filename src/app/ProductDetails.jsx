import React from 'react'
import { Helmet } from 'react-helmet'
import ProductDetailsMain from '../assets/components/product/ProductDetailsMain'
import Footer from '../assets/components/Footer'
import TopHeader from '../assets/components/TopHeader'
import MainHeader from '../assets/components/MainHeader'
import RecentlyViewedProducts from '../assets/components/product/RecentlyViewedProducts'

function ProductDetails() {
  return (
    <>
    <Helmet>
        <title>Product Details - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <ProductDetailsMain />
    <RecentlyViewedProducts />
    <Footer />
    </>
  )
}

export default ProductDetails