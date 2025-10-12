# Dynamic UI Agent

A lightweight wrapper around the AI SDK that takes a user prompt and returns a structured response for rendering in a React application. The agent is intended to "vibe code" interfaces by describing UI structures that you can render and iterate on with back-and-forth interactions.

## Features

- 🎨 **Interactive Chat Interface** - Built-in Next.js chat UI for real-time component generation
- 📐 **Zod Schema** - Predictable, strongly-typed UI structures
- 🤖 **AI-Powered** - Wrapper around the AI SDK's object generation
- ⚛️ **React Renderer** - Minimal component for quick prototyping
- 🔄 **Conversation History** - Multi-turn interactions to refine components
- 🛠️ **Function-Based Architecture** - No classes, pure functions throughout

## Getting Started

### Quick Start with Chat Interface

1. **Install dependencies**

```bash
npm install
```

2. **Set your OpenAI API key** (required)

Create a `.env` file in the project root:

```bash
OPENAI_API_KEY=your_api_key_here
```

Or export it in your shell:

```bash
export OPENAI_API_KEY={{OPENAI_API_KEY}}
```

3. **Start the development server**

```bash
npm run dev
```

4. **Open your browser** at [http://localhost:3000](http://localhost:3000)

You'll see a chat interface where you can describe UI components and watch them generate in real-time!

### Try the CLI Demo

To see the raw JSON output:

```bash
npm run example
```

This runs the demo in `src/examples/demo.ts` and logs the structured response.

## Built-in Chat Interface

The project includes a fully-functional Next.js chat interface at `/app/page.tsx`. Features include:

- 💬 **Real-time chat** with the AI agent
- 🎯 **Dynamic UI rendering** of generated components
- 🔄 **Iterative refinement** through conversation
- 💡 **Suggestions** for next steps
- 📱 **Responsive design** with Tailwind CSS

### Example Prompts

Try these in the chat interface:

- "Create a login form with email and password"
- "Build a pricing table with 3 tiers"
- "Make a dashboard card with stats"
- "Design a user profile form"

Then refine with follow-ups like:
- "Add a remember me checkbox"
- "Make the primary button red"
- "Add validation messages"

## Library Usage

You can also use the Dynamic UI Agent as a library in your own projects.

### Option 1: Direct function call

```tsx
import React, { useState } from 'react';
import { respond } from './src/agent/index';
import { DynamicUIRenderer } from './src/react/Renderer';
import type { AgentResponse } from './src/agent/schema';

export function App() {
  const [response, setResponse] = useState<AgentResponse | null>(null);

  async function handlePrompt(prompt: string) {
    try {
      const res = await respond(prompt);
      setResponse(res);
    } catch (error) {
      console.error('Failed to generate UI:', error);
    }
  }

  function handleAction(actionId: string, payload?: unknown) {
    console.log('Action:', actionId, payload);
    // Route actions back to your backend/agent for further steps
  }

  return (
    <div>
      <button onClick={() => handlePrompt('Create a contact form with name, email, and message.')}>Generate</button>
      {response && <DynamicUIRenderer response={response} onAction={handleAction} />}
    </div>
  );
}
```

### Option 2: Using agent factory with configuration

```tsx
import React, { useState } from 'react';
import { createAgent } from './src/agent/index';
import { DynamicUIRenderer } from './src/react/Renderer';
import type { ChatMessage, AgentResponse } from './src/agent/schema';

export function App() {
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);

  // Create agent with custom config
  const agent = createAgent({
    model: 'gpt-4o-mini',
    history,
  });

  async function handlePrompt(prompt: string) {
    try {
      const res = await agent.respond(prompt);
      setResponse(res);
      
      // Update history for multi-turn conversation
      setHistory([...history, ...res.messages]);
    } catch (error) {
      console.error('Failed to generate UI:', error);
    }
  }

  function handleAction(actionId: string, payload?: unknown) {
    console.log('Action:', actionId, payload);
  }

  return (
    <div>
      <button onClick={() => handlePrompt('Create a contact form with name, email, and message.')}>Generate</button>
      {response && <DynamicUIRenderer response={response} onAction={handleAction} />}
    </div>
  );
}
```

## API Reference

### `respond(userPrompt: string, config?: AgentConfig): Promise<AgentResponse>`

Direct function to get a structured UI response from a prompt.

**Parameters:**
- `userPrompt`: The user's request
- `config` (optional):
  - `systemPrompt?: string` - Custom system prompt
  - `model?: string` - Model name (default: 'gpt-4o-mini')
  - `history?: ChatMessage[]` - Conversation history

**Throws:**
- Error if `OPENAI_API_KEY` is not set
- Error if the API call fails

### `createAgent(config?: AgentConfig)`

Factory function that returns an agent object with bound configuration.

**Returns:**
- `respond(userPrompt: string)` - Generate UI from prompt
- `getConfig()` - Get current configuration

## Supported UI Elements

The agent can generate the following component types:

- **text** - Paragraph with variants (body, muted, caption)
- **heading** - H1-H4 headings
- **button** - Clickable buttons with variants (primary, secondary, danger)
- **input** - Form inputs (text, email, password, number, date)
- **form** - Form container with fields and submit button
- **list** - Unordered list
- **table** - Data table with columns and rows
- **code** - Code block with syntax
- **container** - Layout container with flexbox properties

## Project Structure

```
dynamic-ui-agent/
├── app/                    # Next.js app directory
│   ├── api/chat/          # Chat API endpoint
│   ├── page.tsx           # Main chat interface
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── src/
│   ├── agent/             # Core agent logic
│   │   ├── index.ts       # Main respond() and createAgent() functions
│   │   └── schema.ts      # Zod schemas and types
│   ├── react/             # React components
│   │   └── Renderer.tsx   # DynamicUIRenderer component
│   └── examples/          # Example usage
│       └── demo.ts        # CLI demo
└── lib/                   # Utility functions
    └── utils.ts           # Helper utilities
```

## Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build the TypeScript library
- `npm run build:next` - Build Next.js for production
- `npm run start` - Start Next.js production server
- `npm run example` - Run the CLI demo
- `npm run typecheck` - Type-check without emitting files

## Notes

- The schema is intentionally minimal and is a good starting point for your own design system abstractions.
- For multi-turn interactions, maintain conversation history in your app state and pass it via the `history` config option.
- Replace the model name by passing the `model` option to `respond()` or `createAgent()`.
- The project uses a function-based architecture following best practices (see `REFACTORING.md` for details).

## Learn More

- See `WARP.md` for detailed development guidance
- Check `REFACTORING.md` for architecture decisions
- Explore the `/app` directory for the chat interface implementation
