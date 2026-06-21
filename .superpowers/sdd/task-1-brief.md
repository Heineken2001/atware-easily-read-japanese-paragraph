### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/index.css`
- Create: `src/App.jsx` (placeholder)
- Create: `src/test-setup.js`
- Create: `vercel.json`
- Create: `.gitignore`
- Create: `.env.local.example`

**Interfaces:**
- Produces: `npm run dev` starts Vite at `http://localhost:5173`; `npm test` runs Vitest; `vercel dev` serves frontend + `/api/` functions

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/trannhathuy/Documents/japanese-easy-read
git init
```

Expected: `Initialized empty Git repository in .../japanese-easy-read/.git/`

- [ ] **Step 2: Create package.json**

```json
{
  "name": "japanese-easy-read",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom tailwindcss postcss autoprefixer
npm install openai @aws-sdk/client-secrets-manager
npm install -D vercel
```

- [ ] **Step 4: Create vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
  },
})
```

- [ ] **Step 5: Create src/test-setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Initialize Tailwind**

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 7: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Create index.html**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Japanese Easy Read</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Create src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 10: Create src/App.jsx (placeholder)**

```jsx
export default function App() {
  return <div className="p-4">Japanese Easy Read</div>
}
```

- [ ] **Step 11: Create vercel.json**

```json
{
  "framework": "vite"
}
```

- [ ] **Step 12: Create .gitignore**

```
node_modules/
dist/
.env.local
.env*.local
.vercel/
```

- [ ] **Step 13: Create .env.local.example**

```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-southeast-1
SECRET_NAME=your-secret-name-in-aws-secrets-manager
```

- [ ] **Step 14: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server running at `http://localhost:5173`

- [ ] **Step 15: Commit**

```bash
git add package.json vite.config.js tailwind.config.js postcss.config.js index.html src/ vercel.json .gitignore .env.local.example
git commit -m "feat: project scaffold — Vite + React + Tailwind + Vitest"
```
