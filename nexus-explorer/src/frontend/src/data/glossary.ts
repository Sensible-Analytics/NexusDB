export interface GlossaryTerm {
  technicalTerm: string;
  userFacingTerm: string;
  explanation: string;
  example?: string;
  learnMoreUrl?: string;
}

export const glossary: Record<string, GlossaryTerm> = {
  node: {
    technicalTerm: "Node",
    userFacingTerm: "Item",
    explanation: "A thing in your data — a person, event, symptom, etc.",
    example: '"Fatigue" is an item representing a symptom.',
  },
  edge: {
    technicalTerm: "Edge",
    userFacingTerm: "Connection",
    explanation: "How two items are related.",
    example: '"Poor Sleep" → TRIGGERED → "Fatigue" means poor sleep may have caused fatigue.',
  },
  label: {
    technicalTerm: "Label/Type",
    userFacingTerm: "Type",
    explanation: "What kind of item this is.",
    example: 'An item can be of type "Person", "Symptom", or "Event".',
  },
  vector: {
    technicalTerm: "Vector Embedding",
    userFacingTerm: "Similarity",
    explanation: "Items that are alike are grouped together.",
    example: 'Items about "stress" and "anxiety" may be found near each other.',
  },
  traversal: {
    technicalTerm: "Graph Traversal",
    userFacingTerm: "Follow connections",
    explanation: "Starting from one item, see what it connects to.",
    example: 'From "Fatigue", follow connections to find "Poor Sleep" and "Stressful Meeting".',
  },
  nql: {
    technicalTerm: "NQL Query",
    userFacingTerm: "Ask a question",
    explanation: "A way to ask your data questions.",
    example: 'Ask "What triggers fatigue?" and get answers from your data.',
  },
  schema: {
    technicalTerm: "Schema",
    userFacingTerm: "Structure",
    explanation: "The blueprint of how your data is organized.",
    example: 'The structure shows types like "Person", "Symptom", and how they relate.',
  },
};

export function getTerm(term: string): GlossaryTerm | undefined {
  return glossary[term.toLowerCase()];
}

export function getAllTerms(): GlossaryTerm[] {
  return Object.values(glossary);
}
