import { execAsync, GLib } from "astal";
import { mkOptions, opt } from "./lib/option";
import { gsettings } from "./lib/utils";

const options = mkOptions(
  `${GLib.get_user_config_dir()}/aiser-astal/config.json`,
  {
    wallpaper: {
      folder: opt(`${GLib.get_home_dir()}/Pictures/wallpapers`, { cached: true }),
      current: opt(
        await execAsync("swww query")
          .then((out) => out.split("image:")[1].trim())
          .catch(() => ""),
        { cached: true },
      ),
    },
    desktop_clock: {
      position: opt<
        | "top_left"
        | "top"
        | "top_right"
        | "left"
        | "center"
        | "right"
        | "bottom_left"
        | "bottom"
        | "bottom_right"
      >("top_left"),
    },
    screencorners: {
      radius: 20,
    },
    bar: {
      position: opt("top"),
      separator: opt(true),
      start: opt(["launcher", "workspace" ]),
      center: opt(["time"]),
      end: opt(["recordbutton", "keylayout", "network_speed", "tray", "quicksetting", "powermenu"]),
    },
    theme: {
      mode: opt(
        gsettings.get_string("color-scheme") == "prefer-light"
          ? "light"
          : "dark",
        { cached: true },
      ),
    },
  },
);

export default options;
