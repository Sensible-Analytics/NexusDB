import type { SchemaInfo } from "../types";

interface NLMatch {
  nql: string;
  resultType: "overview" | "items" | "connections" | "count" | "relationships" | "most_connected";
  entityTypes?: string[];
}

function normalize(input: string): string {
  return input.toLowerCase().trim().replace(/[?!.]+$/g, "");
}

function findEntityType(input: string, schemaInfo: SchemaInfo | null): string | null {
  if (!schemaInfo) return null;
  const normalized = normalize(input);
  for (const label of schemaInfo.node_labels) {
    const labelLower = label.toLowerCase();
    if (normalized.includes(labelLower) || normalized.includes(labelLower.replace(/_/g, " "))) {
      return label;
    }
  }
  return null;
}

function findTwoEntityTypes(input: string, schemaInfo: SchemaInfo | null): [string | null, string | null] {
  if (!schemaInfo) return [null, null];
  const normalized = normalize(input);
  const found: string[] = [];
  for (const label of schemaInfo.node_labels) {
    const labelLower = label.toLowerCase();
    if ((normalized.includes(labelLower) || normalized.includes(labelLower.replace(/_/g, " "))) && found.length < 2) {
      found.push(label);
    }
  }
  while (found.length < 2) found.push(null as any);
  return [found[0], found[1]];
}

