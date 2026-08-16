import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fullScreen?: boolean
  title?: string
  message?: string
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('Budgy crashed:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const { fullScreen = true, title = 'Something went wrong', message } = this.props
      return (
        <div
          className={`flex flex-col items-center justify-center gap-4 bg-white px-4 text-center ${
            fullScreen ? 'min-h-screen' : 'min-h-[50vh]'
          }`}
        >
          <h1 className="text-xl font-bold text-espresso">{title}</h1>
          <p className="max-w-sm text-sm text-caramel">
            {message ?? "Budgy hit an unexpected error. Reloading the page usually fixes it."}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-caramel"
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
