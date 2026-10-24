import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Gamepad2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PlayZone Arcade uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none pt-safe pb-safe">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 shadow-xl">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-1 text-white">Something went wrong</h1>
          <p className="text-xs text-slate-400 max-w-xs mb-4 leading-relaxed">
            An unexpected error occurred in PlayZone Arcade. Your virtual points and demo progress are safely preserved.
          </p>
          {this.state.error && (
            <div className="bg-slate-900 p-3 rounded-xl text-xs font-mono text-slate-300 max-w-xs break-words mb-5 text-left border border-slate-800">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="min-h-[48px] px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2 active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            Restart PlayZone Arcade
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
