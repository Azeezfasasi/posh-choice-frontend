import React from 'react'
import ProductForm from '../assets/components/product/ProductForm'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';

function AddProduct() {
  return (
    <>
    <Helmet>
        <title>Add Products - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Add product">
        <ProductForm />
    </DashboardLayout>
    </>
  )
}

export default AddProduct