import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import DeliveryLocationManager from '../components/admin/DeliveryLocationManager';


function DeliveryLocation() {
  return (
    <>
    <Helmet>
        <title>Delivery Location - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Delivery locations">
        <DeliveryLocationManager />
    </DashboardLayout>
    </>
  )
}

export default DeliveryLocation;