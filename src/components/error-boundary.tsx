"use client";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-300">页面出现错误</h2>
            <p className="mt-2 text-sm text-red-400/80">
              {this.state.error?.message || "未知错误"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 rounded bg-red-700 px-4 py-2 text-white hover:bg-red-600"
            >
              重试
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
