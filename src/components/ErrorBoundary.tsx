/**
 * Application & Route Level Error Boundary Component
 * Location: src/components/ErrorBoundary.tsx
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleNavigateBack = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    const path = window.location.pathname;
    if (path.startsWith('/crm/estimates')) {
      window.location.href = '/crm/estimates';
    } else if (path.startsWith('/crm')) {
      window.location.href = '/crm';
    } else if (path.startsWith('/procurement')) {
      window.location.href = '/procurement/rfqs';
    } else {
      window.location.href = '/';
    }
  };

  public render() {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    let backLabel = 'Return to Dashboard';
    if (path.startsWith('/crm/estimates')) {
      backLabel = 'Return to Estimates';
    } else if (path.startsWith('/crm')) {
      backLabel = 'Return to CRM Dashboard';
    } else if (path.startsWith('/procurement')) {
      backLabel = 'Return to Procurement';
    }

    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto my-8 p-6 bg-white border border-rose-200 rounded-xl shadow-md space-y-4 font-sans text-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h2 className="text-base font-bold text-slate-900">
                {this.props.fallbackTitle || 'Component Error Encountered'}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {this.props.fallbackMessage ||
                  'Something went wrong while loading this page. Your saved data has not been removed. Please retry or return to the CRM Dashboard.'}
              </p>
            </div>
          </div>

          {/* Development error details */}
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1">
              <div className="text-rose-400 font-bold">{this.state.error.toString()}</div>
              {this.state.errorInfo?.componentStack && (
                <div className="text-slate-400 text-[10px] whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <Button variant="primary" onClick={this.handleRetry}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry View
            </Button>
            <Button variant="secondary" onClick={this.handleNavigateBack}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> {backLabel}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
