import TopHeader from './assets/components/TopHeader'
import MainHeader from './assets/components/MainHeader'
import RequestQuote from './assets/components/RequestQuote'
import Footer from './assets/components/Footer'
import {Helmet} from 'react-helmet'

function QuoteRequest() {
  return (
    <>
    <Helmet>
      <title>Request Quote - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <RequestQuote />
    <Footer />
    </>
  )
}

export default QuoteRequest