import React from 'react'
import { Helmet } from 'react-helmet'
import EditBlogPostMain from '../assets/components/dashboard-components/EditBlogPostMain'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'

function EditBlogPost() {
  return (
    <>
    <Helmet>
        <title>Posts - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
        <EditBlogPostMain />
      </div>
    </div>
    </>
  )
}

export default EditBlogPost