import { Helmet } from 'react-helmet'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import DeliveryLocationManager from '../components/admin/DeliveryLocationManager';


function DeliveryLocation() {
  return (
    <>
    <Helmet>
        <title>Delivery Location - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
        <DeliveryLocationManager />
      </div>
    </div>
    </>
  )
}

export default DeliveryLocation;