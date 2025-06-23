import { Gtk } from "astal/gtk4";
import { range } from "../../../lib/utils";
import { bind } from "astal";
import { Variable } from "astal";
import { execAsync } from "astal/process";

import { ButtonProps } from "astal/gtk4/widget";
import PanelButton from "../PanelButton";

import NiriService from "../../../service/Niri"; // путь поправь под свой
const niri = NiriService.get_default();

type WsButtonProps = ButtonProps & {
	idx: number;
};

function WorkspaceButton({ idx, ...props }: WsButtonProps) {
	const classNames = Variable.derive(
		[niri.focusedWs],
		(focused) => {
			const classes = ["workspace-button"];
			if (focused === idx) classes.push("active");
			return classes;
		},
	);

	return (
		<button
			cssClasses={classNames()}
			onDestroy={() => classNames.drop()}
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
			onClicked= { () =>  console.log("hello")}
			{...props}
		/>
	);
}

export default function WorkspacesPanelButton() {
	return (
		<PanelButton cssClasses={["workspace-button-bg"]}>
			<box cssClasses={["workspace-container"]} spacing={4}>
				{range(6).map((i) => (
					<WorkspaceButton idx={i} />
				))}
			</box>
		</PanelButton>
	);
}

