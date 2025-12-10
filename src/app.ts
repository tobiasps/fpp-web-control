import express, { Request, Response, NextFunction } from "express"
import { errorHandler } from './middlewares/errorHandler'
import logger from './lib/logger'
import config from './lib/config'

const app = express()
app.use(express.json())

// Set CORS headers on all responses
// CORS is only required when connecting directly to the server - not via reverse proxy
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', `http://localhost:${config.port}`)
    res.setHeader('Access-Control-Allow-Origin', `http://localhost:8080`)
    // res.setHeader('Access-Control-Allow-Origin', `http://10.211.55.2:${PORT}`)
    res.setHeader('Access-Control-Allow-Credentials', 'true') // For cookies
    res.setHeader('Access-Control-Allow-Headers', 'Authorization') // For custom headers

    logger.info(`Request: ${req.method} ${req.url}`)
    next();
})

app.get(`/version`, (req, res) => {
    res.send('FPPWebControl v1.0.0')
})

// Public root page
app.get('/test', (req: Request, res: Response) => {
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FPPControl</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; margin: 2rem; }
      h1 { margin: 0 0 0.5rem; }
      p { color: #555; }
      .row { margin-top: 1rem; }
      input, button { font-size: 1rem; padding: 0.5rem 0.75rem; }
      input { width: 16rem; }
      #status { margin-top: 0.75rem; color: #444; }
    </style>
  </head>
  <body>
    <h1>FPPControl</h1>
    <p>Welcome to FPPControl.</p>

    <div class="row">
      <label for="seqName">Sequence name:</label>
      <input id="seqName" placeholder="e.g. fire" />
      <button id="startBtn">Start Sequence</button>
    </div>
    <div id="status"></div>

    <script>
      (function() {
        var btn = document.getElementById('startBtn');
        var statusEl = document.getElementById('status');
        var input = document.getElementById('seqName');

        function setStatus(text, isError) {
          statusEl.textContent = text;
          statusEl.style.color = isError ? '#b00020' : '#2e7d32';
        }

        btn.addEventListener('click', function() {
          var name = (input.value || '').trim();
          if (!name) {
            setStatus('Please enter a sequence name.', true);
            return;
          }
          var url = '/api/sequence/' + encodeURIComponent(name) + '/start';
          setStatus('Starting sequence "' + name + '" ...');
          fetch(url, { method: 'POST' }).then(function(resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.text();
          }).then(function() {
            setStatus('Sequence "' + name + '" start request sent successfully.');
          }).catch(function(err) {
            setStatus('Failed to start sequence: ' + err.message, true);
            console.error(err);
          });
        });
      })();
    </script>
  </body>
</html>`)
})

// Touch-friendly control page with 3x3 grid of buttons
app.get('/', (req: Request, res: Response) => {
    const labels = config.sequences && Array.isArray(config.sequences) ? config.sequences : []
    // Ensure exactly 9 placeholders
    const sequences = Array.from({ length: 8 }, (_, i) => labels[i] || `seq${i + 1}`)

    // Build button HTML
    const buttons = sequences.map((label, idx) => {
        const safe = String(label)
        return `<button class="tile" data-name="${safe}"><span>${safe}</span></button>`
    }).join('')

    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
    <title>FPPControl — Control</title>
    <style>
      :root { color-scheme: light dark; }
      html, body { height: 100%; }
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; background: #111; color: #eee; }
      .wrap { min-height: 100vh; max-height: 100vh; display: grid; grid-template-rows: 1fr auto; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(3, 1fr); gap: 0.75rem; padding: 0.75rem; }
      .tile { display: flex; align-items: center; justify-content: center; width: 100%; border: none; border-radius: 12px; background: var(--bg, #2a2a2a); color: var(--fg, #fff); cursor: pointer; user-select: none; -webkit-tap-highlight-color: rgba(0,0,0,0); touch-action: manipulation; box-shadow: 0 2px 6px rgba(0,0,0,0.4); transition: background-color 80ms ease-out, transform 80ms ease-out; }
      .tile:active { transform: scale(0.98); background: var(--bg-active, #333); }
      .tile span { font-size: clamp(1rem, 4.2vw, 2rem); font-weight: 600; letter-spacing: 0.5px; text-align: center; padding: 0 0.5rem; }
      .status { padding: 0.5rem 1rem 1rem; text-align: center; min-height: 2rem; color: #7bd88f; }
      .error { color: #ff7b7b; }
      @media (orientation: landscape) {
        .grid { gap: 0.6rem; }
        .tile span { font-size: clamp(0.9rem, 3.2vh, 1.6rem); }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <main class="grid">
        ${buttons}
        <button class="tile" data-slot="1"><span>Fade Out</span></button>
        <button class="tile" data-slot="2"><span>Fade In</span></button>
        <button class="tile" data-slot="3"><span>On</span></button>
        <button class="tile" data-slot="4"><span>Off</span></button>
      </main>
      <div id="status" class="status" aria-live="polite"></div>
    </div>

    <script>
      (function() {
        var statusEl = document.getElementById('status');
        function setStatus(text, isError) {
          statusEl.textContent = text || '';
          if (isError) statusEl.classList.add('error'); else statusEl.classList.remove('error');
        }

        function hashToHue(str) {
          var h = 0;
          for (var i = 0; i < str.length; i++) {
            h = (h * 31 + str.charCodeAt(i)) >>> 0;
          }
          return h % 360;
        }

        function hsl(h, s, l) { return 'hsl(' + h + ' ' + s + '% ' + l + '%)'; }

        function setTileColors(btn) {
          var name = btn.getAttribute('data-name') || '';
          var hue = hashToHue(name);
          var sat = 68; // vibrant but not neon
          var light = 46; // middle lightness for good contrast on dark bg
          var bg = hsl(hue, sat, light);
          var bgActive = hsl(hue, sat, Math.max(20, light - 10));
          // Choose foreground color based on background lightness
          var fg = light > 55 ? '#111' : '#fff';
          btn.style.setProperty('--bg', bg);
          btn.style.setProperty('--bg-active', bgActive);
          btn.style.setProperty('--fg', fg);
          // Improve focus visibility on keyboards (not common on iPad, but safe)
          btn.style.outlineColor = fg === '#fff' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
        }

        function handleClick(e) {
          var btn = e.currentTarget;
          var name = btn.getAttribute('data-name');
          if (!name) return;
          var url = '/api/sequence/' + encodeURIComponent(name) + '/start';
          setStatus('Starting "' + name + '" ...');
          btn.disabled = true;
          fetch(url, { method: 'POST' })
            .then(function(resp){ if (!resp.ok) throw new Error('HTTP ' + resp.status); return resp.text(); })
            .then(function(){ setStatus('Started: ' + name); })
            .catch(function(err){ setStatus('Failed: ' + err.message, true); })
            .finally(function(){ btn.disabled = false; });
        }
        function handleCommandClick(e) {
            console.log(e);
          var btn = e.currentTarget;
          var name = btn.getAttribute('data-slot');
          if (!name) return;
          var url = '/api/command-preset/' + encodeURIComponent(name);
          setStatus('Sending command preset slot "' + name + '" ...');
          btn.disabled = true;
          fetch(url, { method: 'POST' })
            .then(function(resp){ if (!resp.ok) throw new Error('HTTP ' + resp.status); return resp.text(); })
            .then(function(){ setStatus('Sent: ' + name); })
            .catch(function(err){ setStatus('Failed: ' + err.message, true); })
            .finally(function(){ btn.disabled = false; });
        }

        Array.prototype.forEach.call(document.querySelectorAll('.tile'), function(btn){
            if (btn.hasAttribute('data-slot')) {
              btn.addEventListener('click', handleCommandClick, { passive: true });  
            } 
            if (btn.hasAttribute('data-name')) {
              setTileColors(btn);
              btn.addEventListener('click', handleClick, { passive: true });
            }
        });
      })();
    </script>
  </body>
 </html>`)
})

