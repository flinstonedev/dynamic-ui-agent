# Dynamic UI Agent 🤖

A flexible, schema-agnostic AI agent library for generating structured data from natural language prompts. Perfect for creating dynamic UI components, forms, data structures, or any structured output using LLMs.

## Features

✨ **Schema-Agnostic** - Use your own Zod schemas or the built-in UI schema
🎛️ **Flexible LLM Configuration** - Works with OpenAI, Anthropic, or any AI SDK provider
⚛️ **React Components Included** - Optional React renderer for UI schemas
📦 **Type-Safe** - Full TypeScript support with inferred types
🔧 **Configurable** - Control temperature, model, system prompts, and more
🎯 **Function-Based** - Clean, functional API with no classes

## Installation

```bash
npm install dynamic-ui-agent ai zod
```

For OpenAI (or install your preferred provider):
```bash
npm install @ai-sdk/openai
```

For React components (optional):
```bash
npm install react react-dom
```

## Quick Start

### Basic Usage with Built-in UI Schema

```typescript
import { respond } from 'dynamic-ui-agent';
import { openai } from '@ai-sdk/openai';

const response = await respond('Create a login form with email and password', {
  llm: {
    provider: openai,
    model: 'gpt-4o-mini',
    temperature: 1,
  }
});

console.log(response.ui); // Array of UI elements
```

### Using Your Own Schema

```typescript
import { respond } from 'dynamic-ui-agent';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';

// Define your custom schema
const RecipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.object({
    item: z.string(),
    amount: z.string(),
  })),
  steps: z.array(z.string()),
  cookTime: z.number(),
});

// Use with any LLM provider
const recipe = await respond('Create a lasagna recipe', {
  schema: RecipeSchema,
  llm: {
    provider: anthropic,
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
  }
});

console.log(recipe.name); // Fully typed!
```

### Factory Pattern

```typescript
import { createAgent } from 'dynamic-ui-agent';
import { openai } from '@ai-sdk/openai';

const agent = createAgent({
  systemPrompt: 'You are a helpful UI designer',
  llm: {
    provider: openai,
    model: 'gpt-4o',
  },
  history: [],
});

// Use the agent
const response1 = await agent.respond('Create a contact form');
const response2 = await agent.respond('Make it more colorful');
```

## API Reference

### `respond<TSchema>(prompt: string, config?: AgentConfig<TSchema>)`

Generate structured output from a prompt.

**Parameters:**
- `prompt` - The user's natural language request
- `config` (optional):
  - `schema?: ZodSchema` - Custom Zod schema (defaults to built-in UI schema)
  - `systemPrompt?: string` - Custom system prompt
  - `history?: ChatMessage[]` - Conversation history
  - `llm?: LLMConfig` - LLM configuration:
    - `provider?: any` - AI SDK provider (openai, anthropic, etc.)
    - `model?: string | LanguageModelV1` - Model name or instance
    - `temperature?: number` - Sampling temperature
    - `maxTokens?: number` - Maximum tokens to generate
    - `topP?: number` - Nucleus sampling parameter
  - `autoAssignIds?: boolean` - Auto-assign IDs to UI elements (default: true)

**Returns:** Promise<z.infer<TSchema>>

### `createAgent<TSchema>(config?: AgentConfig<TSchema>)`

Create an agent factory with bound configuration.

**Returns:**
- `respond(prompt: string)` - Generate response
- `getConfig()` - Get current configuration

## Using with Different LLM Providers

### OpenAI

```typescript
import { openai } from '@ai-sdk/openai';

const response = await respond('Create a signup form', {
  llm: {
    provider: openai,
    model: 'gpt-4o-mini',
  }
});
```

### Anthropic

```typescript
import { anthropic } from '@ai-sdk/anthropic';

const response = await respond('Design a pricing table', {
  llm: {
    provider: anthropic,
    model: 'claude-3-5-sonnet-20241022',
  }
});
```

### Google Gemini

```typescript
import { google } from '@ai-sdk/google';

const response = await respond('Build a user profile form', {
  llm: {
    provider: google,
    model: 'gemini-1.5-pro',
  }
});
```

## React Components

The library includes optional React components for rendering the built-in UI schema.

```typescript
import { DynamicUIRenderer } from 'dynamic-ui-agent/react';
import { respond } from 'dynamic-ui-agent';

function MyComponent() {
  const [response, setResponse] = useState(null);

  useEffect(() => {
    respond('Create a contact form').then(setResponse);
  }, []);

  return response && (
    <DynamicUIRenderer 
      response={response}
      onAction={(actionId, payload) => {
        console.log('Action:', actionId, payload);
      }}
    />
  );
}
```

## Built-in UI Schema

The default schema supports:
- **text** - Paragraphs with variants
- **heading** - H1-H4 headings
- **button** - Buttons with actions
- **input** - Form inputs
- **form** - Forms with validation
- **list** - Lists
- **table** - Data tables
- **code** - Code blocks
- **container** - Layout containers

See the full schema in `dynamic-ui-agent/schema`.

## Custom Schemas

You can use any Zod schema:

```typescript
const DataAnalysisSchema = z.object({
  insights: z.array(z.string()),
  metrics: z.object({
    total: z.number(),
    average: z.number(),
    trend: z.enum(['up', 'down', 'stable']),
  }),
  recommendations: z.array(z.string()),
});

const analysis = await respond('Analyze this sales data: [...]', {
  schema: DataAnalysisSchema,
});
```

## Publishing Your Own Fork

To publish your own version:

1. Update `package.json` with your details:
   ```json
   {
     "name": "your-ui-agent",
     "author": "Your Name",
     "repository": "github:yourusername/your-ui-agent"
   }
   ```

2. Build and publish:
   ```bash
   npm run build
   npm publish
   ```

## License

MIT - See LICENSE file

## Contributing

Contributions welcome! Please open an issue or PR.
