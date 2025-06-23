import {  Variable, exec, subprocess, bind } from 'astal';
import BarButton from "../BarButton";
import { range } from "../../../lib/utils";
import { Gtk, App, Gdk } from "astal/gtk3";
import BarItem from "../BarItem";


export default () => {
	const workspaceIDX = Variable(0)
	let ws = Variable(10)
	try {
		const proc = subprocess({
			cmd: ["/home/roblox/.config/ags/scripts/eventStream.sh"],
			out: (line: string) => {
				try {
					const data = JSON.parse(line);
					// parse data
					console.log(data)
					if (data.WorkspacesChanged && Array.isArray(data.WorkspacesChanged.workspaces)) { 
						const workspaces= data.WorkspacesChanged.workspaces 
						ws.set(workspaces.length) 
						console.log(ws.get())
						  
					}

					if (data.WorkspaceActivated && typeof data.WorkspaceActivated.id === 'number') {
					       	workspaceIDX.set(data.WorkspaceActivated.id);
					}
				} catch(err) {
					console.log("JSON ERROR: ", err)
				}
			},
			err: (errLine: string) => {
				console.error("PROCESS ERROR: ", errLine);
			},
		});

		}catch (err) {
		console.log("STARTING PROCESS ERROR: ", err)
	}
	
	const focusWorkspace = (workspaceID: number) =>	exec("bash", "c", `niri msg action focus-workspace ${workspaceID.toString()}`)
	const focusedWorkspaceBinding = bind( workspaceIDX, "focusedWorkspace")


return (
		<BarItem>
			<box spacing={8}>
				{range(ws.get()).map((i) => {
					return (
						<button
							valign={Gtk.Align.CENTER}
							className={focusedWorkspaceBinding.as(
								(fw) => {
									return i === fw.id
										? "bar__workspaces-indicator active"
										: "bar__workspaces-indicator";
								},
							)}
							onClicked={() => focusWorkspace(i)}
						/>
					);
				})}
			</box>
		</BarItem>
);
	
};
