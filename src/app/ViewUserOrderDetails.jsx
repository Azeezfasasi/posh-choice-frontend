import React from 'react'
import ProductForm from '../assets/components/product/ProductForm'
import { Helmet } from 'react-helmet'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import ViewUserOrderDetailsMain from '../assets/components/product/ViewUserOrderDetailsMain'

function ViewUserOrderDetails() {
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
        <ViewUserOrderDetailsMain />
      </div>
    </div>
    </>
  )
}

export default ViewUserOrderDetails;