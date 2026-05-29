import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import Shop from '@/sections/Shop';
import Story from '@/sections/Story';
import Process from '@/sections/Process';
import Benefits from '@/sections/Benefits';
import Testimonials from '@/sections/Testimonials';
import Newsletter from '@/components/Newsletter';
import LineWidget from '@/components/LineWidget';
import Footer from '@/sections/Footer';
import CartDrawer from '@/sections/CartDrawer';
import StickyCartBar from '@/sections/StickyCartBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <Navigation />
      <Hero />
      <Shop />
      <Story />
      <Process />
      <Benefits />
      <Testimonials />
      <Newsletter />
      <Footer />
      <CartDrawer />
      <StickyCartBar />
      <LineWidget />
    </div>
  );
}
