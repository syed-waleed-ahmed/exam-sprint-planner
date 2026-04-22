import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ai-dev-proxy',
      configureServer(server) {
        server.middlewares.use('/api/anthropic', async (req, res, next) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const body = rawBody ? JSON.parse(rawBody) : {};

            const apiKey = body.apiKey;
            if (!apiKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing API key' }));
              return;
            }

            const provider = body.provider || (apiKey.startsWith('sk-ant-') ? 'anthropic' : 'openai');
            let upstream;

            if (provider === 'anthropic') {
              upstream = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                  model: body.model || 'claude-sonnet-4-20250514',
                  max_tokens: body.max_tokens || 1000,
                  stream: !!body.stream,
                  messages: body.messages,
                }),
              });
            } else {
              upstream = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  model: body.model || 'gpt-4o-mini',
                  max_tokens: body.max_tokens || 1000,
                  stream: !!body.stream,
                  messages: body.messages,
                }),
              });
            }

            const contentType = upstream.headers.get('content-type') || 'application/json';
            res.statusCode = upstream.status;
            res.setHeader('Content-Type', contentType);

            if (!upstream.body) {
              res.end();
              return;
            }

            const text = await upstream.text();
            res.end(text);
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Proxy request failed' }));
          }
        });

      },
    },
  ],
});
