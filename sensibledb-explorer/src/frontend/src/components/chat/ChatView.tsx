import { Component, createSignal, createEffect, For, onMount, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { activeDb, nodes, edges, schema, setActiveView, setChatContext, setLastQueryResult } from "../../stores/app";
import type { SchemaInfo } from "../../types";
import { sensibleqlExecute } from "../../lib/api";
import "./ChatView.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  data?: any;
  timestamp: number;
  sensibleql?: string;
  queryType?: string;
  followUps?: string[];
  structuredData?: StructuredResponse;
  explanation?: string;
}

interface StructuredResponse {
  type: "typeBreakdown" | "mostConnected" | "relationshipPath" | "count" | "list";
  title: string;
  items: any[];
  summary: string;
}

const initialSuggestions = [
  "What data do I have?",
  "Show me all items",
  "How many connections are there?",
  "What types of items exist?",
];

function normalize(input: string): string {
  return input.toLowerCase().trim();
}

function findEntityType(input: string, schemaInfo: SchemaInfo | null): string | null {
  const lower = normalize(input);
  if (!schemaInfo) return null;
  const allTypes = [...(schemaInfo.node_labels || [])];
  for (const type of allTypes) {
    const typeLower = type.toLowerCase();
    if (lower.includes(typeLower) || lower.includes(typeLower.replace(/_/g, " "))) {
      return type;
    }
  }
  return null;
}

function findTwoEntityTypes(input: string, schemaInfo: SchemaInfo | null): [string | null, string | null] {
  const lower = normalize(input);
  if (!schemaInfo) return [null, null];
  const found: string[] = [];
  for (const type of schemaInfo.node_labels || []) {
    const typeLower = type.toLowerCase();
    if (lower.includes(typeLower) || lower.includes(typeLower.replace(/_/g, " "))) {
      found.push(type);
      if (found.length === 2) break;
    }
  }
  return [found[0] || null, found[1] || null];
}

export function translateNLtoSensibleQL(input: string, schemaInfo: SchemaInfo | null): { sensibleql: string; queryType: string } {
  const lower = normalize(input);

  if (lower.match(/what data do i have|show me all items|list all|overview/)) {
    return { sensibleql: "MATCH (n) RETURN n", queryType: "overview" };
  }

  if (lower.match(/how many connections|how many edges|count edges|number of connections/)) {
    return { sensibleql: "COUNT edges", queryType: "count" };
  }

  if (lower.match(/what types|what kinds|distinct types|all types|item types/)) {
    return { sensibleql: "MATCH (n) RETURN DISTINCT labels(n)", queryType: "types" };
  }

  if (lower.match(/show me the most connected|most connected|top connected|most connections/)) {
    return { sensibleql: "MATCH (n)-[r]-(m) RETURN n, count(r) as connections ORDER BY connections DESC", queryType: "mostConnected" };
  }

  const twoTypes = findTwoEntityTypes(input, schemaInfo);
  if (twoTypes[0] && twoTypes[1]) {
    if (lower.match(/show|find|get|list/)) {
      return { sensibleql: `MATCH (n:${twoTypes[0]})--(m:${twoTypes[1]}) RETURN n, m`, queryType: "relationship" };
    }
  }

  const entityType = findEntityType(input, schemaInfo);

  if (lower.match(/what causes|what triggers|what leads to/)) {
    const symptom = entityType || "Symptom";
    return { sensibleql: `MATCH (n:${symptom})<-[r]-(m) RETURN n, r, m`, queryType: "causes" };
  }

  if (lower.match(/how many.*are there|count.*how many|number of/)) {
    const type = entityType || "n";
    const sensibleql = entityType ? `MATCH (n:${entityType}) RETURN count(n)` : "COUNT nodes";
    return { sensibleql, queryType: "count" };
  }

  if (lower.match(/show me all|list all|get all|find all/)) {
    if (entityType) {
      return { sensibleql: `MATCH (n:${entityType}) RETURN n`, queryType: "list" };
    }
    return { sensibleql: "MATCH (n) RETURN n", queryType: "list" };
  }

  if (lower.match(/what.*connected to|connections for|related to|linked to/)) {
    if (entityType) {
      return { sensibleql: `MATCH (n:${entityType})-[r]-(m) RETURN n, r, m`, queryType: "connections" };
    }
    return { sensibleql: "MATCH (n)-[r]-(m) RETURN n, r, m", queryType: "connections" };
  }

  if (lower.match(/show me|show|find|get/)) {
    if (entityType) {
      return { sensibleql: `MATCH (n:${entityType}) RETURN n`, queryType: "list" };
    }
  }

  return { sensibleql: input, queryType: "raw" };
}

