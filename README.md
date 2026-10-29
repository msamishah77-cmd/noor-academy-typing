# Noor Academy Typing Tutor

An original, frontend-only typing tutor for Noor Academy Larkana. Student records are stored in the browser's local storage; there is no account system or shared server.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build, run `npm run build`; preview the generated `dist/` folder with `npm run preview`.

## Features

- Forty-eight ordered, interactive lessons across Classic Lessons and Advanced Lessons learning paths.
- Timed one-, two-, three-, and five-minute tests with three difficulty levels.
- Character-by-character feedback, backspace correction, and a responsive US QWERTY visual keyboard.
- Live gross/net WPM, accuracy, error, and elapsed-time tracking.
- Lesson completion, best speed/accuracy, total and daily practice time, and recent tests saved under the versioned `noor-academy-typing-v1` local-storage key.
- Per-lesson WPM and accuracy records; optional sequential unlocking is configurable in the local teacher view and is off by default.
- Local teacher overview and CSV export; records are not visible on other computers.
- Responsive layout, keyboard access, and a light/dark theme toggle.

## Statistics

Gross WPM is total printable character entries divided by five and elapsed minutes. Net WPM is `max(0, gross WPM - incorrect entries / elapsed minutes)`. Accuracy is correct character entries divided by all printable character entries. A wrong entry remains an error in the statistics even if the student backspaces and fixes it; backspace itself is not counted as a character. Before the timer starts, WPM is zero and accuracy is 100%.

## Deployment

The production build is static and can be deployed to GitHub Pages, Cloudflare Pages, or another static host. Configure the host to build with `npm run build` and publish `dist/`. Client-side records remain in each browser and do not sync between computers. Shared student reporting requires a separately secured backend and database.
