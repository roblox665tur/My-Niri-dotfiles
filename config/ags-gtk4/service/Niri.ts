import GObject, { register, property } from "astal/gobject";
import { subprocess } from "astal";
import { Variable } from "astal";

@register({ GTypeName: "NiriService" })
export default class NiriService extends GObject.Object {
    static instance: NiriService;
    static get_default() {
        if (!this.instance) this.instance = new NiriService();
        return this.instance;
    }

    @property(String)
    declare layout: string;

    public focusedWs = Variable<number>(1);
    public wsCount = Variable<number>(1);
    public occupiedWorkspaces = Variable<number[]>([]);

    private workspaceMap: Map<number, any> = new Map();

    constructor() {
        super();
        this.layout = "us";

        subprocess({
		// set yor PATH
            cmd: ["/home/roblox/.config/ags-gtk4/scripts/eventStream.sh"],
            out: (line: string) => {
                try {
                    const d = JSON.parse(line);

                    if (d.KeyboardLayoutSwitched) {
                        this.layout = d.KeyboardLayoutSwitched.idx === 0 ? "us" : "ru";
                    }

                    if (d.WorkspacesChanged) {
                        const workspaces = d.WorkspacesChanged.workspaces;
                        this.wsCount.set(workspaces.length);

                        // Сохраняем workspace по id
                        this.workspaceMap.clear();
                        workspaces.forEach((w: any) => {
                            this.workspaceMap.set(w.id, w);
                        });

                        // Обновляем focused
                        const focused = workspaces.find((w: any) => w.is_focused);
                        if (focused) this.focusedWs.set(focused.idx-1);

                        // Обновляем занятые
                        const occupied = workspaces
                            .filter((w: any) => w.active_window_id !== null)
                            .map((w: any) => w.idx);
                        this.occupiedWorkspaces.set(occupied);
                    }

                    if (d.WorkspaceActivated) {
                        const activatedId = d.WorkspaceActivated.id;
                        const activatedWs = this.workspaceMap.get(activatedId);
                        if (activatedWs) {
                            this.focusedWs.set(activatedWs.idx-1);
                        }
                    }

                    if (d.WorkspaceActiveWindowChanged) {
                        const { workspace_id, active_window_id } = d.WorkspaceActiveWindowChanged;
                        const ws = this.workspaceMap.get(workspace_id);
                        if (!ws) return;

                        ws.active_window_id = active_window_id;

                        const newOccupied = new Set(this.occupiedWorkspaces.value);

                        if (active_window_id !== null) {
                            newOccupied.add(ws.idx);
                        } else {
                            newOccupied.delete(ws.idx);
                        }

                        this.occupiedWorkspaces.set([...newOccupied].sort((a, b) => a - b));
                    }

                } catch (e) {
                    console.error("JSON PARSE ERROR: ", e);
                }
            },
            err: (e) => console.error("Process error: ", e),
        });
    }
}

