import TopHeader from './assets/components/TopHeader'
import MainHeader from './assets/components/MainHeader'
import OurMission from './assets/components/OurMission'
import OurVission from './assets/components/OurVission'
import MeetExpert from './assets/components/MeetExpert'
import Footer from './assets/components/Footer'
import {Helmet} from 'react-helmet'

function AboutUs() {
  return (
    <>
    <Helmet>
      <title>About Us - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <OurMission />
    <OurVission />
    <MeetExpert />
    <Footer />
    </>
  )
}

export default AboutUs