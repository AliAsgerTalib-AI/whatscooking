import { Component } from "react";
import RecipeGenerator from "../RecipeGenerator.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-6">
          <div className="max-w-md w-full rounded-2xl border border-red-100 bg-red-50 px-8 py-10 text-center">
            <div className="text-2xl mb-3">⚠️</div>
            <h2 className="text-base font-bold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-sm text-red-500 mb-6 font-mono break-all">
              {this.state.error.message || "Unexpected error"}
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              className="rounded-full bg-red-600 text-white px-6 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] hover:bg-red-700 transition-colors"
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

export default function App() {
  return (
    <ErrorBoundary>
      <RecipeGenerator />
    </ErrorBoundary>
  );
}
