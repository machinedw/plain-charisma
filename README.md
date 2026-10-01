# Plain Charisma: 28 days

A mobile-first installable web app (PWA). One lesson a day for 28 days on first impressions, voice, nerve and boundaries, listening, and small talk. Every lesson shows an evidence tag and its sources.

## Put it on your phone (GitHub Pages, free)

1. **Unzip** `plain-charisma.zip` on your computer first. GitHub won't unpack it for you.
2. Create a GitHub account if you don't have one. Click **New repository**. Name it `plain-charisma`, set it to **Public**, and create it.
3. On the repo page click **Add file → Upload files**. Drag in the *contents* of the unzipped folder, not the zip: `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `.nojekyll`, and the `data` and `icons` folders. If your file manager hides `.nojekyll`, don't worry; the app works without it.
4. Click **Commit changes**.
5. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and Save.
6. Wait a minute or two. Your app is at `https://YOURNAME.github.io/plain-charisma/`.

## Install it (do this before you start using it)

- **iPhone:** open the URL in **Safari**, tap Share, then **Add to Home Screen**.
- **Android:** open the URL in **Chrome**, tap the menu, then **Install app** (or Add to Home screen).

Install first, then use the home-screen icon. On iPhone, the home-screen app has its own storage, separate from Safari. If you read Day 1 in Safari and then install, the installed app starts at Day 1 again with no completed days.

## Check that it works offline

Open the app once on Wi-Fi. Turn on airplane mode. Open it again. It should still load and keep your place.

## Updating the lessons

Edit the files in `data/`. Then open `sw.js` and change `plain-charisma-v1` to `plain-charisma-v2`, and re-upload. The app serves the saved copy first and refreshes in the background, so you'll see the update after closing and reopening it once or twice.

## Test on your own computer

Don't double-click `index.html`; service workers and install don't work from `file://`. Instead, in this folder run:

    python3 -m http.server 8000

and open `http://localhost:8000`.

## How to use

Tap the right side of the screen for the next day, the left side for the previous. Swipe works too, and so do the Previous and Next buttons. Your place and completed days are saved on the device. "Contents" jumps to any day.

## Honesty notes

- The lessons are a synthesis built from published studies and, where labeled, practitioner craft. **No study has tested this 28-day sequence.**
- Evidence tags are my judgment of how well each day's claims hold up. Where I couldn't verify something, the lesson or its source list says so.
- Citation details (volume and page numbers) for a few older papers were written from memory. Spot-check them before quoting anything.
- I tested it in a headless Chromium at 390, 360, and 320 pixels wide. That browser had no phone fonts, so it used a wider fallback serif. On a real phone the text will usually be a little more compact. I have not run it on a physical iPhone or Android device.
