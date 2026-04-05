export interface GlossaryEntry {
  term: string;
  userFacingTerm: string;
  explanation: string;
  example: string;
  learnMore?: string;
}

export const glossary: Record<string, GlossaryEntry> = {
  node: {
    term: "Node",
    userFacingTerm: "Item",
    explanation: "A thing in your data — a person, event, symptom, etc.",
    example: '"Fatigue" is an item in your health data.',
    learnMore: "https://docs.nexus-db.com/documentation/concepts/nodes",
  },
  edge: {
    term: "Edge",
    userFacingTerm: "Connection",
    explanation: "How two items are related.",
    example: '"Poor Sleep" → TRIGGERED → "Fatigue" means poor sleep may have caused fatigue.',
    learnMore: "https://docs.nexus-db.com/documentation/concepts/edges",
  },
  label: {
    term: "Label/Type",
    userFacingTerm: "Type",
    explanation: "What kind of item this is.",
    example: 'An item might be of type "Person", "Symptom", or "Event".',
  },
  "vector-embedding": {
    term: "Vector Embedding",
    userFacingTerm: "Similarity",
    explanation: "Items that are alike are grouped together.",
    example: "Items about sleep and rest might be grouped because they share similar characteristics.",
  },
  "graph-traversal": {
    term: "Graph Traversal",
    userFacingTerm: "Follow connections",
    explanation: "Starting from one item, see what it connects to.",
    example: 'Starting from "Fatigue", you can follow connections to find related symptoms and triggers.',
  },
  "nql-query": {
    term: "NQL Query",
    userFacingTerm: "Ask a question",
    explanation: "A way to ask your data questions.",
    example: '"Show me all symptoms connected to fatigue" is a question your data can answer.',
  },
  schema: {
    term: "Schema",
    userFacingTerm: "Structure",
    explanation: "The blueprint of how your data is organized.",
    example: "Your structure defines what types of items exist and how they can connect.",
    learnMore: "https://docs.nexus-db.com/documentation/concepts/schema",
  },
};

export function getGlossaryEntry(term: string): GlossaryEntry | undefined {
  return glossary[term.toLowerCase()];
}

export function getAllGlossaryEntries(): GlossaryEntry[] {
  return Object.values(glossary);
}