// All requests must be authenticated

async function stopCurrentSequence() {
    const stopUrl = `${config.FPPUrl}/api/sequence/current/stop`
    logger.info(`Proxying current sequence stop to ${stopUrl}`)
    return await fetch(stopUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
    })
}

async function startSequence(name: string) {
    await stopCurrentSequence()
    const startUrl = `${config.FPPUrl}/api/sequence/${encodeURIComponent(name)}/start`
    logger.info(`Proxying sequence start to ${startUrl}`)
    return await fetch(startUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
    })
}

async function sendCommandPreset(slot: string) {
    const command = 'Trigger Command Preset Slot';
    const targetUrl = `${config.FPPUrl}/api/command/${encodeURIComponent(command)}/${slot}`
    logger.info(`Proxying to ${targetUrl}`)

    return await fetch(targetUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
    })
}

// Routes
// Start a sequence by name via FPP proxy
app.post('/api/sequence/:name/start', async (req: Request, res: Response) => {
    try {
        const { name } = req.params
        if (!name || !/^[A-Za-z0-9._\s-]+$/.test(name)) {
            res.status(400).json({ error: 'Invalid sequence name' })
            return
        }

        const fppResp = await startSequence(name)
        const text = await fppResp.text().catch(() => '')
        if (!fppResp.ok) {
            res.status(502).json({ error: 'FPP responded with error', status: fppResp.status, body: text })
            return
        }
        res.status(200).send(text || 'OK')
    } catch (err: any) {
        logger.error(`Error starting sequence: ${err?.message || err}`)
        const isTimeout = (err && (err.name === 'TimeoutError' || /abort/i.test(err.message)))
        res.status(isTimeout ? 504 : 500).json({ error: 'Failed to reach FPP', message: err?.message || String(err) })
    }
})
app.post('/api/command-preset/:slot', async (req: Request, res: Response) => {
    try {
        const { slot } = req.params
        if (!slot || !/^[0-9]+$/.test(slot)) {
            res.status(400).json({ error: 'Invalid slot number' })
            return
        }

        let fppResp;
        if (slot === '1') {
            // Fade out
            fppResp = await sendCommandPreset(slot)
            setTimeout(async () => {
                logger.info('Sending stop and on command')
                await stopCurrentSequence()
                await sendCommandPreset('3')
            }, 5000)
        } else {
            fppResp = await sendCommandPreset(slot)
        }

        const text = await fppResp.text().catch(() => '')
        if (!fppResp.ok) {
            res.status(502).json({ error: 'FPP responded with error', status: fppResp.status, body: text })
            return
        }
        res.status(200).send(text || 'OK')
    } catch (err: any) {
        logger.error(`Error starting sequence: ${err?.message || err}`)
        const isTimeout = (err && (err.name === 'TimeoutError' || /abort/i.test(err.message)))
        res.status(isTimeout ? 504 : 500).json({ error: 'Failed to reach FPP', message: err?.message || String(err) })
    }
})


// Error handling
app.use(errorHandler)

export default app
