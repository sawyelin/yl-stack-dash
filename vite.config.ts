import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import fs from 'fs/promises';

const conditionalPlugins: [string, Record<string, any>][] = [];

// @ts-ignore
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins: [
    react({
      plugins: conditionalPlugins,
    }),
    tempo(),
    {
      name: 'database-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/save-db' && req.method === 'POST') {
            try {
              // Get the raw body
              const chunks = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              const buffer = Buffer.concat(chunks);
              
              // Save to file
              const dbPath = path.join(process.cwd(), 'public', 'db', 'dashboard.sqlite');
              await fs.writeFile(dbPath, buffer);
              
              res.statusCode = 200;
              res.end('OK');
            } catch (error) {
              console.error('Error saving database:', error);
              res.statusCode = 500;
              res.end('Internal server error');
            }
          } else {
            next();
          }
        });
      }
    }
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  }
});
