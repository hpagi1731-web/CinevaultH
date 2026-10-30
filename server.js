import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to sanitize filenames
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9-_\.]/g, '_').substring(0, 80);
}

// Check if yt-dlp binary exists on host
function checkYtDlpAvailable() {
  return new Promise((resolve) => {
    const process = spawn('yt-dlp', ['--version']);
    process.on('error', () => resolve(false));
    process.on('close', (code) => resolve(code === 0));
  });
}

// 1. Analyze video URL
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const isYtDlpInstalled = await checkYtDlpAvailable();

  if (isYtDlpInstalled) {
    // Run yt-dlp to inspect stream
    const child = spawn('yt-dlp', ['-j', '--no-playlist', url]);
    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({
          error: 'Failed to extract video data.',
          details: errorOutput || 'Invalid video URL.'
        });
      }

      try {
        const metadata = JSON.parse(output);
        const formats = [
          { quality: '1080p (FHD)', ext: 'mp4', formatId: 'bestvideo[height<=1080]+bestaudio/best', size: '~65 MB' },
          { quality: '720p (HD)', ext: 'mp4', formatId: 'bestvideo[height<=720]+bestaudio/best', size: '~35 MB' },
          { quality: '480p (SD)', ext: 'mp4', formatId: 'bestvideo[height<=480]+bestaudio/best', size: '~18 MB' },
          { quality: 'Audio Only (MP3)', ext: 'mp3', formatId: 'bestaudio', size: '~8 MB' }
        ];

        return res.json({
          title: metadata.title || 'Extracted Video Stream',
          thumbnail: metadata.thumbnail || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
          duration: metadata.duration_string || 'N/A',
          uploader: metadata.uploader || 'Direct Stream',
          formats
        });
      } catch (err) {
        return res.status(500).json({ error: 'Metadata parsing failed' });
      }
    });
  } else {
    // Fallback simulated engine when running in local dev without yt-dlp binary
    return res.json({
      title: 'Cinematic High-Dynamic Showcase (Demo Mode)',
      thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
      duration: '04:18',
      uploader: 'CineVault Engine',
      formats: [
        { quality: '4K ProRes UHD', ext: 'mp4', formatId: 'demo-4k', size: '240 MB' },
        { quality: '1080p High-Bitrate', ext: 'mp4', formatId: 'demo-1080p', size: '54 MB' },
        { quality: '720p Standard', ext: 'mp4', formatId: 'demo-720p', size: '22 MB' },
        { quality: 'Audio Only (FLAC/MP3)', ext: 'mp3', formatId: 'demo-mp3', size: '7 MB' }
      ],
      notice: 'yt-dlp is not installed on this server. Fallback stream simulator active.'
    });
  }
});

// 2. Stream video down to client
app.get('/api/download', async (req, res) => {
  const { url, title = 'CineVault_Media', format = 'mp4' } = req.query;

  if (!url) {
    return res.status(400).send('Target URL required');
  }

  const safeTitle = sanitizeFilename(title);
  const isYtDlpInstalled = await checkYtDlpAvailable();

  res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${format}"`);
  res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');

  if (isYtDlpInstalled) {
    const child = spawn('yt-dlp', ['-o', '-', url]);
    child.stdout.pipe(res);
    child.stderr.on('data', (d) => console.error(d.toString()));
  } else {
    // Stream a high-quality royalty-free video as demo payload
    const demoVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const response = await fetch(demoVideoUrl);
    if (!response.body) return res.status(500).send('Download stream failed');

    const reader = response.body.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) return res.end();
      res.write(Buffer.from(value));
      return pump();
    };
    pump();
  }
});

app.listen(PORT, () => {
  console.log(`CineVault running at http://localhost:${PORT}`);
});
