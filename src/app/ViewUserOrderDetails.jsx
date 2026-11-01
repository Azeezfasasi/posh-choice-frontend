import React from 'react'
import ProductForm from '../assets/components/product/ProductForm'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import ViewUserOrderDetailsMain from '../assets/components/product/ViewUserOrderDetailsMain'

function ViewUserOrderDetails() {
  return (
    <>
    <Helmet>
        <title>View Orders - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Order details">
        <ViewUserOrderDetailsMain />
    </DashboardLayout>
    </>
  )
}

export default ViewUserOrderDetails;