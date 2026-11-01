import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import AllNewsletterMain from '../assets/components/dashboard-components/AllNewsletterMain';

function AllNewsletter() {
  return (
    <>
    <Helmet>
        <title>All Newsletters - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Newsletters">
        <AllNewsletterMain />
    </DashboardLayout>
    </>
  )
}

export default AllNewsletter;