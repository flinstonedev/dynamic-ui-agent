# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Dynamic UI Agent is a lightweight wrapper around the AI SDK that generates structured UI responses from natural language prompts. The agent uses Zod schemas to return strongly-typed, predictable UI structures that can be rendered in React applications. This enables "vibe coding" interfaces by describing UI structures and iterating through back-and-forth interactions.

## Development Commands

### Build and Type Checking
```bash
npm run build          # Compile TypeScript to dist/
npm run typecheck      # Type-check without emitting files
```

### Running Examples
```bash
npm run example        # Run the demo in src/examples/demo.ts
```

## Environment Setup

Required environment variable:
```bash
export OPENAI_API_KEY={{your_openai_api_key}}
```

The agent will throw an error if this is not set.

## Architecture

### Core Components

**Agent Module (`src/agent/`)**
- `index.ts` - Main entry point with functional API
  - `respond(userPrompt, config?)` - Direct function call to generate UI
  - `createAgent(config?)` - Factory function that returns agent with bound config
  - Helper functions: `assignIdsToTree()`, `ensureIds()` - Pure functions for ID assignment
- `schema.ts` - Zod schemas and TypeScript types
  - `AgentResponseSchema` - Top-level response structure
  - `UIElementSchema` - Discriminated union of UI components (text, heading, button, input, form, list, table, code, container)
  - `BUILT_IN_SYSTEM_PROMPT` - Default system prompt for the agent

**React Renderer (`src/react/`)**
- `Renderer.tsx` - `DynamicUIRenderer` component
  - Recursively renders UI elements from agent response
  - Supports action callbacks via `onAction` prop
  - Inline styles for zero-dependency rendering

**Examples (`src/examples/`)**
- `demo.ts` - Demonstrates both usage patterns (direct function and factory)

### Data Flow

1. User provides natural language prompt
2. Agent calls OpenAI's `generateObject` with Zod schema
3. Response is validated and IDs are auto-assigned to all elements
4. Structured JSON with `ui` array is returned
5. React app renders using `DynamicUIRenderer`
6. User actions trigger callbacks with actionId and payload

### Functional Architecture

This codebase follows a **function-based approach** (no ES6 classes). Key principles:

- All APIs are pure functions or factory functions
- State is managed externally and passed explicitly
- Configuration is passed as arguments, not stored in instances
- Helper functions are pure and composable

See `REFACTORING.md` for migration details from the previous class-based implementation.

## Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
- `@agent/*` → `src/agent/*`
- `@react/*` → `src/react/*`

Use these imports in your code:
```typescript
import { respond } from '@agent/index';
import { DynamicUIRenderer } from '@react/Renderer';
```

## UI Element Types

The schema supports these UI component types:
- `text` - Paragraph with variants (body, muted, caption)
- `heading` - H1-H4 headings
- `button` - Clickable buttons with variants (primary, secondary, danger)
- `input` - Form inputs (text, email, password, number, date)
- `form` - Form container with fields and submit button
- `list` - Unordered list
- `table` - Data table with columns and rows
- `code` - Code block with syntax
- `container` - Layout container with flexbox properties (direction, gap, align, justify)

## Conversation History

For multi-turn conversations:
- Maintain chat history in app state as `ChatMessage[]`
- Pass history via `config.history` option
- Agent includes new messages in response via `res.messages`

Example:
```typescript
const [history, setHistory] = useState<ChatMessage[]>([]);
const agent = createAgent({ history });
const res = await agent.respond(userPrompt);
setHistory([...history, ...res.messages]);
```

## Extending the Schema

To add new UI components:
1. Add new discriminated union case to `UIElementSchema` in `schema.ts`
2. Add rendering logic in `Node` component switch statement in `Renderer.tsx`
3. Rebuild with `npm run build`

The AI will automatically learn about new components through the Zod schema.

## Module System

- Uses ES modules (`"type": "module"` in package.json)
- Target: ES2022
- Module resolution: NodeNext
- Always use `.js` extensions in imports (TypeScript convention for ES modules)
