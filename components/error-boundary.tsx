"use client";

/**
 * In-house error boundary.
 *
 * Needed because TanStack's `useSuspenseQuery` throws on error and Suspense
 * alone doesn't catch it — the throw bubbles to the nearest class component
 * with `componentDidCatch` or `getDerivedStateFromError`. The React docs
 * recommend `react-error-boundary` for this, but vista keeps dependencies
 * lean (capstone scope), so this 30-line implementation does the same job.
 *
 * Usage inside dashboards:
 *
 *   <ErrorBoundary
 *     fallback={({ error, reset }) => (
 *       <ErrorPanel title="Couldn't load offers" body={error.message} onRetry={reset} />
 *     )}
 *   >
 *     <Suspense fallback={<OfferGridSkeleton count={3} />}>
 *       <OffersSection userId={userId} />
 *     </Suspense>
 *   </ErrorBoundary>
 *
 * The `reset` callback clears the boundary's error state. Pair it with
 * TanStack's `useQueryErrorResetBoundary().reset()` from the caller if you
 * need to also reset the query cache — but in most cases re-rendering the
 * subtree is enough because `useSuspenseQuery` retries by default.
 */

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  /**
   * Render-prop fallback shown when a child throws. `reset` clears the
   * error so the boundary attempts to re-render its children.
   */
  fallback: (props: { error: Error; reset: () => void }) => ReactNode;
  /**
   * Optional callback fired on every caught error — useful for logging.
   * Not awaited; throws here are swallowed.
   */
  onError?: (error: Error, info: { componentStack?: string | null }) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    if (this.props.onError) {
      try {
        this.props.onError(error, info);
      } catch {
        /* swallow — logging should never block the fallback render */
      }
    } else if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, reset: this.reset });
    }
    return this.props.children;
  }
}
