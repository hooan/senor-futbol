import { Component, ErrorInfo, ReactNode } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-raw-white flex items-center justify-center px-4">
          <div className="max-w-2xl w-full p-8 border-thick border-red-600 bg-red-50">
            <div className="text-center mb-6">
              <svg
                className="w-20 h-20 mx-auto text-red-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={3}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h1 className="font-headline text-4xl uppercase mb-4 text-red-900">
                SOMETHING WENT WRONG
              </h1>
              <p className="text-red-800 mb-6">
                We're sorry, but something unexpected happened. This error has been logged and we'll
                look into it.
              </p>
            </div>

            {/* Error Details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-white border-thick border-red-700">
                <h3 className="font-semibold text-sm uppercase mb-2 text-red-900">
                  Error Details (Development Only)
                </h3>
                <pre className="text-xs text-red-800 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={this.handleReset} size="large">
                TRY AGAIN
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={() => (window.location.href = '/')}
              >
                GO HOME
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={() => window.location.reload()}
              >
                RELOAD PAGE
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t-3 border-red-300 text-center">
              <p className="text-sm text-red-800">
                If this problem persists, please try clearing your browser cache or contact support.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
