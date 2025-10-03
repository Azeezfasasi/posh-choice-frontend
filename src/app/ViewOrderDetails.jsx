import React from 'react'
import ProductForm from '../assets/components/product/ProductForm'
import { Helmet } from 'react-helmet'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import AdminAllOrderMain from '../assets/components/product/AdminAllOrderMain'
import ViewOrderDetailsMain from '../assets/components/product/ViewOrderDetailsMain'

function ViewOrderDetails() {
  return (
    <>
    <Helmet>
        <title>View Orders - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
        <ViewOrderDetailsMain />
      </div>
    </div>
    </>
  )
}

export default ViewOrderDetails;