export function translateNLtoNQL(input: string, schemaInfo: SchemaInfo | null): NLMatch {
  const normalized = normalize(input);

  if (normalized === "what data do i have" || normalized === "show me all items" || normalized === "show me everything") {
    return { nql: "MATCH (n) RETURN n", resultType: "overview" };
  }

  if (normalized === "how many connections are there" || normalized === "count connections" || normalized === "how many connections") {
    return { nql: "COUNT edges", resultType: "count" };
  }

  if (normalized === "what types of items exist" || normalized === "what types are there" || normalized === "show me all types") {
    return { nql: "MATCH (n) RETURN DISTINCT labels(n)", resultType: "overview" };
  }

  const countMatch = normalized.match(/^(?:how many|count)\s+(.+?)(?:\s+are there|\s+do (?:i|we)\s+have)?$/);
  if (countMatch) {
    const entityType = findEntityType(countMatch[1], schemaInfo);
    if (entityType) {
      return {
        nql: `MATCH (n:${entityType}) RETURN count(n)`,
        resultType: "count",
        entityTypes: [entityType],
      };
    }
  }

  const showAllMatch = normalized.match(/^show\s+(?:me\s+)?all\s+(.+)$/);
  if (showAllMatch) {
    const entityType = findEntityType(showAllMatch[1], schemaInfo);
    if (entityType) {
      return {
        nql: `MATCH (n:${entityType}) RETURN n`,
        resultType: "items",
        entityTypes: [entityType],
      };
    }
  }

  const showMatch = normalized.match(/^show\s+(?:me\s+)?(.+)$/);
  if (showMatch && !showMatch[1].includes("connected")) {
    const entityType = findEntityType(showMatch[1], schemaInfo);
    if (entityType) {
      return {
        nql: `MATCH (n:${entityType}) RETURN n`,
        resultType: "items",
        entityTypes: [entityType],
      };
    }
  }

  const connectedToMatch = normalized.match(/^(?:what(?:'s| is) connected to|show(?: me)? (?:what|what\'?s?|everything) connected to|connections (?:of|for)|what connects to)\s+(.+)$/);
  if (connectedToMatch) {
    const entityType = findEntityType(connectedToMatch[1], schemaInfo);
    if (entityType) {
      return {
        nql: `MATCH (n:${entityType})-[r]-(m) RETURN n, r, m`,
        resultType: "connections",
        entityTypes: [entityType],
      };
    }
  }

  const showConnectedMatch = normalized.match(/^show\s+(?:me\s+)?(.+?)\s+connected\s+to\s+(.+)$/);
  if (showConnectedMatch) {
    const [type1, type2] = findTwoEntityTypes(`${showConnectedMatch[1]} ${showConnectedMatch[2]}`, schemaInfo);
    if (type1 && type2) {
      return {
        nql: `MATCH (n:${type1})--(m:${type2}) RETURN n, m`,
        resultType: "relationships",
        entityTypes: [type1, type2],
      };
    }
    const type1only = findEntityType(showConnectedMatch[1], schemaInfo);
    if (type1only) {
      return {
        nql: `MATCH (n:${type1only})-[r]-(m) RETURN n, r, m`,
        resultType: "connections",
        entityTypes: [type1only],
      };
    }
  }

  const causesMatch = normalized.match(/^(?:what\s+)?(?:causes|triggers|leads?\s+to)\s+(.+)$/);
  if (causesMatch) {
    const entityType = findEntityType(causesMatch[1], schemaInfo);
    if (entityType) {
      return {
        nql: `MATCH (n:${entityType})<-[r]-(m) RETURN n, r, m`,
        resultType: "relationships",
        entityTypes: [entityType],
      };
    }
  }

  const mostConnectedMatch = normalized.match(/^(?:show\s+me\s+)?(?:the\s+)?most\s+connected\s+(?:items?|nodes?|things?)(.*)$/);
  if (mostConnectedMatch || normalized.includes("most connected")) {
    return {
      nql: `MATCH (n)-[r]-(m) RETURN n, count(r) as connections ORDER BY connections DESC`,
      resultType: "most_connected",
    };
  }

  const detailsMatch = normalized.match(/^show\s+(?:me\s+)?details?\s+(?:of|for|about)\s+(.+)$/);
  if (detailsMatch) {
    const entityType = findEntityType(detailsMatch[1], schemaInfo);
    if (entityType) {
      return {
        nql: `MATCH (n:${entityType}) RETURN n`,
        resultType: "items",
        entityTypes: [entityType],
      };
    }
  }

  const listMatch = normalized.match(/^(?:list|find|get)\s+(.+)$/);
  if (listMatch) {
    const entityType = findEntityType(listMatch[1], schemaInfo);
    if (entityType) {
      return {
        nql: `MATCH (n:${entityType}) RETURN n`,
        resultType: "items",
        entityTypes: [entityType],
      };
    }
  }

  return { nql: input, resultType: "items" };
}

export function generateFollowUpSuggestions(context: {
  resultType: string;
  entityTypes?: string[];
  hasResults: boolean;
}): string[] {
  const { resultType, entityTypes, hasResults } = context;

  if (!hasResults) {
    return [
      "What data do I have?",
      "Show me all types",
      "How many connections are there?",
    ];
  }

  switch (resultType) {
    case "overview":
      return [
        "Show me the most connected items",
        "What types of items exist?",
        "How many connections are there?",
      ];
    case "items":
      return [
        "What are they connected to?",
        "Show details",
        entityTypes && entityTypes.length > 0 ? `Filter by ${entityTypes[0]}` : "Filter by type",
      ];
    case "connections":
      return [
        "Show on graph",
        "What's the strongest link?",
        "Export results",
      ];
    case "count":
      return [
        "Show me the details",
        "Break down by type",
        "Compare with last period",
      ];
    case "relationships":
      return [
        "Show on graph",
        "What's the strongest link?",
        "Show me more details",
      ];
    case "most_connected":
      return [
        "Show on graph",
        "What connects them?",
        "Show me the details",
      ];
    default:
      return [
        "Show on graph",
        "What does this mean?",
        "Show me more details",
      ];
  }
}

export function generateAssistantResponse(
  query: string,
  result: any,
  nql: string,
  schemaInfo: SchemaInfo | null,
  resultType: string
): string {
  if (!result?.success) {
    return `I couldn't execute that query. Try asking in plain English, like "Show me all people" or "What causes fatigue?"`;
  }

  const nodes = result.data?.nodes || [];
  const edges = result.data?.edges || [];
  const nodeCount = nodes.length;
  const edgeCount = edges.length;

  switch (resultType) {
    case "overview": {
      if (nodeCount === 0 && edgeCount === 0 && schemaInfo) {
        const typeBreakdown = Object.entries(schemaInfo.node_counts)
          .map(([type, count]) => `  • ${count} ${type}`)
          .join("\n");
        return `I found ${schemaInfo.total_nodes} items and ${schemaInfo.total_edges} connections in your database.\n\nHere's the breakdown:\n${typeBreakdown}`;
      }

      const typeCounts: Record<string, number> = {};
      const edgeTypeCounts: Record<string, number> = {};
      for (const node of nodes) {
        const type = node.label || node.type || "Unknown";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
      for (const edge of edges) {
        const type = edge.label || edge.type || "Unknown";
        edgeTypeCounts[type] = (edgeTypeCounts[type] || 0) + 1;
      }

      const typeList = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `  • ${count} ${type}`)
        .join("\n");

      const edgeList = Object.entries(edgeTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `  • ${count} ${type}`)
        .join("\n");

      let response = `I found ${nodeCount} item${nodeCount !== 1 ? "s" : ""} across ${Object.keys(typeCounts).length} type${Object.keys(typeCounts).length !== 1 ? "s" : ""}:\n${typeList}`;
      if (edgeCount > 0) {
        response += `\n\nWith ${edgeCount} connection${edgeCount !== 1 ? "s" : ""}:\n${edgeList}`;
      }
      return response;
    }

    case "count": {
      if (nodeCount === 0 && edgeCount === 0) {
        const countValue = result.data?.count ?? result.data?.total;
        if (countValue !== undefined) {
          return `There ${countValue === 1 ? "is" : "are"} **${countValue}** item${countValue !== 1 ? "s" : ""} matching your query.`;
        }
      }
      return `I found ${nodeCount} item${nodeCount !== 1 ? "s" : ""} and ${edgeCount} connection${edgeCount !== 1 ? "s" : ""}.`;
    }

    case "items": {
      if (nodeCount === 0) {
        return `No items found matching your query. Try a different type or check the spelling.`;
      }

      const typeCounts: Record<string, number> = {};
      for (const node of nodes) {
        const type = node.label || node.type || "Unknown";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }

      if (nodeCount <= 10) {
        const itemList = nodes
          .map((node: any, i: number) => `  ${i + 1}. ${node.label || node.name || node.id || "Unknown"}`)
          .join("\n");
        return `I found ${nodeCount} item${nodeCount !== 1 ? "s" : ""}:\n\n${itemList}`;
      }

      const typeList = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `  • ${count} ${type}`)
        .join("\n");
      return `I found ${nodeCount} items across ${Object.keys(typeCounts).length} types:\n\n${typeList}\n\nShowing top 10 results. Use "Show details" to see all items.`;
    }

    case "connections": {
      if (nodeCount === 0) {
        return `No connections found for this item. It might be isolated in the graph.`;
      }

      const connectionList = nodes.slice(0, 10)
        .map((node: any, i: number) => {
          const connections = edges.filter((e: any) => e.from === node.id || e.to === node.id);
          const connCount = connections.length;
          return `  ${i + 1}. ${node.label || node.name || node.id} — ${connCount} connection${connCount !== 1 ? "s" : ""}`;
        })
        .join("\n");

      return `I found ${nodeCount} item${nodeCount !== 1 ? "s" : ""} with ${edgeCount} connection${edgeCount !== 1 ? "s" : ""}:\n\n${connectionList}`;
    }

    case "relationships": {
      if (nodeCount === 0) {
        return `No relationships found between these types. They might not be directly connected.`;
      }

      const relationshipPaths: string[] = [];
      for (const edge of edges.slice(0, 5)) {
        const fromNode = nodes.find((n: any) => n.id === edge.from);
        const toNode = nodes.find((n: any) => n.id === edge.to);
        if (fromNode && toNode) {
          relationshipPaths.push(
            `  ${fromNode.label || fromNode.name || fromNode.id} → [${edge.label || edge.type || "related"}] → ${toNode.label || toNode.name || toNode.id}`
          );
        }
      }

      if (relationshipPaths.length > 0) {
        return `I found ${edgeCount} relationship${edgeCount !== 1 ? "s" : ""}:\n\n${relationshipPaths.join("\n")}`;
      }

      return `I found ${nodeCount} items with ${edgeCount} relationship${edgeCount !== 1 ? "s" : ""} between them.`;
    }

    case "most_connected": {
      if (nodeCount === 0) {
        return `No connection data available yet.`;
      }

      const sorted = [...nodes]
        .map((node: any) => ({
          node,
          connections: edges.filter((e: any) => e.from === node.id || e.to === node.id).length,
        }))
        .sort((a, b) => b.connections - a.connections)
        .slice(0, 5);

      const topList = sorted
        .map((item: any, i: number) => `  ${i + 1}. ${item.node.label || item.node.name || item.node.id} — ${item.connections} connection${item.connections !== 1 ? "s" : ""}`)
        .join("\n");

      return `Here are the most connected items:\n\n${topList}`;
    }

    default: {
      if (nodeCount > 0) {
        return `I found ${nodeCount} item${nodeCount !== 1 ? "s" : ""} and ${edgeCount} connection${edgeCount !== 1 ? "s" : ""} matching your question.`;
      }
      return `No results found. Try rephrasing your question or ask "What data do I have?" to see what's available.`;
    }
  }
}
