import { Link } from 'react-router';
import SEO from '@/components/SEO';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-6 pt-20 text-cream">
      <SEO
        title="Page Not Found | GingerBros"
        description="Sorry, we couldn't find that page. Browse Ginger Fizz and Ginger Tea, or head back to the homepage."
        noindex
      />
      <div className="max-w-lg text-center">
        <p className="font-poster text-[clamp(6rem,25vw,12rem)] text-ginger">404</p>
        <h1 className="font-poster text-[clamp(2rem,6vw,3.5rem)]">This page went flat.</h1>
        <p className="mt-4 font-body text-[16px] text-cream/85">The page you are looking for doesn&apos;t exist or has moved. The ginger is still here, though.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/shop" className="rounded-full bg-ginger px-7 py-3.5 font-body text-[13px] font-bold uppercase tracking-[0.1em] text-charcoal">Shop the drinks</Link>
          <Link to="/" className="rounded-full border-2 border-cream/40 px-7 py-3.5 font-body text-[13px] font-bold uppercase tracking-[0.1em] text-cream">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
