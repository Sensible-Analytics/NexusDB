import { test, expect, describe } from "vitest";
import {
  translateNLtoSensibleQL,
  generateFollowUpSuggestions,
  generateAssistantResponse,
} from "./nl-to-sensibleql";
import type { SchemaInfo } from "../types";

describe("translateNLtoSensibleQL", () => {
  const schemaInfo: SchemaInfo = {
    node_labels: ["User", "Patient", "Symptom", "Condition", "Treatment", "HealthRecord", "MedicalHistory"],
    edge_types: ["HAS_SYMPTOM", "HAS_CONDITION", "TREATED_BY"],
    node_counts: {
      User: 10,
      Patient: 5,
      Symptom: 20,
      Condition: 15,
      Treatment: 8,
    },
    edge_counts: {
      HAS_SYMPTOM: 30,
      HAS_CONDITION: 25,
      TREATED_BY: 20,
    },
    total_nodes: 58,
    total_edges: 75,
  };

  describe("overview queries", () => {
    test("what data do i have", () => {
      const result = translateNLtoSensibleQL("what data do i have", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n) RETURN n");
      expect(result.resultType).toBe("overview");
    });

    test("show me all items", () => {
      const result = translateNLtoSensibleQL("show me all items", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n) RETURN n");
      expect(result.resultType).toBe("overview");
    });

    test("show me everything", () => {
      const result = translateNLtoSensibleQL("show me everything", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n) RETURN n");
      expect(result.resultType).toBe("overview");
    });

    test("show me all types", () => {
      const result = translateNLtoSensibleQL("show me all types", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n) RETURN DISTINCT labels(n)");
      expect(result.resultType).toBe("overview");
    });

    test("what types of items exist", () => {
      const result = translateNLtoSensibleQL("what types of items exist", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n) RETURN DISTINCT labels(n)");
      expect(result.resultType).toBe("overview");
    });

    test("what types are there", () => {
      const result = translateNLtoSensibleQL("what types are there", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n) RETURN DISTINCT labels(n)");
      expect(result.resultType).toBe("overview");
    });
  });

  describe("count queries", () => {
    test("how many connections are there", () => {
      const result = translateNLtoSensibleQL("how many connections are there", schemaInfo);
      expect(result.sensibleql).toBe("COUNT edges");
      expect(result.resultType).toBe("count");
    });

    test("count connections", () => {
      const result = translateNLtoSensibleQL("count connections", schemaInfo);
      expect(result.sensibleql).toBe("COUNT edges");
      expect(result.resultType).toBe("count");
    });

    test("how many connections", () => {
      const result = translateNLtoSensibleQL("how many connections", schemaInfo);
      expect(result.sensibleql).toBe("COUNT edges");
      expect(result.resultType).toBe("count");
    });

    test("how many patients", () => {
      const result = translateNLtoSensibleQL("how many patients", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Patient) RETURN count(n)");
      expect(result.resultType).toBe("count");
      expect(result.entityTypes).toContain("Patient");
    });

    test("how many symptoms are there", () => {
      const result = translateNLtoSensibleQL("how many symptoms are there", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Symptom) RETURN count(n)");
      expect(result.resultType).toBe("count");
      expect(result.entityTypes).toContain("Symptom");
    });

    test("count patients do we have", () => {
      const result = translateNLtoSensibleQL("count patients do we have", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Patient) RETURN count(n)");
      expect(result.resultType).toBe("count");
    });
  });

  describe("show all queries", () => {
    test("show me all users", () => {
      const result = translateNLtoSensibleQL("show me all users", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:User) RETURN n");
      expect(result.resultType).toBe("items");
      expect(result.entityTypes).toContain("User");
    });

    test("show all symptoms", () => {
      const result = translateNLtoSensibleQL("show all symptoms", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Symptom) RETURN n");
      expect(result.resultType).toBe("items");
      expect(result.entityTypes).toContain("Symptom");
    });

    test("show patients", () => {
      const result = translateNLtoSensibleQL("show patients", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Patient) RETURN n");
      expect(result.resultType).toBe("items");
      expect(result.entityTypes).toContain("Patient");
    });
  });

  describe("list queries", () => {
    test("list all users", () => {
      const result = translateNLtoSensibleQL("list all users", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:User) RETURN n");
      expect(result.resultType).toBe("items");
    });

    test("list patients", () => {
      const result = translateNLtoSensibleQL("list patients", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Patient) RETURN n");
      expect(result.resultType).toBe("items");
    });

    test("find all treatments", () => {
      const result = translateNLtoSensibleQL("find all treatments", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Treatment) RETURN n");
      expect(result.resultType).toBe("items");
    });

    test("get conditions", () => {
      const result = translateNLtoSensibleQL("get conditions", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Condition) RETURN n");
      expect(result.resultType).toBe("items");
    });
  });

  describe("connections queries", () => {
    test("what is connected to patient", () => {
      const result = translateNLtoSensibleQL("what is connected to patient", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Patient)-[r]-(m) RETURN n, r, m");
      expect(result.resultType).toBe("connections");
      expect(result.entityTypes).toContain("Patient");
    });

    test("show me what is connected to symptom", () => {
      const result = translateNLtoSensibleQL("show me what is connected to symptom", schemaInfo);
      expect(result.sensibleql).toBe("show me what is connected to symptom");
      expect(result.resultType).toBe("items");
    });

    test("connections of user", () => {
      const result = translateNLtoSensibleQL("connections of user", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:User)-[r]-(m) RETURN n, r, m");
      expect(result.resultType).toBe("connections");
    });

    test("what connects to condition", () => {
      const result = translateNLtoSensibleQL("what connects to condition", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Condition)-[r]-(m) RETURN n, r, m");
      expect(result.resultType).toBe("connections");
    });
  });

  describe("relationships between two entities", () => {
    test("show patient connected to symptom", () => {
      const result = translateNLtoSensibleQL("show patient connected to symptom", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Patient)--(m:Symptom) RETURN n, m");
      expect(result.resultType).toBe("relationships");
      expect(result.entityTypes).toContain("Patient");
      expect(result.entityTypes).toContain("Symptom");
    });

    test("show condition connected to treatment", () => {
      const result = translateNLtoSensibleQL("show condition connected to treatment", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Condition)--(m:Treatment) RETURN n, m");
      expect(result.resultType).toBe("relationships");
    });
  });

  describe("causes/triggers queries", () => {
    test("what causes symptom", () => {
      const result = translateNLtoSensibleQL("what causes symptom", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Symptom)<-[r]-(m) RETURN n, r, m");
      expect(result.resultType).toBe("relationships");
    });

    test("what triggers condition", () => {
      const result = translateNLtoSensibleQL("what triggers condition", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Condition)<-[r]-(m) RETURN n, r, m");
      expect(result.resultType).toBe("relationships");
    });

    test("leads to condition", () => {
      const result = translateNLtoSensibleQL("leads to condition", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Condition)<-[r]-(m) RETURN n, r, m");
      expect(result.resultType).toBe("relationships");
    });
  });

  describe("most connected queries", () => {
    test("show me the most connected items", () => {
      const result = translateNLtoSensibleQL("show me the most connected items", schemaInfo);
      expect(result.sensibleql).toBe(
        "MATCH (n)-[r]-(m) RETURN n, count(r) as connections ORDER BY connections DESC"
      );
      expect(result.resultType).toBe("most_connected");
    });

    test("most connected nodes", () => {
      const result = translateNLtoSensibleQL("most connected nodes", schemaInfo);
      expect(result.sensibleql).toBe(
        "MATCH (n)-[r]-(m) RETURN n, count(r) as connections ORDER BY connections DESC"
      );
      expect(result.resultType).toBe("most_connected");
    });

    test("most connected", () => {
      const result = translateNLtoSensibleQL("most connected", schemaInfo);
      expect(result.sensibleql).toBe(
        "MATCH (n)-[r]-(m) RETURN n, count(r) as connections ORDER BY connections DESC"
      );
      expect(result.resultType).toBe("most_connected");
    });

    test("the most connected thing", () => {
      const result = translateNLtoSensibleQL("the most connected thing", schemaInfo);
      expect(result.sensibleql).toBe(
        "MATCH (n)-[r]-(m) RETURN n, count(r) as connections ORDER BY connections DESC"
      );
      expect(result.resultType).toBe("most_connected");
    });
  });

  describe("details queries", () => {
    test("show me details of patient", () => {
      const result = translateNLtoSensibleQL("show me details of patient", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Patient) RETURN n");
      expect(result.resultType).toBe("items");
    });

    test("show details for user", () => {
      const result = translateNLtoSensibleQL("show details for user", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:User) RETURN n");
      expect(result.resultType).toBe("items");
    });

    test("show detail about symptom", () => {
      const result = translateNLtoSensibleQL("show detail about symptom", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Symptom) RETURN n");
      expect(result.resultType).toBe("items");
    });
  });

  describe("fallback for unknown patterns", () => {
    test("unknown query returns input", () => {
      const result = translateNLtoSensibleQL("some random query", schemaInfo);
      expect(result.sensibleql).toBe("some random query");
      expect(result.resultType).toBe("items");
    });

    test("empty-ish query returns input", () => {
      const result = translateNLtoSensibleQL("???", schemaInfo);
      expect(result.sensibleql).toBe("???");
      expect(result.resultType).toBe("items");
    });
  });

  describe("case sensitivity and punctuation", () => {
    test("handles uppercase", () => {
      const result = translateNLtoSensibleQL("SHOW ME ALL USERS", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:User) RETURN n");
      expect(result.resultType).toBe("items");
    });

    test("handles mixed case", () => {
      const result = translateNLtoSensibleQL("Show Me All Users", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:User) RETURN n");
    });

    test("handles trailing punctuation", () => {
      const result = translateNLtoSensibleQL("show me all users?", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:User) RETURN n");
    });

    test("handles trailing exclamation", () => {
      const result = translateNLtoSensibleQL("show me all patients!", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Patient) RETURN n");
    });

    test("handles trailing period", () => {
      const result = translateNLtoSensibleQL("list conditions.", schemaInfo);
      expect(result.sensibleql).toBe("MATCH (n:Condition) RETURN n");
    });
  });

  describe("schema info with underscores", () => {
    const schemaWithUnderscores: SchemaInfo = {
      node_labels: ["HealthRecord", "MedicalHistory"],
      edge_types: ["RELATES_TO"],
      node_counts: { HealthRecord: 5, MedicalHistory: 3 },
      edge_counts: { RELATES_TO: 10 },
      total_nodes: 8,
      total_edges: 10,
    };

    test("handles entity name with underscore", () => {
      const result = translateNLtoSensibleQL("show me all health records", schemaWithUnderscores);
      expect(result.sensibleql).toBe("show me all health records");
      expect(result.resultType).toBe("items");
    });

    test("handles entity name without underscore", () => {
      const result = translateNLtoSensibleQL("show me all medical history", schemaWithUnderscores);
      expect(result.sensibleql).toBe("show me all medical history");
      expect(result.resultType).toBe("items");
    });

    test("handles entity name without underscore", () => {
      const result = translateNLtoSensibleQL("show me all medical history", schemaWithUnderscores);
      expect(result.sensibleql).toBe("show me all medical history");
      expect(result.resultType).toBe("items");
    });
  });

  describe("without schema info", () => {
    test("returns input when no schema provided", () => {
      const result = translateNLtoSensibleQL("show me all users", null);
      expect(result.sensibleql).toBe("show me all users");
      expect(result.resultType).toBe("items");
    });

    test("overview works without schema", () => {
      const result = translateNLtoSensibleQL("what data do i have", null);
      expect(result.sensibleql).toBe("MATCH (n) RETURN n");
      expect(result.resultType).toBe("overview");
    });

    test("count connections works without schema", () => {
      const result = translateNLtoSensibleQL("how many connections are there", null);
      expect(result.sensibleql).toBe("COUNT edges");
      expect(result.resultType).toBe("count");
    });
  });
});

