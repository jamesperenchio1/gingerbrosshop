import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level fallback so a runtime error in any page renders a recoverable,
 * on-brand screen instead of a blank white page. React error boundaries must
 * be class components — there's no hooks equivalent.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-warm-white flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h1 className="font-display font-bold text-deep-brown text-2xl mb-3">
              Something went wrong.
            </h1>
            <p className="font-body text-earth mb-6">
              Sorry about that — please try reloading the page. If it keeps happening,{' '}
              <a href="mailto:gingerbros.brew@gmail.com" className="text-rust underline hover:text-deep-brown">
                let us know
              </a>
              .
            </p>
            <button
              onClick={() => window.location.reload()}
              className="font-body font-medium text-sm uppercase tracking-[0.08em] px-8 py-3.5 rounded-full bg-amber text-deep-brown hover:bg-warm-gold transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
