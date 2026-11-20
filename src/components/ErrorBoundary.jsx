import React from 'react';
import { AlertCircle, RefreshCw, MapPin } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught React error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/map';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-[#FAFAFA] dark:bg-[#09090B] text-[#09090B] dark:text-white transition-colors">
          <div className="max-w-md w-full bg-white dark:bg-[#14171C] border border-[#E4E4E7] dark:border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 stroke-[2]" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-bold tracking-tight">
                Temporary Navigation View Error
              </h2>
              <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                UniPath encountered an unexpected error while rendering this page. You can reload or reset to the main campus map.
              </p>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-left text-xs font-mono text-red-700 dark:text-red-300 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#09090B] dark:bg-white text-white dark:text-[#09090B] font-bold text-sm shadow hover:opacity-90 active:scale-95 transition flex items-center justify-center space-x-2"
                type="button"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Campus Map</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

