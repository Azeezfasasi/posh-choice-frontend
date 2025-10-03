import { Helmet } from 'react-helmet'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import NewsletterSubscriberMain from '../assets/components/dashboard-components/NewsletterSubscriberMain';

function NewsletterSubscribers() {
  return (
    <>
    <Helmet>
        <title>Newsletter Subscribers - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
        <NewsletterSubscriberMain />
      </div>
    </div>
    </>
  )
}

export default NewsletterSubscribers;