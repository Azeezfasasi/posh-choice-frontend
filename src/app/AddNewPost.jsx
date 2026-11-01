import React from 'react'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import AddPost from '../assets/components/dashboard-components/AddPost'

function AddNewPost() {
  return (
    <>
    <Helmet>
        <title>Add New Post - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="New blog post">
        <AddPost />
    </DashboardLayout>
    </>
  )
}

export default AddNewPost