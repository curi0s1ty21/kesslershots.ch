# https://<subdomain>.<domain> and any custom domains -> host nginx on loopback.
{...}: {
  neoPlugin.modules.kesslershots-swag = {
    config,
    lib,
    plugin,
    ...
  }: let
    name = plugin.name "kesslershots";
    cfg = config.neo.services.${name};
  in {
    config.neo.services.${name}.proxyConf = lib.mkDefault (lib.neo.mkSubdomainProxyConf {
      inherit config cfg;
      proxyPass = "http://host.docker.internal:${toString cfg.port}/";
    });
  };
}
