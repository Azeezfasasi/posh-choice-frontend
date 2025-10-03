import React from 'react'
import { Helmet } from 'react-helmet'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import ChangeUserPasswordMain from '../assets/components/dashboard-components/ChangeUserPasswordMain'

function ChangeUserPassword() {
  return (
    <>
    <Helmet>
        <title>Change User Password - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
        <ChangeUserPasswordMain />
      </div>
    </div>
    </>
  )
}

export default ChangeUserPassword