import React from 'react'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import AddNewUserMain from '../assets/components/dashboard-components/AddNewUserMain'

function AddNewUser() {
  return (
    <>
    <Helmet>
        <title>Add User - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Add user">
        <AddNewUserMain />
    </DashboardLayout>
    </>
  )
}

export default AddNewUser