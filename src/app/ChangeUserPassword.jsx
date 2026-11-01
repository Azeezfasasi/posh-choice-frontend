import React from 'react'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import ChangeUserPasswordMain from '../assets/components/dashboard-components/ChangeUserPasswordMain'

function ChangeUserPassword() {
  return (
    <>
    <Helmet>
        <title>Change User Password - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Reset user password">
        <ChangeUserPasswordMain />
    </DashboardLayout>
    </>
  )
}

export default ChangeUserPassword