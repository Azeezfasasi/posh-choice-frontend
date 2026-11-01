import React from 'react'
import { Helmet } from 'react-helmet';
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import AllUserMain from '../assets/components/dashboard-components/AllUserMain';

function AllUsers() {
  return (
    <>
    <Helmet>
        <title>All Users - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Users">
        <AllUserMain />
    </DashboardLayout>
    </>
  )
}

export default AllUsers;