# Bildstil & KI-Prompts (lets-todo)

**Erstellt:** 2026-08-22
**Werkzeug:** ChatGPT (Bildgenerierung)
**Ziel:** Einheitlicher visueller Stil über App-Icon und Social-Preview-Banner hinweg, ohne
den Stil jedes Mal neu beschreiben zu müssen.
**Motiv (Vorschlag):** ein stilisiertes Häkchen-/Checklisten-Symbol, passend zum Thema der
App (Task-Management). Bei Bedarf vor der ersten Generierung anpassen.

---

## Prinzip: Master-Stil-Anker

Ein fester Textblock beschreibt den Bildstil. Dieser Block wird **immer** an den Anfang
jedes Bildgenerierungs-Prompts gestellt. Nur der Teil danach ändert sich je nach Bildtyp.

```text
Minimalist flat-design illustration style, not photorealistic, soft gradients only, no fine
detail. A stylized checklist with one bold checkmark as the recurring central motif, with
soft warm light radiating behind it. Strict color palette only: deep copper-gold #906C37,
warm amber #D39A50, sand-gold #DFC279 for the light glow, sage-olive #8C8E71 and dark
forest-green #4E5952 for background depth. Clean simple shapes, no clutter, no text.
Consistent brand style for 'lets-todo', matching the existing Dev2K brand color palette.
```

---

## Avatar/Icon

Quadratisch, 512×512px, App-Icon-Charakter. Muss auch klein noch erkennbar bleiben.

```text
[Master-Stil-Anker] — Create a square app icon, 512x512px (1:1). Center the
checklist/checkmark motif, simplified enough to stay legible at small icon size. No text,
no watermark.
```

## Social-Preview/Banner

1200×630px, für README und Repo-Social-Preview.

```text
[Master-Stil-Anker] — Create a social preview banner, 1200x630px. Place the
checklist/checkmark motif off-center toward the left or right third, dark forest-green
background extending smoothly across the full width. Leave the opposite third visually
calm for a project name to be added separately afterward. No text, no watermark, no
thumbnail-style crop marks.
```

## PWA-Icon-Set + Favicon (Theme Hell/Dunkel)

Nur relevant, falls die App als installierbare PWA angeboten wird ("Als App
installieren"). Kein zweiter Bildprompt für den dunklen Modus nötig - ein Master-Icon
reicht, der Unterschied zwischen hell und dunkel steckt nur im Webmanifest.

```text
[Master-Stil-Anker] — Create a square app icon, 1024x1024px, using the same
checklist/checkmark motif described above, simplified for legibility at small sizes. Fully
transparent background (PNG with alpha channel). Keep the motif centered with roughly 15%
padding on all sides, so it still reads clearly once a launcher crops it into a circle or
rounded square (maskable icon safe zone). No text.
```

Alle Zielgrößen (72/96/128/144/152/192/384/512px, jeweils `any` und `maskable`) sowie
`favicon.ico` und `apple-touch-icon.png` (180×180) werden aus diesem einen Master-Icon per
`npx pwa-asset-generator` erzeugt, nicht einzeln geprompt:

```bash
npx pwa-asset-generator master-icon.png ./theme-light \
  --icon-only --favicon --padding "15%" --background "#ffffff"
npx pwa-asset-generator master-icon.png ./theme-dark \
  --icon-only --favicon --padding "15%" --background "#4E5952"
```

Zwei Webmanifest-Dateien, nur `theme_color`/`background_color` unterscheiden sich:

```json
// manifest-light.webmanifest
{
  "name": "Let's Todo",
  "short_name": "LetsTodo",
  "display": "standalone",
  "scope": "./",
  "start_url": "./",
  "theme_color": "#DFC279",
  "background_color": "#ffffff",
  "icons": [
    { "src": "theme-light/icon-72x72.png", "sizes": "72x72", "type": "image/png", "purpose": "any" },
    { "src": "theme-light/icon-72x72-maskable.png", "sizes": "72x72", "type": "image/png", "purpose": "maskable" }
  ]
}
```

```json
// manifest-dark.webmanifest
{
  "name": "Let's Todo",
  "short_name": "LetsTodo",
  "display": "standalone",
  "scope": "./",
  "start_url": "./",
  "theme_color": "#8C8E71",
  "background_color": "#4E5952",
  "icons": [
    { "src": "theme-dark/icon-72x72.png", "sizes": "72x72", "type": "image/png", "purpose": "any" },
    { "src": "theme-dark/icon-72x72-maskable.png", "sizes": "72x72", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

## Hinweise

- Text im Bild selbst generieren zu lassen funktioniert bei KI-Bildgeneratoren oft schlecht
  (verzerrte/falsche Schrift). Projektname immer separat nachträglich einfügen, nicht vom
  Modell rendern lassen.
- Bei Stil-Abweichungen zwischen Generierungen: Master-Stil-Anker wortgleich
  wiederverwenden (nicht umformulieren), das hält die Serie visuell konsistent.
- Die Hex-Werte stammen aus der bestehenden Dev2K-Homepage-Palette, nicht neu erfunden -
  das hält den Look konsistent mit `dev2ksoftware.com`.
