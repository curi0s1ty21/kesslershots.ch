# Serves site/ with the host nginx on loopback. SWAG reaches it through
# host.docker.internal. There is no state: the files live in the Nix store.
{...}: {
  neoPlugin.modules.kesslershots = {
    config,
    lib,
    plugin,
    ...
  }: let
    name = plugin.name "kesslershots";
    cfg = config.neo.services.${name};
    # builtins.path gives the store path a fixed name, whatever the checkout is called.
    site = builtins.path {
      path = ../../../site;
      name = "kesslershots-site";
    };
  in {
    config = lib.mkIf cfg.enabled (lib.mkMerge [
      (lib.neo.mkDockerToLocalhostForward cfg.port)
      {
        services.nginx = {
          enable = true;
          virtualHosts.${name} = {
            listen = [
              {
                addr = "127.0.0.1";
                port = cfg.port;
              }
            ];
            root = site;
            # Behind SWAG, an absolute redirect would expose the internal port:
            # /Blog/5%20Fehler -> http://<host>:7979/Blog/5%20Fehler/
            extraConfig = "absolute_redirect off;";
          };
        };
      }
    ]);
  };
}
