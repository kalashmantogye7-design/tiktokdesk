import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Safety net (v1.1 fix): if a screen crashes on empty data, show a
 * message instead of a blank white screen. The sidebar stays visible
 * in App.tsx, so the user can navigate away and back to retry.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('TikTokDesk screen error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-amber-200 p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900">This screen could not load</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              This usually happens when no account or video has been added yet.
              Go to Accounts, add your first account, then come back to this screen.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
