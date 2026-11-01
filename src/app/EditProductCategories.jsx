import React from 'react'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import ProductList from '../assets/components/product/ProductList'
import EditProductCategoriesMain from '../assets/components/product/EditProductCategoriesMain'

function EditProductCategories() {
  return (
    <>
    <Helmet>
        <title>Edit Category - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Edit category">
        <EditProductCategoriesMain />
    </DashboardLayout>
    </>
  )
}

export default EditProductCategories