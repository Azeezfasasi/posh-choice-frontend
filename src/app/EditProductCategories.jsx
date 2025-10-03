import React from 'react'
import { Helmet } from 'react-helmet'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import ProductList from '../assets/components/product/ProductList'
import EditProductCategoriesMain from '../assets/components/product/EditProductCategoriesMain'

function EditProductCategories() {
  return (
    <>
    <Helmet>
        <title>Edit Category - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
        <EditProductCategoriesMain />
      </div>
    </div>
    </>
  )
}

export default EditProductCategories