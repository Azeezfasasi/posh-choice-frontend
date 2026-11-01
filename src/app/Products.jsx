import React from 'react'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import ProductList from '../assets/components/product/ProductList'

function Products() {
  return (
    <>
    <Helmet>
        <title>Products - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Products">
        <ProductList />
    </DashboardLayout>
    </>
  )
}

export default Products