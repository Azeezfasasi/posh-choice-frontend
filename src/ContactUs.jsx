import MainHeader from './assets/components/MainHeader'
import TopHeader from './assets/components/TopHeader'
import Footer from './assets/components/Footer'
import ContactInfo from './assets/components/ContactInfo'
import RequestQuote from './assets/components/RequestQuote'
import PageHeader from './assets/components/PageHeader'
import WhatsAppChat from './assets/components/WhatsAppChat'
import {Helmet} from 'react-helmet'

function ContactUs() {
  return (
    <>
    <Helmet>
      <title>Contact us - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <main>
      <PageHeader
        title="Get in touch"
        subtitle="Questions about a product, an order or a bulk purchase? Call, chat or send us a message and we'll get back to you promptly."
        crumbs={[{ label: 'Contact us' }]}
      />
      <ContactInfo />
      <RequestQuote />
    </main>
    <Footer />
    <WhatsAppChat />
    </>
  )
}

export default ContactUs
