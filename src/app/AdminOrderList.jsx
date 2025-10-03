import React from 'react'
import ProductForm from '../assets/components/product/ProductForm'
import { Helmet } from 'react-helmet'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import UserOrderDetailsMain from '../assets/components/product/UserOrderDetailsMain'
import AdminAllOrderMain from '../assets/components/product/AdminAllOrderMain'

function AdminOrderList() {
  return (
    <>
    <Helmet>
        <title>All Orders - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
        <AdminAllOrderMain />
      </div>
    </div>
    </>
  )
}

export default AdminOrderList;