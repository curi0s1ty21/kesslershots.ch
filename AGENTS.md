# AGENTS.md

This repo is the website kesslershots.ch (`site/`), its developer tools (`./dev`), and a **Neo plugin** that serves it: a Nix flake that adds a service to a Neo homeserver (github:madebydamo/neo). Neo imports every `neoPlugin.modules.*` under `modules/` into the host, once per copy of the plugin.

## Website

- `site/` is the document root. Paths are case-sensitive.
- `./dev serve` serves it and the contact form on http://localhost:7979. `./dev links` lists references that lead nowhere.
- New images: add a plain `<img>`, then run `./dev images`. `sizes_for` in `scripts/optimize_images.py` must match the layout.
- `server/contact_server.py` receives the contact form. It saves first, then notifies Telegram. It uses only the standard library, and its log must not contain form contents or the bot token.
- The blog is offline: `offline/blog/` and `<template data-offline="blog">`. Do not add links to it. See README.md.
- `./dev mirror` replaces `site/` with the old live site and discards every change. `./dev compare` is only useful against that old site.

## Before you change the plugin

1. Use the `neo-plugin` skill if you have it (Claude Code: `/plugin install neo --marketplace madebydamo/neo`; this repo's `.claude/settings.json` offers it).
2. Read the docs of the Neo revision this plugin pins, not GitHub `master`:

   ```bash
   NEO=$(nix flake archive --json 2>/dev/null | jq -r .inputs.neo.path)
   ```

   `$NEO/docs/PHILOSOPHY.md` (why), `$NEO/docs/PLUGIN-DEVELOPMENT.md` (how, with the checklist), `$NEO/docs/LIB.md` (every `lib.neo` helper), `$NEO/nix/services/*` (working examples).

## Layout

| Path | Role |
|------|------|
| `flake.nix` | Generated. Do not edit; change `modules/inputs.nix` and run `nix run .#write-flake` |
| `modules/imports.nix` | Imports `inputs.neo.flakeModules.plugin` |
| `modules/services/kesslershots/option.nix` | Options under `neo.services.<name>`: what the operator sets in the web UI |
| `modules/services/kesslershots/default.nix` | What runs: the host nginx on loopback serving `site/` from the Nix store, and the contact form unit |
| `modules/services/kesslershots/swag.nix` | HTTPS vhost via `lib.neo.mkSubdomainProxyConf` |
| `modules/services/kesslershots/skills.nix` | Skill for Neo's assistant via `lib.neo.mkServiceSkill` |

## Rules

- Every file under `modules/` is auto-imported. Never `imports = [ ./sibling.nix ]`. `git add` new files: flakes ignore untracked ones, including anything new in `site/`.
- `name = plugin.name "kesslershots"` for every service key, vhost, unit, appdata dir, secret template and subdomain. Titles get `${plugin.label}`.
- The site is public: keep `auth.enabled = false`.
- The bot token is a secret: only `neo.core.secrets.templates`, never `environment`.
- Texts are for non-technical operators: `tagline`/`description` say what they get, technical facts go in `notes` or Nix comments.
- Options are API: operators have them in `settings.toml`. Add, do not rename.

## Check

```bash
./dev plugin-check      # nix fmt && nix flake check; neo-plugin-instances fails on names that skip plugin.name
```

Then run it on a Neo VM or host: `$NEO/docs/PLUGIN-DEVELOPMENT.md` → Development loop and Verify on the host.
