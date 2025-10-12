#!/bin/bash

# Dynamic UI Agent - Project Restructuring Script
# This script reorganizes the project into a cleaner structure

set -e

echo "🚀 Starting project restructuring..."

# Create new directory structure
echo "📁 Creating new directory structure..."
mkdir -p lib/src
mkdir -p examples/nextjs-chat/src
mkdir -p docs/guides
mkdir -p .github/workflows

# Move library source code
echo "📦 Moving library source..."
mv src/agent lib/src/
mv src/react lib/src/
mv src/index.ts lib/src/
rm -rf src/examples  # Will recreate in examples/

# Move library configuration
echo "⚙️  Moving library configuration..."
cp package.json lib/package.json
cp tsconfig.build.json lib/tsconfig.json
cp LICENSE lib/LICENSE

# Update lib/package.json to remove demo dependencies
echo "📝 Updating library package.json..."
cat > lib/package.json << 'EOF'
{
  "name": "dynamic-ui-agent",
  "version": "0.1.0",
  "description": "A flexible AI agent library for generating structured UI components from natural language prompts",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./react": {
      "types": "./dist/react/index.d.ts",
      "import": "./dist/react/index.js"
    },
    "./schema": {
      "types": "./dist/agent/schema.d.ts",
      "import": "./dist/agent/schema.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "ai",
    "llm",
    "ui-generation",
    "dynamic-ui",
    "react",
    "openai",
    "zod",
    "typescript"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/dynamic-ui-agent.git",
    "directory": "lib"
  },
  "dependencies": {
    "ai": "^3.3.34",
    "zod": "^3.23.8"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "react-dom": {
      "optional": true
    }
  },
  "devDependencies": {
    "@types/node": "^24.7.2",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "typescript": "^5.6.3"
  }
}
EOF

# Move Next.js demo to examples
echo "🎨 Moving Next.js demo to examples..."
mv app examples/nextjs-chat/src/app
mv components examples/nextjs-chat/src/components
mv lib examples/nextjs-chat/src/lib
cp .env.example examples/nextjs-chat/
cp next.config.mjs examples/nextjs-chat/
cp tailwind.config.ts examples/nextjs-chat/
cp postcss.config.mjs examples/nextjs-chat/
cp components.json examples/nextjs-chat/
cp tsconfig.json examples/nextjs-chat/

# Create example package.json
cat > examples/nextjs-chat/package.json << 'EOF'
{
  "name": "dynamic-ui-agent-demo",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@ai-sdk/openai": "^0.0.44",
    "@ai-sdk/react": "^0.0.66",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "ai": "^3.3.34",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dynamic-ui-agent": "workspace:*",
    "lucide-react": "^0.460.0",
    "next": "^15.1.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^3.3.1",
    "tailwindcss": "^3.4.17",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^24.7.2",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "typescript": "^5.6.3"
  }
}
EOF

# Move documentation
echo "📚 Organizing documentation..."
mv README.library.md lib/README.md
mv SCHEMA-TO-UI.md docs/guides/
mv WARP.md docs/DEVELOPMENT.md

# Create root workspace package.json
cat > package.json << 'EOF'
{
  "name": "dynamic-ui-agent-workspace",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "lib",
    "examples/*"
  ],
  "scripts": {
    "build": "npm run build --workspace=lib",
    "dev": "npm run dev --workspace=examples/nextjs-chat",
    "typecheck": "npm run typecheck --workspaces",
    "clean": "rm -rf lib/dist examples/*/dist examples/*/.next"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
EOF

# Create main README
cat > README.md << 'EOF'
# Dynamic UI Agent 🤖

A flexible, schema-agnostic AI agent library for generating structured UI components from natural language prompts.

## Project Structure

```
dynamic-ui-agent/
├── lib/                  # 📦 The publishable npm package
├── examples/             # 🎨 Example applications
│   └── nextjs-chat/     # Next.js chat demo
└── docs/                 # 📚 Documentation
```

## Quick Start

### Using the Library

```bash
npm install dynamic-ui-agent ai zod
```

See [lib/README.md](./lib/README.md) for full documentation.

### Running the Demo

```bash
cd examples/nextjs-chat
npm install
npm run dev
```

## Documentation

- [Library Documentation](./lib/README.md) - How to use the library
- [Schema to UI Guide](./docs/guides/SCHEMA-TO-UI.md) - Understanding the architecture
- [Development Guide](./docs/DEVELOPMENT.md) - Contributing and development setup

## License

MIT - See [LICENSE](./LICENSE)
EOF

# Create example README
cat > examples/nextjs-chat/README.md << 'EOF'
# Next.js Chat Demo

A full-featured chat interface demonstrating the dynamic-ui-agent library with:

- Real-time UI component generation
- shadcn/ui components
- Conversation history
- Interactive suggestions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set your OpenAI API key:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Features

- 💬 Chat with AI to generate UI components
- 🎨 Beautiful UI with shadcn/ui and Tailwind CSS
- 🔄 Multi-turn conversations
- 💡 Suggested prompts and follow-ups
- 📱 Responsive design

## Try These Prompts

- "Create a login form with email and password"
- "Build a pricing table with 3 tiers"
- "Make a dashboard card with stats"
- "Design a user profile form"
EOF

# Clean up old structure
echo "🧹 Cleaning up..."
rm -rf src
rm -f tsconfig.build.json
rm -f components.json
rm -f next.config.mjs
rm -f tailwind.config.ts
rm -f postcss.config.mjs
rm -f next-env.d.ts

# Update gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Build output
dist/
lib/dist/
examples/*/dist/

# Next.js
.next/
examples/*/.next/
out/
next-env.d.ts

# Environment variables
.env
.env.local
.env.*.local

# TypeScript
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Testing
coverage/
.nyc_output/
*.lcov

# Misc
.turbo
.vercel
EOF

echo "✅ Restructuring complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes"
echo "2. Run: npm install (to set up workspace)"
echo "3. Run: npm run build (to build the library)"
echo "4. Run: npm run dev (to start the demo)"
echo ""
echo "To publish the library:"
echo "  cd lib && npm publish"
EOF

chmod +x RESTRUCTURE.sh
