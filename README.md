# ⚡ Code Playground

An AI-powered interactive code playground. Execute JavaScript code through natural conversation.

**[Try the Live Demo →](https://tjklint.github.io/code-playground)**

## Features

- ⚡ **JavaScript** — Full Node.js runtime with ES6+ support
- 🔷 **TypeScript** — Type-safe code execution
- 🧠 **AI-Powered** — Natural language code execution

## Getting Started

### Agent Development

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development server:

   ```bash
   adk dev
   ```

3. Deploy your agent:
   ```bash
   adk deploy
   ```

### Frontend (GitHub Pages)

The frontend lives in the `docs/` folder and is ready for GitHub Pages.

1. Push your code to GitHub

2. Go to your repository **Settings** → **Pages**

3. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/docs`

4. Click **Save** — your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/code-playground
   ```

### Local Preview

To preview the frontend locally, serve the `docs/` folder:

```bash
# Using Python
python -m http.server 8000 -d docs

# Or using npx
npx serve docs
```

Then open http://localhost:8000

## Project Structure

```
├── docs/              # GitHub Pages frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── actions/       # Callable functions (run_js)
│   ├── workflows/     # Long-running processes
│   ├── conversations/ # Conversation handlers
│   ├── tables/        # Data storage schemas
│   ├── triggers/      # Event subscriptions
│   └── knowledge/     # Knowledge base files
└── webchat.html       # Simple embedded webchat (legacy)
```

## Learn More

- [ADK Documentation](https://botpress.com/docs/adk)
- [Botpress Platform](https://botpress.com)
