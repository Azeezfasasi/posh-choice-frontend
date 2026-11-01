import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import SendNewsletterMain from '../assets/components/dashboard-components/SendNewsletterMain';

function SendNewsletter() {
  return (
    <>
    <Helmet>
        <title>Send Newsletter - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Send newsletter">
        <SendNewsletterMain />
    </DashboardLayout>
    </>
  )
}

export default SendNewsletter;