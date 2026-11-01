import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout'
import {Helmet} from 'react-helmet'
import QuoteList from '../assets/components/dashboard-components/QuoteList'

function Quote() {
  return (
    <>
    <Helmet>
        <title>Quote requests - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Quote requests">
      <div className="overflow-x-hidden">
        <QuoteList />
      </div>
    </DashboardLayout>
    </>
  )
}

export default Quote
