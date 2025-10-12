# Project Restructuring Proposal

## 🎯 Goals

1. **Separate library from demo** - Clear distinction between publishable code and example
2. **Standard npm package structure** - Follow community best practices
3. **Workspace setup** - Enable easy local development and testing
4. **Better organization** - Clearer project navigation

## 📊 Current vs Proposed Structure

### Current Structure (Problems)

```
dynamic-ui-agent/
├── src/                    ✅ Library source
│   ├── agent/             
│   ├── react/             
│   ├── examples/          ❌ Examples mixed with library
│   └── index.ts           
├── app/                    ❌ Demo app at root
├── components/            ❌ Demo components at root
├── lib/                   ❌ Demo utilities at root
├── dist/                  ✅ Build output
├── README.md              ❌ Mixed documentation
├── README.library.md      ❌ Duplicate docs
└── package.json           ❌ Mixed dependencies
```

**Issues:**
- Library and demo code intermingled
- Confusing for contributors
- Hard to publish cleanly
- Mixed dependencies (library + demo)
- Multiple README files

### Proposed Structure (Benefits)

```
dynamic-ui-agent/
├── lib/                    📦 THE NPM PACKAGE
│   ├── src/
│   │   ├── agent/         # Core agent logic
│   │   ├── react/         # React components
│   │   └── index.ts       # Entry point
│   ├── dist/              # Build output
│   ├── package.json       # Library dependencies ONLY
│   ├── tsconfig.json      # Library TS config
│   ├── README.md          # Library docs
│   └── LICENSE
│
├── examples/               🎨 EXAMPLE APPS
│   └── nextjs-chat/
│       ├── src/
│       │   ├── app/       # Next.js app
│       │   ├── components/# shadcn components
│       │   └── lib/       # Demo utilities
│       ├── package.json   # Demo dependencies
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       └── README.md      # Demo docs
│
├── docs/                   📚 DOCUMENTATION
│   ├── guides/
│   │   └── SCHEMA-TO-UI.md
│   └── DEVELOPMENT.md
│
├── package.json            # Workspace config
├── README.md               # Project overview
└── LICENSE
```

**Benefits:**
- ✅ Crystal clear separation
- ✅ Clean library publishing
- ✅ Standard workspace pattern
- ✅ Organized documentation
- ✅ Easy to add more examples
- ✅ Dependencies properly scoped

## 🔄 Migration Path

### Option 1: Automatic (Run Script)

```bash
# Review the script first!
cat RESTRUCTURE.sh

# Make backup
git commit -am "Backup before restructure"

# Run restructure
./RESTRUCTURE.sh

# Review changes
git status
git diff

# Test
npm install
npm run build
npm run dev
```

### Option 2: Manual

1. **Create new structure:**
   ```bash
   mkdir -p lib/src examples/nextjs-chat/src docs/guides
   ```

2. **Move library code:**
   ```bash
   mv src/agent lib/src/
   mv src/react lib/src/
   mv src/index.ts lib/src/
   ```

3. **Move demo:**
   ```bash
   mv app examples/nextjs-chat/src/
   mv components examples/nextjs-chat/src/
   mv lib examples/nextjs-chat/src/
   ```

4. **Move docs:**
   ```bash
   mv README.library.md lib/README.md
   mv SCHEMA-TO-UI.md docs/guides/
   mv WARP.md docs/DEVELOPMENT.md
   ```

5. **Update package.json files** (see script for content)

6. **Update imports in demo:**
   ```typescript
   // Before
   import { respond } from '../src/agent/index';
   
   // After
   import { respond } from 'dynamic-ui-agent';
   ```

## 📦 Workspace Benefits

Using npm workspaces provides:

1. **Shared node_modules** - One installation for all packages
2. **Easy local testing** - Demo uses local library automatically
3. **Monorepo ready** - Can add more packages later
4. **Consistent commands** - `npm run build` works from root

### Workspace Commands

```bash
# Build library
npm run build --workspace=lib

# Or shorthand
npm run build

# Run demo
npm run dev --workspace=examples/nextjs-chat

# Or shorthand
npm run dev

# Typecheck everything
npm run typecheck --workspaces

# Clean all builds
npm run clean
```

## 🚀 Publishing Workflow

### Before Restructure

```bash
# Have to manually ensure demo code isn't included
npm run build
npm publish  # Publishes everything, risky!
```

### After Restructure

```bash
cd lib
npm run build
npm publish  # Only publishes lib/dist, clean!
```

The `files` field in `lib/package.json` ensures only these are published:
- `dist/` - Compiled code
- `README.md` - Library documentation
- `LICENSE` - License file

## 📝 Import Changes in Demo

The demo will import from the workspace package:

```typescript
// examples/nextjs-chat/src/app/page.tsx
import { respond } from 'dynamic-ui-agent';
import { DynamicUIRenderer } from 'dynamic-ui-agent/react';
```

npm workspaces automatically links `dynamic-ui-agent` to `../lib`.

## 🧪 Testing the Restructure

After running the restructure:

```bash
# 1. Install dependencies
npm install

# 2. Build library
npm run build

# 3. Run demo
npm run dev

# 4. Test library build
cd lib && npm run build

# 5. Test if publishable
cd lib && npm pack
# Creates dynamic-ui-agent-0.1.0.tgz
# Extract and verify contents
```

## 🎨 Adding More Examples

Easy to add more examples:

```bash
# Create new example
mkdir examples/react-vite
cd examples/react-vite
npm init -y

# Add dependency on workspace
npm install dynamic-ui-agent@workspace:*

# Use it
import { respond } from 'dynamic-ui-agent';
```

## 📋 Checklist

- [ ] Review RESTRUCTURE.sh script
- [ ] Create git commit/backup
- [ ] Run restructure script
- [ ] Test: `npm install`
- [ ] Test: `npm run build`
- [ ] Test: `npm run dev`
- [ ] Update any absolute imports in demo
- [ ] Update .gitignore if needed
- [ ] Test library: `cd lib && npm pack`
- [ ] Update repository README
- [ ] Commit changes

## 🔮 Future Enhancements

With this structure, you can easily:

1. **Add more examples:**
   - `examples/react-vite/`
   - `examples/remix-app/`
   - `examples/astro-site/`

2. **Split library into packages:**
   ```
   lib/
   ├── core/       # Core agent (no React)
   ├── react/      # React components
   └── schemas/    # Pre-built schemas
   ```

3. **Add testing:**
   ```
   lib/
   ├── src/
   ├── tests/
   └── package.json
   ```

4. **Add docs site:**
   ```
   examples/
   └── docs-site/  # Docusaurus/Nextra site
   ```

## ❓ FAQ

### Will existing imports break?

No! The library exports remain the same:
```typescript
import { respond } from 'dynamic-ui-agent';
```

### Can I still run the demo?

Yes! Even easier:
```bash
npm run dev  # from root, runs the demo
```

### How do I publish?

```bash
cd lib
npm publish
```

### Can I revert this?

Yes, if you committed before restructuring:
```bash
git reset --hard HEAD~1
```

## 📞 Questions?

See `docs/DEVELOPMENT.md` for more details or open an issue!
