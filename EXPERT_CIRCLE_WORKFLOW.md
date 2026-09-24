# Expert Circle Builder - Auto-Generation Workflow

This guide explains how to automatically generate the standalone HTML file from your Expert Circle Builder source files.

## 📍 What Gets Generated?

When you make changes to any of these files:
- `sdk-app/src/design/prototypes/expert-circle-builder/ExpertCircleBuilder.tsx`
- `sdk-app/src/design/prototypes/expert-circle-builder/expertCircleMockData.ts`
- `sdk-app/src/design/prototypes/expert-circle-builder/ExpertCircleBuilder.module.scss`

A standalone HTML file is automatically generated at:
```
./expert-circle-builder.html
```

This HTML file can be shared via GitHub Gist using htmlpreview.github.io.

---

## 🚀 Setup Options

### Option 1: One-Time Setup (Recommended)

Set up a git pre-commit hook so the HTML auto-generates whenever you commit changes:

```bash
npm run setup:expert-circle-hook
```

This will:
1. Create a git hook that detects changes to source files
2. Auto-run the generator before each commit
3. Automatically stage the updated HTML file

**After this, you don't need to do anything else** - just commit your changes normally and the HTML will be regenerated automatically.

### Option 2: Manual Generation

Generate the HTML manually whenever you want:

```bash
npm run generate:expert-circle-html
```

Use this if you prefer to generate on-demand rather than auto on commit.

### Option 3: Watch Mode (During Development)

For continuous regeneration while actively developing:

```bash
npm run watch:expert-circle
```

This opens a file watcher that regenerates the HTML whenever any source file changes (not just on commit). Useful when you want instant feedback during development.

**Run in a separate terminal** alongside your dev server:
```bash
# Terminal 1: Start dev server
npm run sdk-app:demo

# Terminal 2: Start watcher
npm run watch:expert-circle
```

---

## 📋 Workflow Examples

### Typical Development Flow

```bash
# 1. Set up once
npm run setup:expert-circle-hook

# 2. Make changes to ExpertCircleBuilder.tsx, expertCircleMockData.ts, or CSS
# 3. Commit changes - HTML automatically regenerates
git add .
git commit -m "Update expert circle builder"

# 4. The expert-circle-builder.html is auto-generated and staged
# 5. Push your changes
git push
```

### Quick Testing During Development

```bash
# Terminal 1: Run dev server
npm run sdk-app:demo

# Terminal 2: Start watcher for instant HTML regeneration
npm run watch:expert-circle

# Now make changes and the HTML updates instantly
```

### Manual One-Off Generation

```bash
# Just generate the HTML without committing
npm run generate:expert-circle-html

# Then manually share the HTML file
```

---

## 📤 Sharing the Generated HTML

Once generated, share the `expert-circle-builder.html` file:

### Option 1: GitHub Gist (Recommended)
1. Copy the full `expert-circle-builder.html` file
2. Go to https://gist.github.com
3. Paste the content and name it `expert-circle-builder.html`
4. Create the gist
5. Share the htmlpreview link:
   ```
   https://htmlpreview.github.io/?https://gist.githubusercontent.com/[USERNAME]/[GIST_ID]/raw/expert-circle-builder.html
   ```

### Option 2: Direct File
- Commit and push `expert-circle-builder.html` to your repo
- Others can download or open it directly

---

## 🔍 How It Works

### Generation Script (`scripts/generate-expert-circle-html.js`)

The generator:
1. Reads all three source files (TSX, TS, SCSS)
2. Converts SCSS to inline CSS
3. Extracts and simplifies JSX/TypeScript to plain JavaScript
4. Bundles React from CDN
5. Creates a single self-contained HTML file

### Git Hook (`scripts/setup-expert-circle-hook.js`)

The hook:
1. Detects changes to Expert Circle Builder source files in your commits
2. Automatically runs the generator
3. Stages the updated HTML file
4. Allows the commit to proceed

### Watcher Script (`scripts/watch-expert-circle.js`)

The watcher:
1. Monitors source files for changes
2. Debounces changes (500ms)
3. Regenerates HTML instantly
4. Useful during active development

---

## 🐛 Troubleshooting

### Hook not running?

Verify the hook is installed:
```bash
cat .git/hooks/pre-commit
```

Reinstall if needed:
```bash
npm run setup:expert-circle-hook
```

### Generated HTML not updating?

Make sure your source files exist:
```bash
ls sdk-app/src/design/prototypes/expert-circle-builder/
```

Try manual generation:
```bash
npm run generate:expert-circle-html
```

### Watch mode not detecting changes?

Some editors need a save delay. Try saving with a slight delay between edits, or manually run:
```bash
npm run generate:expert-circle-html
```

---

## 📝 File Organization

```
embedded-react-sdk/
├── scripts/
│   ├── generate-expert-circle-html.js    # Generator script
│   ├── setup-expert-circle-hook.js       # Hook setup
│   └── watch-expert-circle.js            # File watcher
├── sdk-app/
│   └── src/design/prototypes/
│       └── expert-circle-builder/        # Source files
│           ├── ExpertCircleBuilder.tsx
│           ├── expertCircleMockData.ts
│           ├── ExpertCircleBuilder.module.scss
│           └── types.ts
├── expert-circle-builder.html            # Generated file (auto-created)
└── package.json                          # npm scripts
```

---

## ✅ Checklist

- [ ] Run `npm run setup:expert-circle-hook` once to enable auto-generation
- [ ] Make changes to source files
- [ ] Commit normally - HTML auto-generates
- [ ] Push your changes
- [ ] Share the `expert-circle-builder.html` via GitHub Gist

---

## 💡 Tips

1. **First time?** Start with Option 1 (Setup Hook) - it's hands-off after initial setup
2. **Active development?** Use Option 3 (Watch Mode) in a separate terminal
3. **Want to verify?** Open `expert-circle-builder.html` in your browser after generation
4. **Sharing updates?** Just commit your source changes - the HTML auto-updates and is ready to share

---

For questions or issues, check the scripts directory or regenerate with:
```bash
npm run generate:expert-circle-html
```
