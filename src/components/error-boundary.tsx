import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('UI error boundary caught an exception', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-12 max-w-2xl px-4">
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The app hit an unexpected error. Your saved draft is still in local storage.
              </p>
              {this.state.errorMessage && (
                <pre className="rounded border bg-muted p-3 text-xs text-foreground">{this.state.errorMessage}</pre>
              )}
              <Button type="button" onClick={() => window.location.reload()}>
                Reload app
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
