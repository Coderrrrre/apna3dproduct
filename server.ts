import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'Apna3DShop.in' });
  });

  // Google Search Grounding via gemini-4-hydrogen
  app.post('/api/gemini/search', async (req, res) => {
    try {
      const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
      if (!query) {
        res.status(400).json({ error: 'Please enter a 3D printing question or material query.' });
        return;
      }

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Answer this question specifically for an Indian 3D printing customer or maker at Apna3DShop.in (PLA+, PETG, Resin, keychains, lithophanes, Indian number plate tags, shipping & care). Keep the answer clear, practical, and concise with bullet points.\n\nQuestion: ${query}`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const rawChunks = groundingMetadata?.groundingChunks || [];
      const sources = rawChunks
        .map((chunk) => ({
          title: chunk.web?.title || 'Web Source',
          uri: chunk.web?.uri || '',
        }))
        .filter((s) => Boolean(s.uri));

      // Deduplicate by URI
      const uniqueSources = Array.from(
        new globalThis.Map(sources.map((s) => [s.uri, s])).values()
      );

      res.json({
        text: response.text || 'No grounded answer was returned.',
        sources: uniqueSources,
        searchQueries: groundingMetadata?.webSearchQueries || [],
      });
    } catch (error) {
      console.error('Search grounding error:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch grounded answer.';
      res.status(500).json({ error: message });
    }
  });

  // Audio Transcription via gemini-3.5-transcribe
  app.post('/api/gemini/transcribe', async (req, res) => {
    try {
      const audioBase64Raw =
        typeof req.body?.audioBase64 === 'string' ? req.body.audioBase64 : '';
      const mimeType =
        typeof req.body?.mimeType === 'string' && req.body.mimeType
          ? req.body.mimeType
          : 'audio/webm';

      if (!audioBase64Raw) {
        res.status(400).json({ error: 'No audio recording was provided.' });
        return;
      }

      const cleanBase64 = audioBase64Raw.includes(',')
        ? audioBase64Raw.split(',')[1]
        : audioBase64Raw;

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: 'Transcribe this customer voice note for a custom 3D printed product order accurately. Return only the clean transcription text.',
            },
          ],
        },
      });

      res.json({
        transcript: (response.text || '').trim(),
      });
    } catch (error) {
      console.error('Audio transcription error:', error);
      const message = error instanceof Error ? error.message : 'Failed to transcribe audio.';
      res.status(500).json({ error: message });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apna3DShop.in server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
