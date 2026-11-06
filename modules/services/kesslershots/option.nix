# Options for the Kesslershots website: public static files served by the host nginx.
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
              # A setting, not internal: the host nginx is shared, so a second copy of
              # this plugin or another static site may need a different port.
              port = mkOption {
                type = types.port;
                default = 7979;
                rank = 10;
                description = "Port the website uses inside this server. Change it only if another site already uses this one.";
                ui = lib.neo.ui.mkUi {
                  group = lib.neo.ui.groups.advanced;
                  label = "Internal port";
                };
              };
            }
            // lib.neo.mkReverseProxyOptions {
              subdomain = name;
              # A public website: visitors must not see a login page.
              auth.enabled = false;
            }
            // lib.neo.mkSystemdUnits ["nginx"]
            // lib.neo.mkServiceMeta {
              category = "Media";
              icon = ./icon.svg;
              tagline = "The Kesslershots wedding photography website${plugin.label}";
              description = ''
                Publishes the Kesslershots website from your own server, open to everyone.
                Add kesslershots.ch under Custom domains to serve it at its real address.
              '';
              notes = ''
                The pages are built into the system from the site folder of this plugin, so they change only with a plugin update.
                The contact form sends messages through formsubmit.co. Fonts, styles and icons load from external services.
                Point the domain's DNS at this server before adding it under Custom domains, or its HTTPS certificate cannot be issued.
              '';
              replaces = ["Hostinger"];
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
