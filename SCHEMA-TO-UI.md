# Schema to UI Component Mapping

This document explains how the schema structure correlates to UI components and how consumers can customize rendering.

## The Relationship

```
Zod Schema (Data Structure) → AI generates structured data → Renderer interprets → UI Components
```

### Example Flow

1. **Schema defines structure:**
```typescript
const UIInput = z.object({
  type: z.literal('input'),
  props: z.object({
    name: z.string(),
    label: z.string().optional(),
    inputType: z.enum(['text', 'email', 'password']),
  }),
});
```

2. **AI generates data matching schema:**
```json
{
  "type": "input",
  "props": {
    "name": "email",
    "label": "Email Address",
    "inputType": "email"
  }
}
```

3. **Renderer component interprets data:**
```tsx
// In DynamicUIRenderer.tsx
case 'input': {
  const { name, label, inputType } = node.props;
  return (
    <Input 
      name={name}
      type={inputType}
      label={label}
    />
  );
}
```

4. **Actual UI component renders:**
```tsx
// Consumer's Input component (shadcn, MUI, custom, etc.)
<input 
  className="custom-styles"
  name="email"
  type="email"
/>
```

## Built-in Schema Structure

Our built-in UI schema uses a discriminated union pattern:

```typescript
export const UIElementSchema = z.discriminatedUnion('type', [
  // Text
  z.object({
    type: z.literal('text'),
    props: z.object({
      text: z.string(),
      variant: z.enum(['body', 'muted', 'caption']),
    }),
  }),
  
  // Button
  z.object({
    type: z.literal('button'),
    props: z.object({
      label: z.string(),
      variant: z.enum(['primary', 'secondary', 'danger']),
      actionId: z.string().optional(),
    }),
  }),
  
  // Form
  z.object({
    type: z.literal('form'),
    props: z.object({
      fields: z.array(UIInput),
      submitLabel: z.string(),
      actionId: z.string().optional(),
    }),
  }),
  // ... more types
]);
```

## How Consumers Customize Rendering

There are **3 main approaches** for consumers:

### Approach 1: Use Built-in Renderer with Their Own Components

Consumers can fork or wrap the `DynamicUIRenderer` to use their component library:

```tsx
// consumer-app/components/MyRenderer.tsx
import { type AgentResponse } from 'dynamic-ui-agent';
import { Button } from '@/components/ui/button'; // Their button
import { Input } from '@/components/ui/input';   // Their input
// etc.

export function MyRenderer({ response }: { response: AgentResponse }) {
  return (
    <div>
      {response.ui.map(element => {
        switch (element.type) {
          case 'button':
            // Use THEIR button component
            return (
              <Button 
                variant={mapVariant(element.props.variant)}
                onClick={() => handleAction(element.props.actionId)}
              >
                {element.props.label}
              </Button>
            );
          
          case 'input':
            // Use THEIR input component
            return (
              <Input
                {...element.props}
                className="their-custom-styles"
              />
            );
          
          case 'form':
            return (
              <form>
                {element.props.fields.map(field => (
                  <MyRenderer response={{ ui: [field] }} />
                ))}
              </form>
            );
          
          // etc...
        }
      })}
    </div>
  );
}
```

### Approach 2: Create Custom Schema + Custom Renderer

Consumers can create their own schema that matches their component library:

```typescript
// consumer-app/schema.ts
import { z } from 'zod';

// Schema matching Material-UI components
export const MUISchema = z.object({
  components: z.array(z.discriminatedUnion('component', [
    // TextField
    z.object({
      component: z.literal('TextField'),
      props: z.object({
        label: z.string(),
        variant: z.enum(['outlined', 'filled', 'standard']),
        type: z.string(),
        fullWidth: z.boolean().optional(),
      }),
    }),
    
    // Button
    z.object({
      component: z.literal('Button'),
      props: z.object({
        variant: z.enum(['contained', 'outlined', 'text']),
        color: z.enum(['primary', 'secondary', 'error']),
        children: z.string(),
      }),
    }),
    
    // Card
    z.object({
      component: z.literal('Card'),
      props: z.object({
        elevation: z.number(),
        children: z.array(z.any()),
      }),
    }),
  ])),
});

// consumer-app/renderer.tsx
import { TextField, Button, Card } from '@mui/material';

export function MUIRenderer({ data }: { data: z.infer<typeof MUISchema> }) {
  return (
    <>
      {data.components.map((comp, i) => {
        switch (comp.component) {
          case 'TextField':
            return <TextField key={i} {...comp.props} />;
          
          case 'Button':
            return <Button key={i} {...comp.props} />;
          
          case 'Card':
            return <Card key={i} {...comp.props} />;
        }
      })}
    </>
  );
}

// Usage
const response = await respond('Create a login form', {
  schema: MUISchema,
  systemPrompt: 'Generate Material-UI components. Use TextField for inputs, Button for actions.',
});
```

### Approach 3: Metadata Schema (Most Flexible)

Create a schema with semantic meaning, then map to any UI library:

