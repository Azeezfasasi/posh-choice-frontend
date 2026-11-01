import React from 'react'
import ProductForm from '../assets/components/product/ProductForm'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import AdminAllOrderMain from '../assets/components/product/AdminAllOrderMain'
import ViewOrderDetailsMain from '../assets/components/product/ViewOrderDetailsMain'

function ViewOrderDetails() {
  return (
    <>
    <Helmet>
        <title>View Orders - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Order details">
        <ViewOrderDetailsMain />
    </DashboardLayout>
    </>
  )
}

export default ViewOrderDetails;