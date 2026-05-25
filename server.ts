import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createServer } from 'http';

async function startServer() {
  console.log('--- SERVER STARTING ---');
  const allGemini = Object.keys(process.env).filter(k => k.toUpperCase().includes('GEMINI'));
  console.log('Gemini-related env keys found:', allGemini);
  allGemini.forEach(k => {
    const val = process.env[k] || '';
    console.log(`- ${k}: Type=${typeof val}, Length=${val.length}, RawStart=${val.substring(0, 4)}`);
  });
  
  const app = express();
  const server = createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // ... [Existing Scrape and Proxy routes remain the same] ...
  
  // API Route to scrape the website
  app.post('/api/scrape', async (req, res) => {
    try {
      let { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      url = url.trim().replace(/^(https?:\/\/)+/i, '');
      url = 'https://' + url;
      let iframeBlocked = false;
      try {
        const headRes = await axios.head(url, { timeout: 5000 });
        if (headRes.headers['x-frame-options'] || headRes.headers['content-security-policy']?.includes('frame-ancestors')) {
          iframeBlocked = true;
        }
      } catch (e) {}
      const response = await axios.get(url, { timeout: 8000 });
      const $ = cheerio.load(response.data);
      $('script, style, noscript, nav, footer, iframe, img, svg').remove();
      const title = $('title').text().trim();
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
      const scrapedKnowledge = `Title: ${title}\n\nContent:\n${bodyText.substring(0, 5000)}`;
      res.json({ success: true, iframeBlocked, scrapedKnowledge });
    } catch (error: any) {
      res.status(200).json({ success: false, error: 'Failed' });
    }
  });

  app.get('/api/proxy', async (req, res) => {
    try {
      let { url } = req.query;
      if (!url || typeof url !== 'string') return res.status(400).send('URL is required');
      let cleanUrl = url.trim().replace(/^(https?:\/\/)+/i, '');
      cleanUrl = 'https://' + cleanUrl;
      const response = await axios.get(cleanUrl, { timeout: 10000 });
      let html = response.data;
      const $ = cheerio.load(html);
      if ($('head').length > 0) $('head').prepend(`<base href="${cleanUrl}">`);
      res.setHeader('Content-Type', 'text/html');
      res.send($.html());
    } catch (error: any) {
      res.status(200).send('Proxy error');
    }
  });

  app.get('/api/health', (req, res) => {
    const keys = Object.keys(process.env).filter(k => k.toUpperCase().includes('GEMINI'));
    res.json({ 
      status: 'ok', 
      foundKeys: keys,
      keyStates: keys.map(k => ({
        name: k,
        length: process.env[k]?.length || 0,
        isRaw: process.env[k]?.startsWith('AIza') || false
      }))
    });
  });

  app.get('/api/debug-auth', (req, res) => {
    const env = process.env;
    const explicitNames = ['USER_GEMINI_KEY', 'GEMINI_API_KEY_CUSTOM', 'REAL_KEY', 'GEMINI_API_KEY'];
    const results = explicitNames.map(name => ({
      name,
      exists: !!env[name],
      length: env[name]?.length || 0,
      prefix: env[name]?.substring(0, 7) || 'none',
      isAIza: env[name]?.startsWith('AIza') || false
    }));
    res.json({
      message: "Diagnostics for Gemini Auth",
      results
    });
  });

  // Vite/Static handling
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[LEAN] Server running on port ${PORT}`);
  });
}

startServer();