async function translateNLtoSensibleQLWithLLM(
  query: string,
  schemaInfo: SchemaInfo | null,
  activeDb: string
): Promise<{ sensibleql: string; queryType: string; explanation?: string }> {
  try {
    const result = await invoke<{ sensibleql: string; explanation?: string }>("translate_nl_to_sensibleql", {
      request: {
        query,
        schema_info: schemaInfo ? JSON.stringify(schemaInfo) : null,
        db_name: activeDb,
      },
      model: null,
      ollamaUrl: null,
    });

    return {
      sensibleql: result.sensibleql,
      queryType: "llm",
      explanation: result.explanation,
    };
  } catch (e) {
    console.warn("LLM translation failed, falling back to regex:", e);
    return translateNLtoSensibleQL(query, schemaInfo);
  }
}

function generateStructuredResponse(queryType: string, result: any, schemaInfo: SchemaInfo | null): StructuredResponse | null {
  const nodes = result?.data?.nodes || [];
  const edgeCount = result?.data?.edges?.length || 0;

  if (queryType === "overview" || queryType === "list") {
    const typeCounts: Record<string, number> = {};
    for (const node of nodes) {
      const label = node?.label || "Unknown";
      const type = node?.type || label;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }

    const breakdownItems = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    return {
      type: "typeBreakdown",
      title: `I found ${nodes.length} item${nodes.length !== 1 ? "s" : ""}`,
      items: breakdownItems,
      summary: nodes.length > 0
        ? `across ${breakdownItems.length} type${breakdownItems.length !== 1 ? "s" : ""}`
        : "but no items matched your query",
    };
  }

  if (queryType === "mostConnected") {
    const connectedItems = nodes.slice(0, 5).map((n: any, i: number) => ({
      name: n?.label || `Item ${n?.id || i + 1}`,
      connections: n?.connections || n?.connection_count || edgeCount,
      type: n?.type || n?.label || "Unknown",
    }));

    return {
      type: "mostConnected",
      title: "Most connected items",
      items: connectedItems,
      summary: `The top item "${connectedItems[0]?.name}" has ${connectedItems[0]?.connections} connections`,
    };
  }

  if (queryType === "connections" || queryType === "relationship" || queryType === "causes") {
    const pathItems = nodes.slice(0, 8).map((n: any) => ({
      name: n?.label || `Item ${n?.id || "?"}`,
      type: n?.type || n?.label || "Unknown",
    }));

    return {
      type: "relationshipPath",
      title: `Found ${nodes.length} connected item${nodes.length !== 1 ? "s" : ""}`,
      items: pathItems,
      summary: edgeCount > 0 ? `via ${edgeCount} connection${edgeCount !== 1 ? "s" : ""}` : "with direct relationships",
    };
  }

  if (queryType === "count") {
    return {
      type: "count",
      title: `Count: ${nodes.length || edgeCount}`,
      items: [],
      summary: nodes.length > 0 ? `found ${nodes.length} items` : `found ${edgeCount} connections`,
    };
  }

  return null;
}

function generateFollowUps(queryType: string, structuredData: StructuredResponse | null): string[] {
  if (queryType === "overview" || queryType === "list") {
    return ["Show details", "What are they connected to?", "Filter by type"];
  }
  if (queryType === "connections" || queryType === "relationship" || queryType === "causes") {
    return ["Show on graph", "What's the strongest link?", "Export results"];
  }
  if (queryType === "count") {
    return ["Show me the details", "Break down by type", "Compare with last period"];
  }
  if (queryType === "mostConnected") {
    return ["Show on graph", "Why is it most connected?", "Show details"];
  }
  return ["Show on graph", "Ask follow-up", "How did I get this?"];
}

