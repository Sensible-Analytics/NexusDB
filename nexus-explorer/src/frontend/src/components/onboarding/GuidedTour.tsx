import { Component, createSignal, createEffect, Show, For, createContext, useContext } from "solid-js";
import { setActiveView } from "../../stores/app";
import "./GuidedTour.css";

const STORAGE_KEY = "sensibledb-tour-completed";

export interface TourStep {
  title: string;
  description: string;
  targetSelector?: string;
  action?: () => void;
}

export const tourSteps: TourStep[] = [
  {
    title: "Welcome to SensibleDB",
    description: "Explore your data through connections. Ask questions, find patterns, and generate insights — no database expertise required.",
  },
  {
    title: "Graph View",
    description: "Visualize how your data connects. Nodes represent items, and lines show relationships. Drag to rearrange, scroll to zoom.",
    targetSelector: '[data-tour-target="graph"]',
    action: () => setActiveView("graph"),
  },
  {
    title: "Chat with Your Data",
    description: "Ask questions in plain English. No query language needed — just type what you want to know.",
    targetSelector: '[data-tour-target="chat"]',
    action: () => setActiveView("chat"),
  },
  {
    title: "Generate Reports",
    description: "Create summaries of your data for any time period. Export and share with your team.",
    targetSelector: '[data-tour-target="report"]',
    action: () => setActiveView("report"),
  },
  {
    title: "NQL Editor",
    description: "For advanced users — write precise queries using Nexus Query Language. Full control over your data exploration.",
    targetSelector: '[data-tour-target="nql"]',
    action: () => setActiveView("nql"),
  },
];

export function isTourCompleted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function markTourCompleted(): void {
  localStorage.setItem(STORAGE_KEY, "true");
}

export function showTour(): void {
  localStorage.removeItem(STORAGE_KEY);
  const event = new CustomEvent("sensibledb-start-tour");
  window.dispatchEvent(event);
}

interface TourContextType {
  startTour: () => void;
}

const TourContext = createContext<TourContextType>();

export function TourProvider(props: { children: any }) {
  const startTour = () => {
    const event = new CustomEvent("sensibledb-start-tour");
    window.dispatchEvent(event);
  };

  return (
    <TourContext.Provider value={{ startTour }}>
      {props.children}
    </TourContext.Provider>
  );
}

export function useTour() {
  return useContext(TourContext);
}

interface GuidedTourProps {
  initialStep?: number;
  onComplete?: () => void;
}

const GuidedTour: Component<GuidedTourProps> = (props) => {
  const [currentStep, setCurrentStep] = createSignal(props.initialStep ?? 0);
  const [isVisible, setIsVisible] = createSignal(false);

  const step = () => tourSteps[currentStep()];
  const isLast = () => currentStep() === tourSteps.length - 1;
  const isFirst = () => currentStep() === 0;

  const next = () => {
    if (isLast()) {
      completeTour();
    } else {
      setCurrentStep(currentStep() + 1);
      const nextStep = tourSteps[currentStep() + 1];
      if (nextStep?.action) nextStep.action();
    }
  };

  const prev = () => {
    if (!isFirst()) {
      setCurrentStep(currentStep() - 1);
      const prevStep = tourSteps[currentStep() - 1];
      if (prevStep?.action) prevStep.action();
    }
  };

  const completeTour = () => {
    markTourCompleted();
    setIsVisible(false);
    props.onComplete?.();
  };

  const skipTour = () => {
    markTourCompleted();
    setIsVisible(false);
    props.onComplete?.();
  };

  createEffect(() => {
    const handler = () => {
      setCurrentStep(0);
      setIsVisible(true);
      tourSteps[0]?.action?.();
    };
    window.addEventListener("sensibledb-start-tour", handler);
    return () => window.removeEventListener("sensibledb-start-tour", handler);
  });

  createEffect(() => {
    if (props.initialStep !== undefined) {
      setCurrentStep(props.initialStep);
      setIsVisible(true);
    }
  });

  return (
    <Show when={isVisible()}>
      <div class="tour-overlay">
        <div class="tour-backdrop" onClick={skipTour} />
        <div class="tour-card">
          <div class="tour-header">
            <div class="tour-step-indicator">
              <For each={tourSteps}>
                {(_, idx) => (
                  <span
                    class="tour-dot"
                    classList={{
                      active: idx() === currentStep(),
                      completed: idx() < currentStep(),
                    }}
                  />
                )}
              </For>
            </div>
            <button class="tour-skip" onClick={skipTour}>
              Skip Tour
            </button>
          </div>
          <div class="tour-body">
            <h2 class="tour-title">{step().title}</h2>
            <p class="tour-description">{step().description}</p>
          </div>
          <div class="tour-footer">
            <button
              class="tour-btn secondary"
              onClick={prev}
              disabled={isFirst()}
            >
              Previous
            </button>
            <div class="tour-progress">
              {currentStep() + 1} of {tourSteps.length}
            </div>
            <button class="tour-btn primary" onClick={next}>
              {isLast() ? "Finish Tour" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default GuidedTour;
