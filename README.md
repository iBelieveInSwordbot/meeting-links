# ⚡ Quick Join

A minimal, single-file meeting quick-join web app. Built for one purpose:
**rejoin a meeting fast when your connection drops.**

Hosted via GitHub Pages, no build step, no framework — just one `index.html`.

## Features

- **Quick-join buttons** for recurring meetings (edit the JSON block at the top of `index.html`)
- **Paste-to-join field** with auto-detection — paste any meeting URL, hit Enter, done
- **Deep-link handoff** to native apps on macOS:
  - Zoom (`zoommtg://`)
  - Webex (`webex://` or https fallback)
  - Google Meet (opens in default browser)
  - Microsoft Teams (`msteams://`)
- **Zero dependencies.** Vanilla HTML/CSS/JS, fully self-contained.
- **Keyboard-first.** Autofocus on the paste field, `Enter` joins, `Esc` clears, any keypress refocuses.

## Configuring recurring meetings

Open `index.html`, find the `<script id="meeting-config">` block near the top, and edit:

```json
{
  "meetings": [
    {
      "name": "Standup",
      "subtitle": "Daily 9:00 AM",
      "url": "https://zoom.us/j/1234567890?pwd=abc"
    }
  ]
}
```

Platform is auto-detected from the URL. Save the file — reload the page — you're done.

## Supported URL formats

| Platform | Accepts |
|----------|---------|
| Zoom | `zoommtg://…`, `https://zoom.us/j/…`, `https://*.zoom.us/j/…` |
| Webex | `webex://…`, `https://*.webex.com/…` |
| Google Meet | `https://meet.google.com/…` |
| Teams | `msteams://…`, `https://teams.microsoft.com/l/…` |

Zoom and Teams https URLs are automatically converted to native deep links so they open the desktop app directly. Webex hands off via its own https bounce page (works fine when logged in).

## Future: Mac desktop app

The code is intentionally framework-free so this can be wrapped as an Electron / Tauri / native-webview app later without a rewrite.

## Deploying to GitHub Pages

```bash
git push origin main
```

Then in the repo settings → Pages → Source → `main` branch, `/ (root)`. Site goes live at
`https://<user>.github.io/meeting-links/`.
