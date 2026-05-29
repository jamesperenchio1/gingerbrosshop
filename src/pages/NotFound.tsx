import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-display font-bold text-deep-brown text-6xl mb-4">404</h1>
        <p className="font-body text-earth text-lg mb-2">Page not found</p>
        <p className="font-body text-earth/60 mb-8">The page you are looking for does not exist or has been moved.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-deep-brown text-cream font-body font-medium px-8 py-3 rounded-full hover:bg-rust transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
