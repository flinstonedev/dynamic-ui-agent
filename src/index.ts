// Main library exports
export { respond, createAgent, type AgentConfig, type LLMConfig } from './agent/index.js';
export {
  AgentResponseSchema,
  UIElementSchema,
  ChatMessageSchema,
  MessageRoleSchema,
  BUILT_IN_SYSTEM_PROMPT,
  type AgentResponse,
  type UIElement,
  type ChatMessage,
  type MessageRole,
  type UIAction,
} from './agent/schema.js';

// Re-export commonly used utilities
export { assignIdsToTree } from './agent/index.js';

// Note: React components are in separate export paths
// Import from 'dynamic-ui-agent/react' if needed
