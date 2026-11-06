# kesslershots.ch

The Kesslershots photography website, moving from its current web host to a self-hosted [Neo](https://github.com/madebydamo/neo) server.

`site/` is an unmodified copy of the live site, including its existing bugs. Improvements come later.

The website's text and photos belong to their owner. They are not licensed for reuse.

## Run it locally

You need Python 3. `wget` is only needed for `./dev mirror`.

```bash
./dev serve
```

Then open <http://localhost:7979>.

| Command | What it does |
|---------|--------------|
| `./dev serve [--port N]` | Serves `site/` like production: case-sensitive paths, no directory listings, no caching |
| `./dev links` | Lists links and images in `site/` that lead nowhere |
| `./dev compare` | Compares `site/` with the live site, byte for byte |
| `./dev mirror` | Replaces `site/` with a fresh download of the live site, discarding local edits |
| `./dev plugin-check` | Formats the Nix files and runs the Neo plugin checks (needs Nix) |

With Nix, `nix develop` provides Python and wget.

**The contact form is live.** Even from localhost, submitting it sends a real email to the site owner through formsubmit.co, then returns to the live site. Fonts, styles and icons load from external services, so pages need internet access to look right.

## Add it to Neo

1. In the Neo web UI, go to **Settings → System → Plugins** and add:

   ```text
   github:curi0s1ty21/kesslershots.ch
   ```

2. Enable **kesslershots** on the Services page and activate. The site opens at `https://kesslershots.<your domain>`, without a login.
3. To go live at the real address, point the DNS of `kesslershots.ch` at the server, then add it under the service's **Custom domains**.

Changes to `site/` reach the server once they are pushed and the plugin is updated in Neo.

Plugin code is in `modules/`. See [AGENTS.md](AGENTS.md).
