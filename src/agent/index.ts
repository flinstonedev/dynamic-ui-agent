import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { randomUUID } from 'crypto';
import {
  AgentResponseSchema,
  type AgentResponse,
  type ChatMessage,
  type UIElement,
  BUILT_IN_SYSTEM_PROMPT,
} from './schema.js';

export interface AgentConfig {
  systemPrompt?: string;
  model?: string;
  history?: ChatMessage[];
}

const DEFAULT_MODEL = 'gpt-5';

function assignIdsToTree(nodes: UIElement[]): UIElement[] {
  return nodes.map((node) => {
    const id = node.id ?? randomUUID();
    if (node.type === 'container' || node.type === 'form') {
      const anyNode: any = node as any;
      const children = anyNode.children ? assignIdsToTree(anyNode.children) : undefined;
      const props = anyNode.props;
      const fields = props?.fields ? (props.fields as UIElement[]).map((f) => ({ ...f, id: f.id ?? randomUUID() })) : undefined;
      return {
        ...anyNode,
        id,
        ...(children ? { children } : {}),
        props: { ...props, ...(fields ? { fields } : {}) },
      } as UIElement;
    }
    return { ...(node as any), id } as UIElement;
  });
}

function ensureIds(resp: AgentResponse): AgentResponse {
  const withIds = { ...resp };
  withIds.ui = assignIdsToTree(resp.ui);
  return withIds;
}

export async function respond(userPrompt: string, config?: AgentConfig): Promise<AgentResponse> {
  const systemPrompt = config?.systemPrompt ?? BUILT_IN_SYSTEM_PROMPT;
  const modelName = config?.model ?? DEFAULT_MODEL;
  const history = config?.history ?? [];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY environment variable is not set');
    console.error('Error:', error.message);
    throw error;
  }

  try {
    const result = await generateObject({
      model: openai(modelName),
      schema: AgentResponseSchema,
      temperature: 1,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userPrompt },
      ],
    });

    const response = result.object as AgentResponse;
    return ensureIds(response);
  } catch (err) {
    console.error('Error generating response:', err);
    throw err;
  }
}

export function createAgent(config?: AgentConfig) {
  const systemPrompt = config?.systemPrompt ?? BUILT_IN_SYSTEM_PROMPT;
  const modelName = config?.model ?? DEFAULT_MODEL;
  const history = config?.history ?? [];

  return {
    respond: (userPrompt: string) => respond(userPrompt, { systemPrompt, model: modelName, history }),
    getConfig: () => ({ systemPrompt, model: modelName, history }),
  };
}
