import Navbar from '../common/Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Testimonials from './Testimonials';
import Footer from '../common/Footer';
import CTA from './CTA';

const LandingPage = () => {
  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
     <Footer />
    </div>
  );
};

export default LandingPage;