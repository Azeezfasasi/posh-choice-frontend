import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import {Helmet} from 'react-helmet'
import QuoteList from '../assets/components/dashboard-components/QuoteList'

function Quote() {
  return (
    <>
    <Helmet>
        <title>Quote - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%] overflow-x-hidden'>
        <QuoteList />
      </div>
    </div>
    </>
  )
}

export default Quote