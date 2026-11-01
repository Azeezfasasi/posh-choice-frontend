import React from 'react'
import ProductForm from '../assets/components/product/ProductForm'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import UserOrderDetailsMain from '../assets/components/product/UserOrderDetailsMain'

function OrderDetails() {
  return (
    <>
    <Helmet>
        <title>My Orders - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="My orders">
        <UserOrderDetailsMain />
    </DashboardLayout>
    </>
  )
}

export default OrderDetails