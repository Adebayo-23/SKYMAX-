import React from "react";

export default class ClientErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // You can add logging here (Sentry, etc.)
    // eslint-disable-next-line no-console
    console.error("ClientErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
