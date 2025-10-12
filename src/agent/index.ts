import { generateObject, LanguageModelV1 } from 'ai';
import { openai } from '@ai-sdk/openai';
import { randomUUID } from 'crypto';
import { z, type ZodSchema } from 'zod';
import {
  AgentResponseSchema,
  type AgentResponse,
  type ChatMessage,
  type UIElement,
  BUILT_IN_SYSTEM_PROMPT,
} from './schema.js';

export interface LLMConfig {
  provider?: any; // e.g., openai, anthropic, etc.
  model?: string | LanguageModelV1;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  [key: string]: any; // Allow other provider-specific options
}

export interface AgentConfig<TSchema extends ZodSchema = typeof AgentResponseSchema> {
  systemPrompt?: string;
  schema?: TSchema;
  history?: ChatMessage[];
  llm?: LLMConfig;
  autoAssignIds?: boolean; // Whether to auto-assign IDs to UI elements
}

const DEFAULT_LLM_CONFIG: LLMConfig = {
  model: 'gpt-4o-mini',
  temperature: 1,
};

export function assignIdsToTree(nodes: UIElement[]): UIElement[] {
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

export async function respond<TSchema extends ZodSchema = typeof AgentResponseSchema>(
  userPrompt: string,
  config?: AgentConfig<TSchema>
): Promise<z.infer<TSchema>> {
  const systemPrompt = config?.systemPrompt ?? BUILT_IN_SYSTEM_PROMPT;
  const schema = (config?.schema ?? AgentResponseSchema) as TSchema;
  const history = config?.history ?? [];
  const llmConfig = { ...DEFAULT_LLM_CONFIG, ...config?.llm };
  const autoAssignIds = config?.autoAssignIds ?? true;

  // Resolve the model
  let model: LanguageModelV1;
  if (typeof llmConfig.model === 'string') {
    // If it's a string, use the provider (default to openai)
    const provider = llmConfig.provider ?? openai;
    model = provider(llmConfig.model);
  } else if (llmConfig.model) {
    // If it's already a LanguageModelV1, use it directly
    model = llmConfig.model;
  } else {
    // Fallback to default
    model = openai(DEFAULT_LLM_CONFIG.model as string);
  }

  try {
    const generateConfig: any = {
      model,
      schema,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userPrompt },
      ],
    };

    // Add optional LLM parameters
    if (llmConfig.temperature !== undefined) generateConfig.temperature = llmConfig.temperature;
    if (llmConfig.maxTokens !== undefined) generateConfig.maxTokens = llmConfig.maxTokens;
    if (llmConfig.topP !== undefined) generateConfig.topP = llmConfig.topP;

    const result = await generateObject(generateConfig);

    const response = result.object as z.infer<TSchema>;
    
    // Only auto-assign IDs if using the default schema and autoAssignIds is true
    if (autoAssignIds && config?.schema === undefined) {
      return ensureIds(response as any) as z.infer<TSchema>;
    }
    
    return response;
  } catch (err) {
    console.error('Error generating response:', err);
    throw err;
  }
}

export function createAgent<TSchema extends ZodSchema = typeof AgentResponseSchema>(
  config?: AgentConfig<TSchema>
) {
  return {
    respond: (userPrompt: string) => respond(userPrompt, config),
    getConfig: () => config,
  };
}
