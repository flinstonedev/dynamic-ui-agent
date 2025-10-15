# Dynamic UI Agent 🤖

A flexible, schema-agnostic AI agent library for generating structured UI components from natural language prompts.

## Project Structure

```
dynamic-ui-agent/
├── lib/                  # 📦 The publishable npm package
│   ├── src/
│   │   ├── agent/       # Core agent logic
│   │   └── react/       # React renderer
│   └── dist/            # Built output
├── examples/             # 🎨 Example applications
│   └── nextjs-chat/     # Next.js chat demo with AI Elements
└── .github/              # GitHub workflows (release/publish)
```

## Quick Start

### Installation

```bash
npm install dynamic-ui-agent ai zod
npm install @ai-sdk/openai  # or your preferred provider
```

### Basic Usage

```typescript
import { respond } from 'dynamic-ui-agent';
import { openai } from '@ai-sdk/openai';

// Generate a login form
const response = await respond('Create a login form with email and password', {
  llm: {
    provider: openai,
    model: 'gpt-4o-mini',
    temperature: 1,
  }
});

console.log(response.ui); // Array of structured UI elements
```

## Examples

### 1. Simple Form Generation

```typescript
import { respond } from 'dynamic-ui-agent';
import { openai } from '@ai-sdk/openai';

const formResponse = await respond('Create a contact form with name, email, and message fields', {
  llm: { provider: openai, model: 'gpt-4o-mini' }
});

// Returns structured UI with form elements
console.log(formResponse.ui);
```

### 2. Custom Schema (Non-UI Data)

```typescript
import { respond } from 'dynamic-ui-agent';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';

// Define your own schema
const RecipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.object({
    item: z.string(),
    amount: z.string(),
  })),
  steps: z.array(z.string()),
  cookTime: z.number(),
});

const recipe = await respond('Create a chocolate chip cookie recipe', {
  schema: RecipeSchema,
  llm: {
    provider: anthropic,
    model: 'claude-3-5-sonnet-20241022',
  }
});

console.log(recipe.name); // Fully typed!
```

### 3. React Component with Renderer

```typescript
import { DynamicUIRenderer } from 'dynamic-ui-agent/react';
import { respond } from 'dynamic-ui-agent';
import { useState, useEffect } from 'react';

function MyApp() {
  const [response, setResponse] = useState(null);

  useEffect(() => {
    respond('Create a pricing table with 3 tiers')
      .then(setResponse);
  }, []);

  const handleAction = (actionId: string, payload?: any) => {
    console.log('User action:', actionId, payload);
  };

  return response && (
    <DynamicUIRenderer 
      response={response}
      onAction={handleAction}
    />
  );
}
```

### 4. Multi-turn Conversation with History

```typescript
import { createAgent } from 'dynamic-ui-agent';
import { openai } from '@ai-sdk/openai';

const agent = createAgent({
  systemPrompt: 'You are a helpful UI designer',
  llm: { provider: openai, model: 'gpt-4o' },
  history: [],
});

// First request
const response1 = await agent.respond('Create a user profile form');

// Follow-up request (maintains context)
const response2 = await agent.respond('Add a profile picture upload field');
```

### 5. Next.js API Route

```typescript
// app/api/chat/route.ts
import { respond } from 'dynamic-ui-agent';
import { openai } from '@ai-sdk/openai';
import type { ChatMessage } from 'dynamic-ui-agent/schema';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const lastMessage = messages[messages.length - 1];
  const history: ChatMessage[] = messages.slice(0, -1).map((msg: any) => ({
    role: msg.role,
    content: msg.content,
  }));

  const agentResponse = await respond(lastMessage.content, {
    llm: { provider: openai, model: 'gpt-4o-mini' },
    history
  });

  return Response.json(agentResponse);
}
```

### 6. Different LLM Providers

```typescript
import { respond } from 'dynamic-ui-agent';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

// OpenAI
const openaiResult = await respond('Create a dashboard', {
  llm: { provider: openai, model: 'gpt-4o' }
});

// Anthropic Claude
const claudeResult = await respond('Create a dashboard', {
  llm: { provider: anthropic, model: 'claude-3-5-sonnet-20241022' }
});

// Google Gemini
const geminiResult = await respond('Create a dashboard', {
  llm: { provider: google, model: 'gemini-1.5-pro' }
});
```

## Running the Demo

```bash
# Install dependencies (using npm workspaces)
npm install

# Build the library
npm run build

# Run the Next.js demo
npm run dev
```

The demo will start at [http://localhost:3000](http://localhost:3000)

## Documentation

- **[Library Documentation](./lib/README.md)** - Full library usage and API

## What's Included

### Library (`lib/`)
- Flexible agent API supporting any Zod schema
- Multiple LLM provider support (OpenAI, Anthropic, etc.)
- Built-in UI schema with common components
- React renderer with shadcn/ui components
- TypeScript types and comprehensive exports

### Demo (`examples/nextjs-chat/`)
- Full-featured chat interface using Vercel AI SDK
- Dynamic UI component generation
- Interactive form handling
- Modern styling with Tailwind CSS and shadcn/ui

## Development

```bash
# Build the library
npm run build

# Type-check all workspaces
npm run typecheck

# Clean all build artifacts
npm run clean
```

## Releases & Publishing

1) Add NPM_TOKEN secret in your GitHub repo settings (for npm publish)
2) Bump version in lib (pick one):
   - npm --workspace=lib version patch
   - npm --workspace=lib version minor
   - npm --workspace=lib version major
3) Push the commit and tag to trigger the workflow:
   - git push origin HEAD --follow-tags

This creates a GitHub Release and publishes lib to npm.

## License

Apache 2.0 - See [LICENSE](./LICENSE)
