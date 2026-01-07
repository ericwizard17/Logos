'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError, AppError } from '@/lib/errors';
import styles from './ErrorBoundary.module.css';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
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

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        logError(error, {
            componentStack: errorInfo.componentStack,
        });
        
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div className={styles.icon}>⚠️</div>
                        <h2 className="serif">Something went wrong</h2>
                        <p className={styles.message}>
                            We encountered an unexpected error. Please try again.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className={styles.details}>
                                <summary>Error Details</summary>
                                <pre>{this.state.error.message}</pre>
                                <pre>{this.state.error.stack}</pre>
                            </details>
                        )}
                        <div className={styles.actions}>
                            <button onClick={this.handleRetry} className={styles.retryBtn}>
                                Try Again
                            </button>
                            <button 
                                onClick={() => window.location.reload()} 
                                className={styles.reloadBtn}
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook-friendly error boundary wrapper
 */
interface ErrorBoundaryWrapperProps {
    children: ReactNode;
    fallbackRender?: (props: { error: Error; resetError: () => void }) => ReactNode;
}

export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}

