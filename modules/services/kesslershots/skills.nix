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
      description = "Kesslershots public photography website, static files served by the host nginx";
      tags = ["neo" "kesslershots" "website"];
      title = "Neo · Kesslershots${plugin.label}";
      body = ''
        ## When to Use
        Questions about the Kesslershots website, its address, or why it does not load.

        ## Architecture notes
        - Static files in the Nix store, served by the host `nginx` unit on `127.0.0.1:${toString cfg.port}`
        - SWAG proxies to it through `host.docker.internal`
        - Public: no login. There is no appdata
        - The contact form posts to formsubmit.co, not to this server

        ## Procedures
        1. Check the `nginx` unit, then `curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:${toString cfg.port}/`
        2. To serve the real address, add it to `services.${name}.customDomains` after its DNS points at this server
        3. To change the port, set `services.${name}.port`

        ## Pitfalls
        - Page content cannot be edited on the server. It changes with a plugin update
        - The `nginx` unit is shared with other static sites. Restarting it affects them too

        ## Verification
        - `nginx` is active
        - `GET /` on the site's address returns 200 without a login
      '';
    };
  };
}
