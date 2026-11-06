# Skill for Neo's assistant (published as neo-<name>).
{...}: {
  neoPlugin.modules.kesslershots-skills = {
    config,
    lib,
    plugin,
    ...
  }: let
    name = plugin.name "kesslershots";
    cfg = config.neo.services.${name};
    domain = config.neo.services.swag.domain or null;
  in {
    config.neo.services.${name}.skill.conf = lib.neo.mkServiceSkill {
      service = name;
      inherit cfg domain;
      description = "Kesslershots public photography website and its contact form";
      tags = ["neo" "kesslershots" "website"];
      title = "Neo · Kesslershots${plugin.label}";
      body = ''
        ## When to Use
        Questions about the Kesslershots website, its address, why it does not load, contact requests, or Telegram notifications.

        ## Architecture notes
        - Static files in the Nix store, served by the host `nginx` unit on `127.0.0.1:${toString cfg.port}`
        - SWAG proxies to it through `host.docker.internal`. Public: no login
        - `POST /api/contact` goes to the `${name}-contact` unit on `127.0.0.1:${toString cfg.contactPort}`
        - Requests are appended to `${cfg.appdata}/submissions.jsonl`, one JSON object per line, then sent to Telegram
        - Telegram needs both `services.${name}.telegramBotToken` and `services.${name}.telegramChatId`

        ## Procedures
        1. Check the `nginx` and `${name}-contact` units, then `curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:${toString cfg.port}/`
        2. Telegram not arriving: read `journalctl -u ${name}-contact`. The request is still saved
        3. To serve the real address, add it to `services.${name}.customDomains` after its DNS points at this server

        ## Pitfalls
        - Page content cannot be edited on the server. It changes with a plugin update
        - The `nginx` unit is shared with other static sites. Restarting it affects them too
        - `submissions.jsonl` holds personal data. Do not show it unless the operator asks
        - Clear appdata deletes every saved request

        ## Verification
        - `nginx` and `${name}-contact` are active
        - `GET /` on the site's address returns 200 without a login
      '';
    };
  };
}
