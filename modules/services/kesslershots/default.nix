# Serves site/ with the host nginx on loopback. SWAG reaches it through
# host.docker.internal. The pages live in the Nix store. The only state is the
# contact form's messages, in appdata.
{...}: {
  neoPlugin.modules.kesslershots = {
    config,
    lib,
    pkgs,
    plugin,
    ...
  }: let
    name = plugin.name "kesslershots";
    cfg = config.neo.services.${name};
    appdata = "${config.neo.core.volumes.appdata}/${name}";
    contactUnit = "${name}-contact";
    # builtins.path gives the store path a fixed name, whatever the checkout is called.
    site = builtins.path {
      path = ../../../site;
      name = "kesslershots-site";
    };
    isSet = value: value != null && value != "";
    telegram = isSet cfg.telegramBotToken && isSet cfg.telegramChatId;
  in {
    config = lib.mkIf cfg.enabled (lib.mkMerge [
      (lib.neo.mkDockerToLocalhostForward cfg.port)
      {
        assertions = [
          {
            assertion = isSet cfg.telegramBotToken == isSet cfg.telegramChatId;
            message = "neo.services.${name}: set both the Telegram bot token and the chat ID, or neither.";
          }
        ];

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
            # Behind SWAG, an absolute redirect would expose the internal port.
            # Compression: the stylesheet is 2.9 MB uncompressed.
            extraConfig = ''
              absolute_redirect off;
              gzip on;
              gzip_types text/css image/svg+xml;
            '';
            locations."= /api/contact" = {
              proxyPass = "http://127.0.0.1:${toString cfg.contactPort}";
              extraConfig = "client_max_body_size 64k;";
            };
          };
        };

        systemd.tmpfiles.rules = ["d ${appdata} 0700 homeserver homeserver -"];

        systemd.services.${contactUnit} = {
          description = "Kesslershots contact form${plugin.label}";
          wantedBy = ["multi-user.target"];
          after = ["network-online.target"];
          wants = ["network-online.target"];
          environment =
            {
              CONTACT_PORT = toString cfg.contactPort;
              CONTACT_DATA_DIR = appdata;
            }
            // lib.optionalAttrs telegram {
              TELEGRAM_CHAT_ID = cfg.telegramChatId;
            };
          serviceConfig = {
            ExecStart = "${pkgs.python3}/bin/python3 ${../../../server/contact_server.py}";
            EnvironmentFile = lib.optional telegram config.neo.core.secrets.templates.${contactUnit}.path;
            User = "homeserver";
            Group = "homeserver";
            Restart = "on-failure";
            ProtectSystem = "strict";
            ProtectHome = true;
            PrivateTmp = true;
            NoNewPrivileges = true;
            ReadWritePaths = [appdata];
          };
        };

        neo.core.secrets.templates = lib.mkIf telegram {
          ${contactUnit} = {
            env.TELEGRAM_BOT_TOKEN = cfg.telegramBotToken;
            owner = "homeserver";
            group = "homeserver";
            restartUnits = ["${contactUnit}.service"];
          };
        };
      }
    ]);
  };
}