const ChatView: Component = () => {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [input, setInput] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [isLlmProcessing, setIsLlmProcessing] = createSignal(false);
  const [expandedNql, setExpandedNql] = createSignal<Set<number>>(new Set());
  let messagesEnd: HTMLDivElement | undefined;

  const scrollToBottom = () => {
    messagesEnd?.scrollIntoView({ behavior: "smooth" });
  };

  createEffect(() => {
    scrollToBottom();
  });

  const executeQuery = async (query: string) => {
    if (!activeDb()) return;
    setIsLoading(true);
    try {
      const result = await sensibleqlExecute(activeDb()!, query);
      return result;
    } catch (e: any) {
      return { success: false, message: String(e), data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const query = text || input();
    if (!query.trim() || !activeDb()) return;

    const userMsg: Message = { role: "user", content: query, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const schemaInfo = schema();
    const dbName = activeDb()!;
    
    setIsLlmProcessing(true);
    let translation: { sensibleql: string; queryType: string; explanation?: string };
    try {
      translation = await translateNLtoSensibleQLWithLLM(query, schemaInfo, dbName);
    } finally {
      setIsLlmProcessing(false);
    }

    const { sensibleql, queryType, explanation } = translation;

    const result = await executeQuery(sensibleql);

    let response = "";
    let structuredData: StructuredResponse | null = null;

    if (result?.success) {
      structuredData = generateStructuredResponse(queryType, result, schemaInfo);

      if (structuredData) {
        response = `${structuredData.title} ${structuredData.summary}`;
      } else {
        const n = result.data?.nodes?.length || 0;
        const e = result.data?.edges?.length || 0;
        response = `I found ${n} item${n !== 1 ? "s" : ""} and ${e} connection${e !== 1 ? "s" : ""} matching your question.`;
        if (n > 0 && n <= 10) {
          response += "\n\nHere they are:\n" + result.data.nodes.map((node: any) => `• ${node.label}`).join("\n");
        }
      }
    } else {
      response = `I couldn't understand that question. Try asking about specific item types like "people", "tasks", or "symptoms".`;
    }

    const followUps = generateFollowUps(queryType, structuredData);

    const assistantMsg: Message = {
      role: "assistant",
      content: response,
      data: result?.data,
      timestamp: Date.now(),
      sensibleql,
      queryType,
      followUps,
      structuredData: structuredData || undefined,
      explanation,
    };
    setMessages(prev => [...prev, assistantMsg]);

    setChatContext({
      lastQuery: query,
      lastNql: sensibleql,
      lastResultType: queryType as any,
      lastEntityTypes: schemaInfo?.node_labels || [],
      lastItemCount: result?.data?.nodes?.length || 0,
      lastEdgeCount: result?.data?.edges?.length || 0,
    });

    setLastQueryResult({
      sensibleql,
      data: result?.data || null,
      nodes: result?.data?.nodes?.map((n: any) => n.id) || [],
      edges: result?.data?.edges?.map((e: any) => e.id) || [],
    });
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleFollowUp = (followUp: string) => {
    if (followUp === "Show on graph") {
      setActiveView("graph");
      return;
    }
    if (followUp === "How did I get this?") {
      return;
    }
    sendMessage(followUp);
  };

  const toggleNqlExpand = (index: number) => {
    const newSet = new Set(expandedNql());
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedNql(newSet);
  };

  createEffect(() => {
    if (messages().length === 0 && activeDb()) {
      const n = nodes().length;
      const e = edges().length;
      setMessages([{
        role: "assistant",
        content: `I can see your database has ${n} items and ${e} connections. Ask me anything about your data!`,
        timestamp: Date.now(),
      }]);
    }
  });

  return (
    <div class="chat-view">
      <div class="chat-messages">
        <For each={messages()}>
          {(msg, index) => (
            <div class={`chat-message ${msg.role}`}>
              <div class="message-avatar">
                {msg.role === "user" ? "👤" : "🤖"}
              </div>
              <div class="message-content">
                <div class="message-text">{msg.content}</div>

                <Show when={msg.structuredData}>
                  {structured => (
                    <div class="structured-response">
                      <Show when={structured().type === "typeBreakdown"}>
                        <div class="type-breakdown">
                          <For each={structured().items}>
                            {(item) => (
                              <div class="type-item">
                                <span class="type-count">{item.count}</span>
                                <span class="type-label">{item.type}</span>
                              </div>
                            )}
                          </For>
                        </div>
                      </Show>

                      <Show when={structured().type === "mostConnected"}>
                        <div class="most-connected-list">
                          <For each={structured().items}>
                            {(item, i) => (
                              <div class="connected-item">
                                <span class="rank">#{i() + 1}</span>
                                <span class="item-name">{item.name}</span>
                                <span class="item-type">{item.type}</span>
                                <span class="item-connections">{item.connections} connections</span>
                              </div>
                            )}
                          </For>
                        </div>
                      </Show>

                      <Show when={structured().type === "relationshipPath"}>
                        <div class="relationship-path">
                          <For each={structured().items}>
                            {(item, i) => (
                              <>
                                <span class="path-node">{item.name}</span>
                                <Show when={i() < structured().items.length - 1}>
                                  <span class="path-connector">→</span>
                                </Show>
                              </>
                            )}
                          </For>
                        </div>
                      </Show>
                    </div>
                  )}
                </Show>

                <Show when={msg.data && msg.data.nodes && msg.data.nodes.length > 0}>
                  <div class="message-data">
                    <details>
                      <summary>Show raw data ({msg.data.nodes.length} items)</summary>
                      <pre>{JSON.stringify(msg.data, null, 2)}</pre>
                    </details>
                  </div>
                </Show>

                <Show when={msg.sensibleql}>
                  <div class="sensibleql-explain-section">
                    <button
                      class="sensibleql-toggle-btn"
                      onClick={() => toggleNqlExpand(index())}
                    >
                      {expandedNql().has(index()) ? "▾" : "▸"} How did I get this?
                    </button>
                    <Show when={expandedNql().has(index())}>
                      <div class="sensibleql-explanation">
                        <Show when={msg.explanation}>
                          <p class="explanation-text">
                            <span class="explanation-badge">LLM</span> {msg.explanation}
                          </p>
                        </Show>
                        <div class="sensibleql-code">
                          <code>{msg.sensibleql}</code>
                        </div>
                      </div>
                    </Show>
                  </div>
                </Show>

                <Show when={msg.followUps && msg.followUps.length > 0}>
                  <div class="follow-up-chips">
                    <For each={msg.followUps}>
                      {(fu) => (
                        <button
                          class="follow-up-chip"
                          onClick={() => handleFollowUp(fu)}
                        >
                          {fu}
                        </button>
                      )}
                    </For>
                  </div>
                </Show>

                <Show when={msg.queryType && msg.data?.nodes?.length > 0}>
                  <div class="message-actions">
                    <button
                      class="action-btn show-on-graph"
                      onClick={() => setActiveView("graph")}
                    >
                      Show on graph
                    </button>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
        {isLoading() && (
          <div class="chat-message assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd!} />
      </div>

      <div class="chat-input-area">
        <Show when={messages().length <= 1}>
          <div class="chat-suggestions">
            <For each={initialSuggestions}>
              {(s) => (
                <button class="suggestion-btn" onClick={() => handleSuggestion(s)}>
                  {s}
                </button>
              )}
            </For>
          </div>
        </Show>
        <div class="chat-input-row">
          <input
            type="text"
            value={input()}
            onInput={(e) => setInput(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading() && sendMessage()}
            placeholder={activeDb() ? "Ask about your data..." : "Connect to a database first"}
            disabled={!activeDb() || isLoading()}
          />
          <button onClick={() => sendMessage()} disabled={!activeDb() || isLoading() || !input().trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
