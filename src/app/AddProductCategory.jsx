import React from 'react'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import CategoryForm from '../assets/components/product/CategoryForm'

function AddProductCategory() {
  return (
    <>
    <Helmet>
        <title>Add Product Category - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Add category">
        <CategoryForm />
    </DashboardLayout>
    </>
  )
}

export default AddProductCategory