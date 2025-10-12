import { z } from 'zod';

export const MessageRoleSchema = z.enum(['system', 'user', 'assistant', 'tool']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const ChatMessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string().min(1),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const UIInput = z.object({
  type: z.literal('input'),
  id: z.string().optional(),
  props: z.object({
    name: z.string(),
    label: z.string().optional(),
    placeholder: z.string().optional(),
    value: z.union([z.string(), z.number()]).optional(),
    required: z.boolean().optional(),
    inputType: z.enum(['text', 'email', 'password', 'number', 'date']).default('text'),
  }),
});

const UIForm = z.object({
  type: z.literal('form'),
  id: z.string().optional(),
  props: z.object({
    title: z.string().optional(),
    fields: z.array(UIInput).default([]),
    submitLabel: z.string().default('Submit'),
    actionId: z.string().optional(),
  }),
});

export const UIElementSchema: any = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    id: z.string().optional(),
    props: z.object({
      text: z.string(),
      variant: z.enum(['body', 'muted', 'caption']).default('body'),
    }),
  }),
  z.object({
    type: z.literal('heading'),
    id: z.string().optional(),
    props: z.object({
      text: z.string(),
      level: z.number().int().min(1).max(4).default(2),
    }),
  }),
  z.object({
    type: z.literal('button'),
    id: z.string().optional(),
    props: z.object({
      label: z.string(),
      variant: z.enum(['primary', 'secondary', 'danger']).default('primary'),
      actionId: z.string().optional(),
    }),
  }),
  UIInput,
  UIForm,
  z.object({
    type: z.literal('list'),
    id: z.string().optional(),
    props: z.object({
      items: z.array(z.string()),
    }),
  }),
  z.object({
    type: z.literal('table'),
    id: z.string().optional(),
    props: z.object({
      columns: z.array(
        z.object({
          key: z.string(),
          header: z.string(),
        })
      ),
      rows: z.array(z.record(z.any())),
    }),
  }),
  z.object({
    type: z.literal('code'),
    id: z.string().optional(),
    props: z.object({
      language: z.string().default('txt'),
      code: z.string(),
    }),
  }),
  z.object({
    type: z.literal('container'),
    id: z.string().optional(),
    props: z.object({
      direction: z.enum(['row', 'column']).default('column'),
      gap: z.number().min(0).max(48).default(12),
      align: z.enum(['start', 'center', 'end', 'stretch']).default('start'),
      justify: z.enum(['start', 'center', 'end', 'between']).default('start'),
    }),
    children: z.array(z.lazy((): any => UIElementSchema)).default([]),
  }),
]);
export type UIElement = z.infer<typeof UIElementSchema>;

export const UIActionSchema = z.object({
  id: z.string(),
  type: z.enum(['submit', 'navigate', 'open_url', 'emit_event', 'call']),
  label: z.string().optional(),
  params: z.record(z.any()).optional(),
});
export type UIAction = z.infer<typeof UIActionSchema>;

export const AgentResponseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  messages: z.array(ChatMessageSchema).default([]),
  ui: z.array(UIElementSchema).default([]),
  actions: z.array(UIActionSchema).default([]),
  suggestions: z.array(z.string()).default([]),
  followUpQuestion: z.string().optional(),
});
export type AgentResponse = z.infer<typeof AgentResponseSchema>;

export const BUILT_IN_SYSTEM_PROMPT = `You are Dynamic UI Agent. Return ONLY structured JSON that follows the provided Zod schema. Generate concise UI elements to fulfill the user's intent. Prefer semantic components (container, heading, text, form, input, button, table, list, code). Suggest next steps (suggestions) and a follow-up question when useful. Do not include markdown or prose outside JSON.

IMPORTANT: For form elements, each field in the 'fields' array MUST be a complete UIInput object with 'type: "input"' and a 'props' object containing name, label, placeholder, inputType, and required fields. Example:
{
  "type": "form",
  "props": {
    "fields": [
      {
        "type": "input",
        "props": {
          "name": "email",
          "label": "Email",
          "inputType": "email"
        }
      }
    ]
  }
}`;