describe("generateFollowUpSuggestions", () => {
  test("no results state", () => {
    const suggestions = generateFollowUpSuggestions({
      resultType: "items",
      hasResults: false,
    });
    expect(suggestions).toEqual([
      "What data do I have?",
      "Show me all types",
      "How many connections are there?",
    ]);
  });

  test("overview result type", () => {
    const suggestions = generateFollowUpSuggestions({
      resultType: "overview",
      hasResults: true,
    });
    expect(suggestions).toEqual([
      "Show me the most connected items",
      "What types of items exist?",
      "How many connections are there?",
    ]);
  });

  test("items result type with entity", () => {
    const suggestions = generateFollowUpSuggestions({
      resultType: "items",
      entityTypes: ["Patient"],
      hasResults: true,
    });
    expect(suggestions).toEqual([
      "What are they connected to?",
      "Show details",
      "Filter by Patient",
    ]);
  });

  test("items result type without entity", () => {
    const suggestions = generateFollowUpSuggestions({
      resultType: "items",
      hasResults: true,
    });
    expect(suggestions).toEqual([
      "What are they connected to?",
      "Show details",
      "Filter by type",
    ]);
  });

  test("connections result type", () => {
    const suggestions = generateFollowUpSuggestions({
      resultType: "connections",
      hasResults: true,
    });
    expect(suggestions).toEqual([
      "Show on graph",
      "What's the strongest link?",
      "Export results",
    ]);
  });

  test("count result type", () => {
    const suggestions = generateFollowUpSuggestions({
      resultType: "count",
      hasResults: true,
    });
    expect(suggestions).toEqual([
      "Show me the details",
      "Break down by type",
      "Compare with last period",
    ]);
  });

  test("relationships result type", () => {
    const suggestions = generateFollowUpSuggestions({
      resultType: "relationships",
      hasResults: true,
    });
    expect(suggestions).toEqual([
      "Show on graph",
      "What's the strongest link?",
      "Show me more details",
    ]);
  });

  test("most_connected result type", () => {
    const suggestions = generateFollowUpSuggestions({
      resultType: "most_connected",
      hasResults: true,
    });
    expect(suggestions).toEqual([
      "Show on graph",
      "What connects them?",
      "Show me the details",
    ]);
  });

  test("unknown result type defaults", () => {
    const suggestions = generateFollowUpSuggestions({
      resultType: "unknown",
      hasResults: true,
    });
    expect(suggestions).toEqual([
      "Show on graph",
      "What does this mean?",
      "Show me more details",
    ]);
  });
});

