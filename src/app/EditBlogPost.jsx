import React from 'react'
import { Helmet } from 'react-helmet'
import EditBlogPostMain from '../assets/components/dashboard-components/EditBlogPostMain'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';

function EditBlogPost() {
  return (
    <>
    <Helmet>
        <title>Posts - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Edit blog post">
        <EditBlogPostMain />
    </DashboardLayout>
    </>
  )
}

export default EditBlogPost