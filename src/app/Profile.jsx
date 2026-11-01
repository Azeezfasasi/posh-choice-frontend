import React from 'react'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import MyProfile from '../assets/components/dashboard-components/MyProfile'

function Profile() {
  return (
    <>
    <Helmet>
        <title>My Profile - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="My profile">
        <MyProfile />
    </DashboardLayout>
    </>
  )
}

export default Profile