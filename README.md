# CineVault

> Studio-grade video downloader and curated cinematic source archive.

CineVault features a dark cinematic user interface equipped with stream metadata extraction, multi-format container downloading (4K UHD, 1080p, 720p, MP3), background task management, and an archive catalog.

---

## Features

- **Link Stream Extractor**: Parses media stream titles, durations, thumbnails, and available audio/video formats.
- **Direct Stream Pipe**: Pipes media streams through Express to enforce `Content-Disposition` file downloads.
- **Fallback Simulation Engine**: Automatically operates in demo mode if the host environment does not have native CLI stream tools installed.
- **Transfer Drawer**: Real-time progress monitoring for queued downloads.
- **Master Archive Grid**: Instant access to curated royalty-free stock footage.

---

## Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Optional: [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) installed and available in your system `$PATH` for live YouTube/Vimeo stream parsing.

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/cinevault.git
cd cinevault
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
```bash
cp .env.example .env
```

### 5. Launch the Application
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

Navigate to `http://localhost:3000` in your web browser.

---

## Git Commands to Publish to GitHub

```bash
git init
git add .
git commit -m "Initial commit: CineVault release"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/cinevault.git
git push -u origin main
```

---

## License

This project is licensed under the [MIT License](LICENSE).
