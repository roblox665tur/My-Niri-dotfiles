import { Gtk } from "astal/gtk4";
// import { connect } from "astal/gtk4";
import PanelButton from "../PanelButton";
import BarItem from "../BarItem";
import NiriService from "../../../service/Niri";


function getKey(layout: string): string {
  return layout === "us" ? "en" : layout === "ru" ? "ru" : "?";
}

export default () => {
	const niri = NiriService.get_default();

	// 创建一个Stack实例
	const stack = new Gtk.Stack({
		transitionType: Gtk.StackTransitionType.SLIDE_UP_DOWN,
		halign: Gtk.Align.CENTER,
		hexpand: true
	});

	// 添加子页面
	stack.add_named(new Gtk.Label({ label: "en" }), "en");
	stack.add_named(new Gtk.Label({ label: "ru" }), "ru");
	stack.add_named(new Gtk.Label({ label: "?" }), "?");

	// 连接信号
	niri.connect("notify::layout", () => {
		const layout = niri.layout
		stack.set_visible_child_name(getKey(layout) );
	});

	// 设置默认显示子页面
	stack.set_visible_child_name(niri.layout);

	return (
		<BarItem cssName="bar__keyboard-layout">
			{stack}
		</BarItem>
	);
};
