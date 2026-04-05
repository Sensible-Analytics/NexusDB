import { Component, ErrorBoundary, JSX } from "solid-js";
import "./ErrorBoundary.css";

interface Props {
  fallback?: JSX.Element;
  children: JSX.Element;
}

const ErrorBoundaryComponent: Component<Props> = (props) => {
  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <div class="error-boundary">
          <div class="error-boundary-icon">⚠️</div>
          <div class="error-boundary-content">
            <h3 class="error-boundary-title">Something went wrong</h3>
            <p class="error-boundary-message">{error?.message || "An unexpected error occurred"}</p>
            <div class="error-boundary-actions">
              <button class="retry-btn" onClick={() => retry()}>Try Again</button>
            </div>
          </div>
        </div>
      )}
    >
      {props.children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryComponent;
