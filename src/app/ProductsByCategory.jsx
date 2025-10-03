import React from 'react'
import { Helmet } from 'react-helmet'
import TopHeader from '../assets/components/TopHeader'
import MainHeader from '../assets/components/MainHeader'
import ProductsByCategoryMain from '../assets/components/product/ProductsByCategoryMain'
import Footer from '../assets/components/Footer'

function ProductsByCategory() {
  return (
    <>
    <Helmet>
      <title>Product By Category - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <ProductsByCategoryMain />
    <Footer />
    </>
  )
}

export default ProductsByCategory