import React from 'react'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import CategoryList from '../assets/components/product/CategoryList'

function ProductCategories() {
  return (
    <>
    <Helmet>
        <title>Product Categories - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Categories">
        <CategoryList />
    </DashboardLayout>
    </>
  )
}

export default ProductCategories