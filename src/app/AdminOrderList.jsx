import React from 'react'
import ProductForm from '../assets/components/product/ProductForm'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import UserOrderDetailsMain from '../assets/components/product/UserOrderDetailsMain'
import AdminAllOrderMain from '../assets/components/product/AdminAllOrderMain'

function AdminOrderList() {
  return (
    <>
    <Helmet>
        <title>All Orders - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Orders">
        <AdminAllOrderMain />
    </DashboardLayout>
    </>
  )
}

export default AdminOrderList;