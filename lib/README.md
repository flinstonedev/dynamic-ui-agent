# Dynamic UI Agent 🤖

A flexible, schema-agnostic AI agent library for generating structured data from natural language prompts. The agent uses Zod schemas to return strongly-typed, predictable structures that can be rendered in React or consumed by any app. Great for dynamic UI, data pipelines, and more.

## Overview

Dynamic UI Agent generates structured UI (and arbitrary typed data) from natural language prompts. It validates outputs against Zod, auto-assigns IDs for UI trees, and supports multi-turn conversations via history.

## Features

✨ Schema-agnostic (bring your own Zod schema)
🎛️ Flexible LLM config (OpenAI, Anthropic, Google, etc.)
⚛️ Optional React renderer for UI schemas
📦 Type-safe with full TS support
🔧 Configurable prompts, temperature, models
🎯 Function-based API (no classes)

## Installation

```bash
npm install dynamic-ui-agent ai zod
```

Optionally install a provider:
```bash
npm install @ai-sdk/openai         # OpenAI
npm install @ai-sdk/anthropic      # Anthropic
npm install @ai-sdk/google         # Google
```

For React components (optional):
```bash
npm install react react-dom
```

## Environment Setup

Set your provider API key via environment variables (e.g., `OPENAI_API_KEY`) according to your chosen provider.

## Quick Start

### Built-in UI Schema
```typescript
import { respond } from 'dynamic-ui-agent';
import { openai } from '@ai-sdk/openai';

const response = await respond('Create a login form with email and password', {
  llm: { provider: openai, model: 'gpt-4o-mini', temperature: 1 }
});

console.log(response.ui); // Array of UI elements
```

### Use Your Own Schema
```typescript
import { respond } from 'dynamic-ui-agent';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';

const RecipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.object({ item: z.string(), amount: z.string() })),
  steps: z.array(z.string()),
  cookTime: z.number(),
});

const recipe = await respond('Create a lasagna recipe', {
  schema: RecipeSchema,
  llm: { provider: anthropic, model: 'claude-3-5-sonnet-20241022', temperature: 0.7 }
});
```

### Factory Pattern
```typescript
import { createAgent } from 'dynamic-ui-agent';
import { openai } from '@ai-sdk/openai';

const agent = createAgent({
  systemPrompt: 'You are a helpful UI designer',
  llm: { provider: openai, model: 'gpt-4o' },
  history: [],
});

const response1 = await agent.respond('Create a contact form');
const response2 = await agent.respond('Make it more colorful');
```

## Architecture & Principles

- Function-based: pure functions and factory functions; no classes
- State is external and passed in; configuration via arguments
- Strong schema-first contract using Zod

Core modules (see `lib/src`):
- `agent/` — public API (`respond`, `createAgent`), helpers (`assignIdsToTree`), types/schemas
- `react/` — `DynamicUIRenderer` for rendering UI schema in React

Data flow:
1. Prompt → `respond()` with schema
2. AI SDK validates against Zod schema
3. IDs auto-assigned to UI elements
4. Structured JSON returned; React renderer interprets it (optional)

## Schema → UI Rendering Guide

Relationship:
```
Schema → AI generates structured data → Renderer interprets → UI Components
```

Approaches:
- Use built-in renderer with your own components (map variants, actions)
- Create a custom schema + custom renderer that matches your design system
- Metadata/semantic schema that you can map to any UI library

Example (Input element):
```typescript
const UIInput = z.object({
  type: z.literal('input'),
  props: z.object({ name: z.string(), label: z.string().optional(), inputType: z.enum(['text','email','password']) })
});
```
Renderer switch (simplified):
```tsx
switch (element.type) {
  case 'input': return <Input name={...} type={...} label={...} />
}
```

## React Components

```typescript
import { DynamicUIRenderer } from 'dynamic-ui-agent/react';
```
`DynamicUIRenderer` renders the built-in UI schema and exposes `onAction` for callbacks.

## Built-in UI Schema

Types supported:
- text, heading, button, input, form, list, table, code, container

See the schema at `lib/src/agent/schema.ts`.

## Conversation History

Maintain multi-turn context via `history`:
```typescript
const agent = createAgent({ history: [] });
const res = await agent.respond('Build a contact form');
```

## Extending the Schema

1) Add a new union case to `UIElementSchema`
2) Add rendering logic to the React renderer if using it
3) Rebuild/publish

## API Reference

### `respond<TSchema>(prompt: string, config?: AgentConfig<TSchema>)`
- `schema?: ZodSchema` (defaults to built-in UI schema)
- `systemPrompt?: string`
- `history?: ChatMessage[]`
- `llm?: LLMConfig` — provider, model, temperature, maxTokens, topP
- `autoAssignIds?: boolean` (default true)

Returns: `Promise<z.infer<TSchema>>`

### `createAgent<TSchema>(config?: AgentConfig<TSchema>)`
Returns an object with:
- `respond(prompt: string)`
- `getConfig()`

## Using with Different LLM Providers

```typescript
import { openai } from '@ai-sdk/openai';
await respond('Create a signup form', { llm: { provider: openai, model: 'gpt-4o-mini' } });
```
```typescript
import { anthropic } from '@ai-sdk/anthropic';
await respond('Design a pricing table', { llm: { provider: anthropic, model: 'claude-3-5-sonnet-20241022' } });
```
```typescript
import { google } from '@ai-sdk/google';
await respond('Build a user profile form', { llm: { provider: google, model: 'gemini-1.5-pro' } });
```

## Publishing Your Fork

1. Update `package.json` fields
2. `npm run build` then `npm publish`

## License

Apache 2.0 - See LICENSE file

## Contributing

Contributions welcome! Please open an issue or PR.