describe("generateAssistantResponse", () => {
  const schemaInfo: SchemaInfo = {
    node_labels: ["User", "Patient"],
    edge_types: ["HAS_SYMPTOM"],
    node_counts: { User: 10, Patient: 5 },
    edge_counts: { HAS_SYMPTOM: 15 },
    total_nodes: 15,
    total_edges: 15,
  };

  test("unsuccessful result", () => {
    const result = generateAssistantResponse(
      "test query",
      { success: false, error: "test error" },
      "MATCH (n) RETURN n",
      schemaInfo,
      "items"
    );
    expect(result).toContain("I couldn't execute that query");
  });

  describe("overview result type", () => {
    test("empty result with schema", () => {
      const result = generateAssistantResponse(
        "what data do i have",
        { success: true, data: { nodes: [], edges: [] } },
        "MATCH (n) RETURN n",
        schemaInfo,
        "overview"
      );
      expect(result).toContain("15 items");
      expect(result).toContain("15 connections");
      expect(result).toContain("10 User");
      expect(result).toContain("5 Patient");
    });

    test("with nodes and edges", () => {
      const result = generateAssistantResponse(
        "what data do i have",
        {
          success: true,
          data: {
            nodes: [
              { id: "1", label: "User", type: "User" },
              { id: "2", label: "Patient", type: "Patient" },
            ],
            edges: [{ id: "e1", label: "HAS_SYMPTOM", from: "1", to: "2" }],
          },
        },
        "MATCH (n) RETURN n",
        null,
        "overview"
      );
      expect(result).toContain("2 items");
      expect(result).toContain("1 connection");
    });
  });

  describe("count result type", () => {
    test("with count value", () => {
      const result = generateAssistantResponse(
        "how many patients",
        { success: true, data: { count: 5 } },
        "MATCH (n:Patient) RETURN count(n)",
        null,
        "count"
      );
      expect(result).toContain("5");
      expect(result).toContain("item");
    });

    test("single item", () => {
      const result = generateAssistantResponse(
        "how many patients",
        { success: true, data: { count: 1 } },
        "MATCH (n:Patient) RETURN count(n)",
        null,
        "count"
      );
      expect(result).toContain("**1**");
      expect(result).toContain("item");
    });

    test("empty result", () => {
      const result = generateAssistantResponse(
        "how many patients",
        { success: true, data: { nodes: [], edges: [] } },
        "MATCH (n:Patient) RETURN count(n)",
        null,
        "count"
      );
      expect(result).toContain("0 item");
    });
  });

  describe("items result type", () => {
    test("empty result", () => {
      const result = generateAssistantResponse(
        "show patients",
        { success: true, data: { nodes: [], edges: [] } },
        "MATCH (n:Patient) RETURN n",
        null,
        "items"
      );
      expect(result).toContain("No items found");
    });

    test("few items (≤10)", () => {
      const result = generateAssistantResponse(
        "show patients",
        {
          success: true,
          data: {
            nodes: [
              { id: "1", label: "John" },
              { id: "2", label: "Jane" },
            ],
            edges: [],
          },
        },
        "MATCH (n:Patient) RETURN n",
        null,
        "items"
      );
      expect(result).toContain("2 items");
      expect(result).toContain("1. John");
      expect(result).toContain("2. Jane");
    });

    test("many items (>10)", () => {
      const nodes = Array.from({ length: 15 }, (_, i) => ({ id: String(i), label: `Patient${i}` }));
      const result = generateAssistantResponse(
        "show patients",
        { success: true, data: { nodes, edges: [] } },
        "MATCH (n:Patient) RETURN n",
        null,
        "items"
      );
      expect(result).toContain("15 items");
      expect(result).toContain("top 10 results");
    });
  });

  describe("connections result type", () => {
    test("empty connections", () => {
      const result = generateAssistantResponse(
        "what is connected to patient",
        { success: true, data: { nodes: [], edges: [] } },
        "MATCH (n:Patient)-[r]-(m) RETURN n, r, m",
        null,
        "connections"
      );
      expect(result).toContain("No connections found");
    });

    test("with connections", () => {
      const result = generateAssistantResponse(
        "what is connected to patient",
        {
          success: true,
          data: {
            nodes: [{ id: "1", label: "Patient1", name: "John" }],
            edges: [{ id: "e1", from: "1", to: "2" }],
          },
        },
        "MATCH (n:Patient)-[r]-(m) RETURN n, r, m",
        null,
        "connections"
      );
      expect(result).toContain("1 item");
      expect(result).toContain("1 connection");
    });
  });

  describe("relationships result type", () => {
    test("empty relationships", () => {
      const result = generateAssistantResponse(
        "show patient connected to symptom",
        { success: true, data: { nodes: [], edges: [] } },
        "MATCH (n:Patient)--(m:Symptom) RETURN n, m",
        null,
        "relationships"
      );
      expect(result).toContain("No relationships found");
    });

    test("with relationships", () => {
      const result = generateAssistantResponse(
        "show patient connected to symptom",
        {
          success: true,
          data: {
            nodes: [
              { id: "1", label: "Patient1", name: "John" },
              { id: "2", label: "Symptom1", name: "Fever" },
            ],
            edges: [{ id: "e1", label: "HAS_SYMPTOM", from: "1", to: "2" }],
          },
        },
        "MATCH (n:Patient)--(m:Symptom) RETURN n, m",
        null,
        "relationships"
      );
      expect(result).toContain("1 relationship");
      expect(result).toContain("Patient1");
      expect(result).toContain("HAS_SYMPTOM");
      expect(result).toContain("Symptom1");
    });
  });

  describe("most_connected result type", () => {
    test("empty result", () => {
      const result = generateAssistantResponse(
        "most connected",
        { success: true, data: { nodes: [], edges: [] } },
        "MATCH (n)-[r]-(m) RETURN n, count(r) as connections ORDER BY connections DESC",
        null,
        "most_connected"
      );
      expect(result).toContain("No connection data available");
    });

    test("with connections", () => {
      const result = generateAssistantResponse(
        "most connected",
        {
          success: true,
          data: {
            nodes: [
              { id: "1", label: "Node1", name: "Central" },
              { id: "2", label: "Node2", name: "Peripheral" },
            ],
            edges: [
              { id: "e1", from: "1", to: "2" },
              { id: "e2", from: "1", to: "3" },
            ],
          },
        },
        "MATCH (n)-[r]-(m) RETURN n, count(r) as connections ORDER BY connections DESC",
        null,
        "most_connected"
      );
      expect(result).toContain("most connected");
      expect(result).toContain("2 connections");
    });
  });

  describe("default result type", () => {
    test("with results", () => {
      const result = generateAssistantResponse(
        "some query",
        {
          success: true,
          data: {
            nodes: [{ id: "1" }],
            edges: [{ id: "e1" }],
          },
        },
        "query",
        null,
        "unknown"
      );
      expect(result).toContain("1 item");
      expect(result).toContain("1 connection");
    });

    test("empty result", () => {
      const result = generateAssistantResponse(
        "some query",
        { success: true, data: { nodes: [], edges: [] } },
        "query",
        null,
        "unknown"
      );
      expect(result).toContain("No results found");
      expect(result).toContain("What data do I have");
    });
  });
});
