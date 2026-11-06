# Options for the Kesslershots website: public static files served by the host nginx,
# and a small service that receives the contact form.
{...}: {
  neoPlugin.modules.kesslershots-option = {
    config,
    lib,
    plugin,
    ...
  }:
    with lib;
    with {inherit (lib.neo) mkOption mkEnableOption;}; let
      name = plugin.name "kesslershots";
    in {
      options.neo.services.${name} = mkOption {
        type = types.submodule {
          options =
            {
              enabled = mkEnableOption "The Kesslershots photography website${plugin.label}" {rank = 0;};
              telegramBotToken = lib.neo.mkSecretOption {
                type = types.nullOr types.str;
                default = null;
                rank = 10;
                description = "Password of the Telegram bot that announces new contact requests. Empty: requests are only saved on this server.";
                ui = lib.neo.ui.mkUi {label = "Telegram bot token";};
              };
              telegramChatId = mkOption {
                type = types.nullOr types.str;
                default = null;
                rank = 20;
                description = "The Telegram chat that receives new contact requests. Needed together with the bot token.";
                ui = lib.neo.ui.mkUi {label = "Telegram chat ID";};
              };
              # Settings, not internal: the host nginx is shared, so a second copy of
              # this plugin or another static site may need different ports.
              port = mkOption {
                type = types.port;
                default = 7979;
                rank = 80;
                description = "Port the website uses inside this server. Change it only if another site already uses this one.";
                ui = lib.neo.ui.mkUi {
                  group = lib.neo.ui.groups.advanced;
                  label = "Internal port";
                };
              };
              contactPort = mkOption {
                type = types.port;
                default = 7980;
                rank = 81;
                description = "Port the contact form uses inside this server. Change it only if another service already uses this one.";
                ui = lib.neo.ui.mkUi {
                  group = lib.neo.ui.groups.advanced;
                  label = "Contact form port";
                };
              };
            }
            // lib.neo.mkReverseProxyOptions {
              subdomain = name;
              # A public website: visitors must not see a login page.
              auth.enabled = false;
            }
            // lib.neo.mkSystemdUnits ["nginx" "${name}-contact"]
            // lib.neo.mkAppdata "${config.neo.core.volumes.appdata}/${name}"
            // lib.neo.mkServiceMeta {
              category = "Media";
              icon = ./icon.svg;
              tagline = "The Kesslershots wedding photography website${plugin.label}";
              description = ''
                Publishes the Kesslershots website from your own server, open to everyone.
                Contact requests are saved on this server and can be sent to you on Telegram.
                Add kesslershots.ch under Custom domains to serve it at its real address.
              '';
              notes = ''
                The pages are built into the system from the site folder of this plugin, so they change only with a plugin update.
                Contact requests are in submissions.jsonl in this service's appdata folder, one per line. Clear appdata deletes them.
                To get them on Telegram: create a bot with BotFather, send it a message, and enter its token and your chat ID above.
                Telegram receives the content of every request, including names and contact details.
                Point the domain's DNS at this server before adding it under Custom domains, or its HTTPS certificate cannot be issued.
              '';
              replaces = ["Hostinger" "FormSubmit"];
              projectUrl = "https://kesslershots.ch";
              githubUrl = "https://github.com/curi0s1ty21/kesslershots.ch";
            }
            // lib.neo.mkSkillOptions {};
        };
        default = {};
        description = "Kesslershots website";
      };
    };
}
