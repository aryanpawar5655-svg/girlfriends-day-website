# A special message for Minahil 💗

A tiny hand-built one-page site — no build step, no dependencies, just `index.html` + `styles.css` + `script.js`. Works locally by double-clicking `index.html` or hosted on GitHub Pages.

## What you still need to add

1. **Photos** — put `photo1.jpg`, `photo2.jpg`, `photo3.jpg` in `images/` (see `images/README.md`).
2. **Song** *(optional)* — put `song.mp3` in `music/` (see `music/README.md`).
3. **Love letter text** — edit the paragraphs inside `<article class="card letter">` in `index.html` if you want your own wording.

## Deploy to GitHub Pages

1. Create a new public repo on github.com (name it e.g. `for-minahil`).
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "For Minahil 💗"
   git branch -M main
   git remote add origin https://github.com/syedbilal1997/for-minahil.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: `main` / root → Save**.
4. Wait ~30s, then open `https://syedbilal1997.github.io/for-minahil/`.

## Files

- `index.html` — all sections & copy
- `styles.css` — colors, layout, animations
- `script.js` — scenes, carousel, hearts, dodgy "no" button, music
- `images/` — put photos here
- `music/` — put song here
