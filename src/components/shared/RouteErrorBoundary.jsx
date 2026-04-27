import React from 'react';

/**
 * Lightweight error boundary for individual routes.
 * Catches crashes per-page without destroying the sidebar/topbar shell.
 */
export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Intentionally silent — the fallback UI handles recovery.
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="glass-card mx-auto mt-12 max-w-lg p-6 text-center">
        <h2 className="text-xl font-bold">This page ran into a problem</h2>
        <p className="mt-2 text-sm text-muted">
          Something went wrong rendering this section. Your data is safe in local storage.
        </p>
        {this.state.error?.message && (
          <details className="mt-3 text-left">
            <summary className="cursor-pointer text-xs text-muted">Error details</summary>
            <pre className="mt-2 max-h-32 overflow-auto rounded-elem bg-slate-900/60 p-2 text-xs text-danger">
              {this.state.error.message}
            </pre>
          </details>
        )}
        <div className="mt-4 flex justify-center gap-2">
          <button
            className="rounded-elem border border-white/20 px-3 py-2 text-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
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
    );
  }
}
