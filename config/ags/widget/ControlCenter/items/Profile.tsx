import ControlCenterButton from "../ControlCenterButton";
import { username } from "../../../service/Profile";
import { bind, execAsync } from "astal";
import icons from "../../../lib/icons";
import Binding from "astal/binding";
import { bash } from "../../../lib/utils";

export default () => {
  const profile = bind(username) as Binding<string | undefined>;

  return (
    <ControlCenterButton
      label={profile || '用户'}
      onClick={() => {
        // execAsync("hyprsysteminfo").catch(err => console.error("执行失败", err));

        bash(`pcmanfm`);
      }}

      // onPrimaryClick={() => exec(["gtk-launch", "kitty", "--hold", "-e", "fastfetch"])}
	 icon={icons.user.avatar} // 使用用户图标
    />
  );
};
