# VOD2Content

**Long VODs → publish-ready Shorts.**  
Local. Fast. Game-aware. Subtitled.

---

## What “done” looks like

Every Short leaves the pipeline as:

| Spec | Value |
|------|--------|
| Frame | 1080×1920 · 9:16 |
| Length | Peak moments or last-N seconds |
| Audio | Loudness-normalized (~−14 LUFS) |
| Captions | Burned-in, high-contrast, mobile-safe |
| Metadata | Title · hook · tags · thumbnail text |
| Source | Local path · YouTube URL · small upload |

---

## Jobs

1. **Shorts (auto highlights)** — TURBO on 30m+ VODs (audio peaks, parallel encode)  
2. **Fast clip — last N seconds** — e.g. last 60s, no full analysis  
3. **Long-form reel** — stitched highlights  
4. **Analyze only** — timestamps + scores  

## Game profiles

iRacing · Escape from Tarkov · FPS · Battle Royale · MMO/RPG · Sports · Generic  

## GUI

Runs in a **native desktop window** (tkinter). No Chrome/Edge window required.

## Install (Windows)

```powershell
# Unzip, then:
Get-ChildItem -Recurse | Unblock-File
Set-ExecutionPolicy -Scope Process Bypass
.\install.ps1
```

Desktop icon: **VOD2Content** (opens a native window — not a browser)

### Captions + YouTube (recommended)

```powershell
& "$env:USERPROFILE\.vod2content\venv\Scripts\pip.exe" install faster-whisper yt-dlp
```

Or run `UPDATE_APP.ps1` from a new package unzip.

## Speed targets

| Job | Typical |
|-----|---------|
| Fast clip (last 60s) | Seconds–few minutes |
| TURBO Shorts on 3–8h VOD | Aim ≤ ~15 min (medium/draft, parallel encodes) |
| Captions | Extra time per clip (Whisper on CPU) |

## CLI

```text
vod2content profiles
vod2content clip my_vod.mp4 60 -o .\out
vod2content shorts my_vod.mp4 --game iracing -o .\out --quality medium
vod2content analyze my_vod.mp4 --game tarkov
```

## Philosophy

- **Your** VODs, on **your** machine  
- Path over browser upload for multi-GB files  
- Audio-first on multi-hour streams; vision is assist, not a full 8h neural scan  
- Captions so the clip works on mute  

Built for creators who stream for hours and ship in minutes.
