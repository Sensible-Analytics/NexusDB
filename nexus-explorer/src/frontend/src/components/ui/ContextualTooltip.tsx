import { Component, createSignal, Show } from "solid-js";
import { getGlossaryEntry, type GlossaryEntry } from "../../lib/glossary";
import "./ContextualTooltip.css";

interface ContextualTooltipProps {
  term: string;
  explanation?: string;
  inline?: boolean;
}

const ContextualTooltip: Component<ContextualTooltipProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const entry = getGlossaryEntry(props.term);

  const displayEntry: GlossaryEntry | null = entry
    ? { ...entry, explanation: props.explanation || entry.explanation }
    : props.explanation
      ? { term: props.term, userFacingTerm: props.term, explanation: props.explanation, example: "" }
      : null;

  const toggle = () => setIsOpen(!isOpen());

  return (
    <span class="contextual-tooltip-wrapper" classList={{ open: isOpen() }}>
      <button
        class="contextual-tooltip-trigger"
        classList={{ inline: props.inline }}
        onClick={toggle}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        title={`What is ${props.term}?`}
      >
        ?
      </button>
      <Show when={isOpen() && displayEntry}>
        {(e) => (
          <div
            class="contextual-tooltip-content"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div class="tooltip-header">
              <span class="tooltip-term">{e().userFacingTerm}</span>
              <span class="tooltip-technical">({e().term})</span>
            </div>
            <p class="tooltip-explanation">{e().explanation}</p>
            <Show when={e().example}>
              <div class="tooltip-example">
                <span class="example-label">Example:</span>
                {e().example}
              </div>
            </Show>
            <Show when={e().learnMore}>
              <a href={e().learnMore} class="tooltip-learn-more" target="_blank" rel="noopener noreferrer">
                Learn more →
              </a>
            </Show>
          </div>
        )}
      </Show>
    </span>
  );
};

export default ContextualTooltip;
