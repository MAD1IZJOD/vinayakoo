import { Component, type ReactNode } from 'react'

type Props = { fallback: ReactNode; children: ReactNode }

/** Swaps in a fallback if anything inside throws, e.g. a GPU that loses its WebGL context. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
