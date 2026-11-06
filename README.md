# kesslershots.ch

The Kesslershots photography website, self-hosted on a [Neo](https://github.com/madebydamo/neo) server.

The website's text and photos belong to their owner. They are not licensed for reuse.

## Run it locally

You need Python 3. `nix develop` provides everything `./dev` uses.

```bash
./dev serve
```

Then open <http://localhost:7979>.

| Command | What it does |
|---------|--------------|
| `./dev serve [--port N]` | Serves `site/` and the contact form, like production |
| `./dev images` | Creates image sizes for new images in `site/` and uses them in the pages (needs Pillow) |
| `./dev links` | Lists links and images in `site/` that lead nowhere |
| `./dev compare` | Lists files in `site/` that differ from the old live site |
| `./dev mirror` | Replaces `site/` with the old live site, discarding every change |
| `./dev plugin-check` | Formats the Nix files and runs the Neo plugin checks (needs Nix) |

## Images

The pages use AVIF and WebP versions in `site/assets/img/`, in several widths, so each screen downloads only what it needs. Browsers without those formats get the original.

To add an image, put it in `site/`, reference it with a normal `<img>`, and run `./dev images`. It picks the display width from the image's classes (`sizes_for` in `scripts/optimize_images.py`), so add a rule there for a new layout.

Images are never enlarged. For large high-resolution screens, use originals of at least 2560 pixels wide.

## Contact form

The form posts to `/api/contact`, handled by `server/contact_server.py`. It saves each message, then sends it to Telegram if a bot is configured.

| Where | Messages are saved in |
|-------|----------------------|
| `./dev serve` | `.data/contact/submissions.jsonl` (ignored by git) |
| Neo | `submissions.jsonl` in the service's appdata folder |

To test Telegram locally, set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` before `./dev serve`.

## Blog

The blog is offline. Its pages and images are in `offline/blog/`, and its links in the remaining pages are wrapped in `<template data-offline="blog">`, which browsers do not display.

To bring it back, copy `offline/blog/*` into `site/` and remove those `<template>` wrappers.

## Add it to Neo

1. In the Neo web UI, go to **Settings → System → Plugins** and add:

   ```text
   github:curi0s1ty21/kesslershots.ch
   ```

2. Enable **kesslershots** on the Services page and activate. The site opens at `https://kesslershots.<your domain>`, without a login.
3. For Telegram notifications:
   1. Create a bot with [@BotFather](https://t.me/BotFather) and copy its token.
   2. Send your bot a message, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `chat.id`.
   3. Enter both under the service's settings, or in `settings.toml`:

      ```toml
      [services.kesslershots]
      enabled = true
      telegramBotToken = "123456:ABC..."
      telegramChatId = "123456789"
      ```

4. To go live at the real address, point the DNS of `kesslershots.ch` at the server, then add it under the service's **Custom domains**.

Changes reach the server once they are pushed and the plugin is updated in Neo.

Plugin code is in `modules/`. See [AGENTS.md](AGENTS.md).

## Third-party files

| Files | Source | License |
|-------|--------|---------|
| `site/assets/vendor/tailwind-2.2.19.min.css` | [Tailwind CSS](https://tailwindcss.com) | MIT |
| `site/assets/fonts/` | [Dosis](https://github.com/googlefonts/dosis-vf) | SIL OFL 1.1 (`OFL.txt`) |
| `site/assets/icons/` | [Font Awesome Free](https://fontawesome.com) | CC BY 4.0 |
