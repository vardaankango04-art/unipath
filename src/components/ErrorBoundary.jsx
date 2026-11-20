import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('UniPath render error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-sand bg-paper p-8 text-center">
          <p className="label text-bark">Something went wrong</p>
          <h2 className="mt-3 font-display text-2xl tracking-[0.06em]">THIS PAGE DIDN'T LOAD</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/75">Reload the page to try again.</p>
          <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-6">
            Reload
          </button>
        </div>
      </div>
    );
  }
}
