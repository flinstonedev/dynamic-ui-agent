import { generateText, tool, LanguageModelV1 } from 'ai';
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
  temperature: 0.3, // Lower temperature for better schema compliance
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
    // Define a tool that forces the model to return structured data matching the schema
    const emitResponse = tool({
      description: 'Emit the structured UI response as a single AgentResponse object.',
      parameters: schema,
      execute: async (args) => args, // Passthrough - just validate and return
    });

    const generateConfig: any = {
      model,
      tools: { emitResponse },
      toolChoice: 'required', // Force the model to call the tool (no free text)
      messages: [
        { role: 'system', content: systemPrompt + '\n\nYou MUST call the emitResponse tool with a valid response object. Do not output free text.' },
        ...history,
        { role: 'user', content: userPrompt },
      ],
    };

    // Add optional LLM parameters
    if (llmConfig.temperature !== undefined) generateConfig.temperature = llmConfig.temperature;
    if (llmConfig.maxTokens !== undefined) generateConfig.maxTokens = llmConfig.maxTokens;
    if (llmConfig.topP !== undefined) generateConfig.topP = llmConfig.topP;

    const result = await generateText(generateConfig);

    // Extract the tool result (already validated against schema by the SDK)
    const toolCalls = result.toolCalls;
    if (!toolCalls || toolCalls.length === 0) {
      throw new Error('Model did not call the required tool');
    }

    const response = toolCalls[0].args as z.infer<TSchema>;
    
    // Only auto-assign IDs if using the default schema and autoAssignIds is true
    if (autoAssignIds && config?.schema === undefined) {
      return ensureIds(response as any) as z.infer<TSchema>;
    }
    
    return response;
  } catch (err) {
    console.error('Error generating response:', err);

    // Fallback: build a safe, best-effort UI close to the user's request
    const fallback = buildFallbackResponse(userPrompt);
    if (autoAssignIds && config?.schema === undefined) {
      return ensureIds(fallback as any) as z.infer<TSchema>;
    }
    return fallback as any as z.infer<TSchema>;
  }
}

function buildFallbackResponse(prompt: string): AgentResponse {
  const lower = prompt.toLowerCase();
  // Simple heuristics to approximate user's intent
  if (/(pricing|plans|tiers?)/.test(lower)) {
    return {
      title: 'Pricing',
      description: 'Auto-generated pricing table (fallback)',
      messages: [],
      ui: [
        {
          type: 'table',
          props: {
            columns: [
              { key: 'tier', header: 'Tier' },
              { key: 'price', header: 'Price' },
              { key: 'features', header: 'Features' },
            ],
            rows: [
              { tier: 'Basic', price: '$10/mo', features: 'Feature A, Feature B' },
              { tier: 'Pro', price: '$20/mo', features: 'Feature A, Feature B, Feature C' },
            ],
          },
        },
      ],
      actions: [],
      suggestions: ['Show enterprise tier', 'Add billing cycle switcher'],
    };
  }

  if (/(dashboard|stat|kpi|metric|card)/.test(lower)) {
    return {
      title: 'Dashboard',
      description: 'Auto-generated stats card (fallback)',
      messages: [],
      ui: [
        {
          type: 'container',
          props: { direction: 'row', gap: 16, align: 'start', justify: 'start' },
          children: [
            statCard('Users', '1,234', '+12% MoM'),
            statCard('Revenue', '$56,789', '+5% MoM'),
            statCard('Conversion', '3.2%', '+0.3 pp'),
          ],
        } as any,
      ],
      actions: [],
      suggestions: ['Show last 7 days', 'Add sparkline', 'Breakdown by segment'],
    } as AgentResponse;
  }

  // Generic fallback: echo prompt and provide a basic container
  return {
    title: 'Generated UI',
    description: 'Auto-generated fallback based on your prompt',
    messages: [],
    ui: [
      {
        type: 'container',
        props: { direction: 'column', gap: 12, align: 'start', justify: 'start' },
        children: [
          { type: 'heading', props: { text: 'Request', level: 3 } } as any,
          { type: 'text', props: { text: prompt, variant: 'body' } } as any,
        ],
      } as any,
    ],
    actions: [],
    suggestions: ['Clarify fields or layout', 'Include data examples'],
  } as AgentResponse;
}

function statCard(label: string, value: string, hint?: string): any {
  return {
    type: 'container',
    props: { direction: 'column', gap: 8, align: 'start', justify: 'start' },
    children: [
      { type: 'text', props: { text: label, variant: 'muted' } },
      { type: 'heading', props: { text: value, level: 2 } },
      ...(hint ? [{ type: 'text', props: { text: hint, variant: 'caption' } }] : []),
    ],
  } as any;
}

export function createAgent<TSchema extends ZodSchema = typeof AgentResponseSchema>(
  config?: AgentConfig<TSchema>
) {
  return {
    respond: (userPrompt: string) => respond(userPrompt, config),
    getConfig: () => config,
  };
}
