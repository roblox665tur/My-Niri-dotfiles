import { App, Gtk, Astal } from "astal/gtk4";
import AstalNotifd from "gi://AstalNotifd";
import { bind } from "astal";
import { time } from "../../../lib/utils";
import PanelButton from "../PanelButton";
import AstalApps from "gi://AstalApps";
import AstalMpris from "gi://AstalMpris?version=0.1";
import { Variable } from "astal";
import { WINDOW_NAME } from "../../Dashbord/Dashboard";
import { Label } from "astal/gtk4/widget";
import Pango from "gi://Pango?version=1.0";

const notifd = AstalNotifd.get_default();
const mpris = AstalMpris.get_default();

// 全局 Variable 来跟踪是否有播放器正在播放
export const isPlaying = Variable(false);
export const currentTrack = Variable("");

const getCurrentTrack = () => {
	try {
		const players = mpris.get_players();
		const playingPlayer = players.find(player => player.playbackStatus === AstalMpris.PlaybackStatus.PLAYING);

		if (playingPlayer) {
			// 使用更安全的方式获取标题
			const title = playingPlayer.title || "Unknown Music";
			console.log("Current track:", title); // 添加调试日志
			currentTrack.set(title);
		} else {
			console.log("No playing track found"); // 添加调试日志
			currentTrack.set("");
		}
	} catch (error) {
		console.error("Error getting current track:", error);
		currentTrack.set("");
	}
};

// 检查是否有播放器正在播放的函数
const checkPlayingStatus = () => {
	try {
		const players = mpris.get_players();
		const playing = players.some(player => player.playbackStatus === AstalMpris.PlaybackStatus.PLAYING);
		console.log("Playing status:", playing); // 添加调试日志
		isPlaying.set(playing);
		getCurrentTrack(); // 同时更新歌曲标题
	} catch (error) {
		console.error("Error checking playing status:", error);
		isPlaying.set(false);
		currentTrack.set("");
	}
};

// 为每个现有播放器添加监听器
const handlePlayers = () => {
	mpris.get_players().forEach((player) => {
		console.log("Adding listeners to player:", player.identity); // 添加调试日志
		player.connect("notify::playback-status", checkPlayingStatus);
		player.connect("notify::metadata", getCurrentTrack); // 添加元数据监听器
	});
	checkPlayingStatus(); // 立即检查一次状态
};

// 监听播放器的添加和移除
mpris.connect("player-added", (_, player) => {
	console.log("Player added:", player.identity); // 添加调试日志
	player.connect("notify::playback-status", checkPlayingStatus);
	player.connect("notify::metadata", getCurrentTrack); // 添加元数据监听器
	checkPlayingStatus();
});

mpris.connect("player-closed", () => {
	console.log("Player closed"); // 添加调试日志
	checkPlayingStatus();
});

// 初始化
handlePlayers();

function NotifIcon() {
	const getVisible = () =>
		notifd.dont_disturb ? true : notifd.notifications.length <= 0;

	const visibility = Variable(getVisible())
		.observe(notifd, "notify::dont-disturb", () => {
			return getVisible();
		})
		.observe(notifd, "notify::notifications", () => getVisible());

	return (
		<label
			onDestroy={() => visibility.drop()}
			visible={visibility()}
			//cssClasses={["icon"]}
			label={bind(notifd, "dont_disturb").as(
				(dnd) => dnd ? "☪" : "󰣇" ,
			)}
		/>
	);
}
export default function TimePanelButton({ format = "%a,%H:%M" }) {

	const apps = new AstalApps.Apps();
	const substitute: {
		"Screen Recorder": string;
		Screenshot: string;
		Hyprpicker: string;
		rmpc: string;
		foamshot: string;
		kew: string;
		"change-color": string;
		[key: string]: string | undefined;
	} = {
		"Screen Recorder": "screencast-recorded-symbolic",
		Screenshot: "screenshot-recorded-symbolic",
		Hyprpicker: "color-select-symbolic",
		foamshot: "screenshot-recorded-symbolic",
		rmpc: "folder-music-symbolic",
		kew: "library-music-symbolic",
		musicfox: "folder-music-symbolic",
		"change-color": "preferences-desktop-theme-global-symbolic",
	};
	const ishover = Variable(false);
	return (
		<PanelButton
			window={WINDOW_NAME}
			onClicked={() => App.toggle_window(WINDOW_NAME)}
		>
			<box spacing={12}>
				<box
					visible={bind(isPlaying)} // 使用 bind
					onHoverEnter={() => ishover.set(true)}
					onHoverLeave={() => ishover.set(false)}
				>
					<image
						iconName={"music-playing-symbolic"}
					/>
					<revealer
						transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
						transitionDuration={300}
						revealChild={bind(ishover)}
					>
						<label
							label={bind(currentTrack)} // 使用 bind 而不是 currentTrack()
							maxWidthChars={15}
							ellipsize={Pango.EllipsizeMode.END}
						/>
					</revealer>
				</box>
				<image iconName={"folder-music-symbolic"} />
				<label label={time((t) => t.format(format)!)} />
				{/* <label */}
				{/* 	cssClasses={["clock-notificount"]} */}
				{/* 	label={bind(notifd, "notifications").as((n) => n.length.toString())} /> */}
				{bind(notifd, "dontDisturb").as((dnd) =>
					!dnd ? (
						<box spacing={6}>
							{bind(notifd, "notifications").as((n) => {
								if (n.length > 0) {
									return [
										...n.slice(0, 3).map((e) => {
											const getFallback = (appName: string) => {
												const getApp = apps.fuzzy_query(appName);
												if (getApp.length != 0) {
													return getApp[0].get_icon_name();
												}
												return "unknown";
											};
											const fallback =
												e.app_icon.trim() === ""
													? getFallback(e.app_name)
													: e.app_icon;
											const icon = substitute[e.app_name] ?? fallback;
											return <image iconName={icon} />;
										}),
										<label
											visible={n.length > 3}
											cssClasses={["circle"]}
											label={""}
										/>,
									];
								}
								return <NotifIcon />;
							})}
						</box>
					) : (
						<NotifIcon />
					),
				)}
			</box>
		</PanelButton>
	);
}
