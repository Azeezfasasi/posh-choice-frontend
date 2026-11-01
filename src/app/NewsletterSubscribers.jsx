import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import NewsletterSubscriberMain from '../assets/components/dashboard-components/NewsletterSubscriberMain';

function NewsletterSubscribers() {
  return (
    <>
    <Helmet>
        <title>Newsletter Subscribers - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Newsletter subscribers">
        <NewsletterSubscriberMain />
    </DashboardLayout>
    </>
  )
}

export default NewsletterSubscribers;