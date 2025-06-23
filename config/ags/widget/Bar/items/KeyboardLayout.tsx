import { Gtk } from "astal/gtk3";
import BarButton from "../BarButton";
import BarItem from "../BarItem";
import { subprocess, Variable, bind } from 'astal'



const currentLayout = Variable("en");

function getLayout(layoutIndex: number) {
	if(layoutIndex == 0) { 
		currentLayout.set("us")
       	}
	else if(layoutIndex == 1) { 
		currentLayout.set("ru")
       	}
	else { 
		currentLayout.set("?") 
	}

}



subprocess({
  cmd: ["/home/roblox/.config/ags/scripts/eventStream.sh"],
  out: (line: string) => {
    try {
      const data = JSON.parse(line);
      if (data.KeyboardLayoutSwitched) {
        const idx = data.KeyboardLayoutSwitched.idx;
	getLayout(idx)
      }
    } catch (e) {
      console.error("Ошибка при разборе JSON:", e);
    }
  },
  err: (err) => console.error("Ошибка процесса:", err),
});

export default () => {

	return (
		<BarItem className="bar__keyboard-layout">
		<label
        halign={Gtk.Align.CENTER}
        hexpand
        label={bind(currentLayout)}
      />
      </BarItem>
	);
};
