import React from 'react'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import BlogPostMain from '../assets/components/dashboard-components/BlogPostMain'

function BlogPosts() {
  return (
    <>
    <Helmet>
        <title>Posts - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Blog posts">
        <BlogPostMain />
    </DashboardLayout>
    </>
  )
}

export default BlogPosts