import React from 'react'
import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout'
import DashboardHome from '../assets/components/dashboard-components/DashboardHome'

function Dashboard() {
  return (
    <>
    <Helmet>
        <title>Dashboard - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Dashboard">
      <DashboardHome />
    </DashboardLayout>
    </>
  )
}

export default Dashboard
