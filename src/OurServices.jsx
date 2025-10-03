import TopHeader from './assets/components/TopHeader'
import MainHeader from './assets/components/MainHeader'
import ServicesSection from './assets/components/ServicesSection'
import Footer from './assets/components/Footer'
import RequestQuote from './assets/components/RequestQuote'
import {Helmet} from 'react-helmet'

function OurServices() {
  return (
    <>
    <Helmet>
      <title>Our Services - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <ServicesSection />
    <RequestQuote />
    <Footer />
    </>
  )
}

export default OurServices