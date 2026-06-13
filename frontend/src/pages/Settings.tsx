import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import UpdateProfile from "../components/Settings/UpdateProfile";
import Themes from "../components/Settings/Themes";
import Logout from "../components/Settings/Logout";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full rounded-xl flex flex-col justify-start items-center p-1 sm:p-5.5">
      <div className="flex flex-col justify-start items-center gap-4.5 max-w-[1444px] w-full h-full sm:bg-secondary px-3.5 py-4 rounded-md">
        <div className="w-full h-auto flex justify-start items-center">
          <button
            className="duration-150 transition-all cursor-pointer text-label-text hover:text-label-brighter-text"
            onClick={() => navigate("/")}
          >
            <X />
          </button>
        </div>
        <div className="flex flex-col items-center justify-start gap-10.5 w-full sm:w-1/2 h-full overflow-y-auto">
          <UpdateProfile />
          <Themes />
          <Logout />
        </div>
      </div>
    </div>
  );
};

export default Settings;
