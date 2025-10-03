import React from 'react'
import { Helmet } from 'react-helmet'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import CategoryForm from '../assets/components/product/CategoryForm'

function AddProductCategory() {
  return (
    <>
    <Helmet>
        <title>Add Product Category - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
        <CategoryForm />
      </div>
    </div>
    </>
  )
}

export default AddProductCategory