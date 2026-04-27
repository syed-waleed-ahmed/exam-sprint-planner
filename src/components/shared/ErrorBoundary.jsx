import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Intentionally silent in UI; recoverable fallback is shown to users.
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="glass-card w-full max-w-xl p-6 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted">
            The app hit an unexpected error. Your saved data is still in local storage.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              className="rounded-elem border border-white/20 px-3 py-2 text-sm"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
            <button
              className="rounded-elem bg-primary px-3 py-2 text-sm"
              onClick={() => window.location.reload()}
            >
              Reload app
            </button>
          </div>
        </div>
      </div>
    );
  }
}