```typescript
// Semantic schema (UI-library agnostic)
const FormSchema = z.object({
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'email', 'password', 'select']),
    label: z.string(),
    required: z.boolean(),
    options: z.array(z.string()).optional(), // for select
  })),
  submitButton: z.object({
    label: z.string(),
    style: z.enum(['primary', 'secondary']),
  }),
});

// Renderer can use ANY component library
function FlexibleRenderer({ data }: { data: z.infer<typeof FormSchema> }) {
  return (
    <form>
      {data.fields.map(field => {
        // Map to shadcn
        if (USE_SHADCN) {
          return <Input key={field.id} type={field.type} label={field.label} />;
        }
        
        // Or map to MUI
        if (USE_MUI) {
          return <TextField key={field.id} type={field.type} label={field.label} />;
        }
        
        // Or map to Chakra UI
        if (USE_CHAKRA) {
          return <ChakraInput key={field.id} type={field.type} placeholder={field.label} />;
        }
        
        // Or plain HTML
        return (
          <input
            key={field.id}
            type={field.type}
            placeholder={field.label}
            required={field.required}
          />
        );
      })}
      
      <button type="submit">{data.submitButton.label}</button>
    </form>
  );
}
```

## Complete Example: Custom Schema + Renderer

Here's how a consumer would use the library with their own component system:

```typescript
// 1. Define schema matching their design system
import { z } from 'zod';
import { respond } from 'dynamic-ui-agent';

const DesignSystemSchema = z.object({
  layout: z.enum(['stack', 'grid', 'flex']),
  spacing: z.enum(['compact', 'normal', 'spacious']),
  elements: z.array(z.discriminatedUnion('type', [
    z.object({
      type: z.literal('heading'),
      level: z.number(),
      text: z.string(),
      color: z.enum(['primary', 'secondary', 'accent']),
    }),
    z.object({
      type: z.literal('input-field'),
      variant: z.enum(['outlined', 'filled']),
      label: z.string(),
      validation: z.string().optional(),
    }),
    // ... more types matching their components
  ])),
});

// 2. Generate data with LLM
const data = await respond('Create a user registration form', {
  schema: DesignSystemSchema,
  systemPrompt: `You are a UI generator using our design system.
    Available components: heading, input-field, submit-button.
    Layouts: stack (vertical), grid, flex.
    Always use 'outlined' variant for inputs.`,
  llm: {
    model: 'gpt-4o-mini',
  }
});

// 3. Render with their components
function DesignSystemRenderer({ data }) {
  const Layout = data.layout === 'stack' ? Stack : 
                 data.layout === 'grid' ? Grid : Flex;
  
  return (
    <Layout spacing={data.spacing}>
      {data.elements.map((element, i) => {
        switch (element.type) {
          case 'heading':
            return (
              <Heading 
                key={i}
                level={element.level}
                color={element.color}
              >
                {element.text}
              </Heading>
            );
          
          case 'input-field':
            return (
              <InputField
                key={i}
                variant={element.variant}
                label={element.label}
                validation={element.validation}
              />
            );
        }
      })}
    </Layout>
  );
}

// 4. Use it
<DesignSystemRenderer data={data} />
```

## System Prompt Engineering

The system prompt guides the LLM to generate data matching your schema:

```typescript
const systemPrompt = `You are a UI component generator.

Available components:
- input: Use for text fields. Props: name, label, type (text|email|password)
- button: Use for actions. Props: label, variant (primary|secondary)
- card: Use for containers. Props: title, children[]

Rules:
- Forms must have all inputs wrapped in a form component
- Always include labels for inputs
- Use primary buttons for main actions
- Nest components using the children array

Example output:
{
  "components": [
    {
      "type": "form",
      "children": [
        { "type": "input", "props": { "name": "email", "label": "Email" } },
        { "type": "button", "props": { "label": "Submit", "variant": "primary" } }
      ]
    }
  ]
}`;

const response = await respond('Create a contact form', {
  systemPrompt,
  schema: YourSchema,
});
```

## Key Takeaways

1. **Schema = Contract**: The Zod schema defines the data structure the AI must follow
2. **Renderer = Interpreter**: Your renderer component interprets the data and renders UI
3. **Flexibility**: Consumers can:
   - Use built-in schema + customize renderer
   - Create custom schema + custom renderer
   - Mix and match approaches
4. **System Prompt**: Guide the LLM to generate appropriate data for your schema
5. **Type Safety**: TypeScript ensures schema, data, and renderer stay in sync

## For Library Authors

If you want to make your library work with dynamic-ui-agent:

1. Export your component schemas:
```typescript
// your-ui-lib/schemas.ts
export const ButtonSchema = z.object({
  type: z.literal('button'),
  props: z.object({
    variant: z.enum(['primary', 'secondary']),
    size: z.enum(['sm', 'md', 'lg']),
    label: z.string(),
  }),
});

export const YourLibSchema = z.discriminatedUnion('type', [
  ButtonSchema,
  InputSchema,
  // ... all your components
]);
```

2. Export a renderer:
```typescript
// your-ui-lib/ai-renderer.tsx
export function YourLibRenderer({ data }) {
  return data.map(item => {
    switch (item.type) {
      case 'button': return <YourButton {...item.props} />;
      // ...
    }
  });
}
```

3. Users can then:
```typescript
import { respond } from 'dynamic-ui-agent';
import { YourLibSchema, YourLibRenderer } from 'your-ui-lib';

const data = await respond('Create a form', { schema: YourLibSchema });
return <YourLibRenderer data={data} />;
```

This makes your library "AI-native"! 🚀
