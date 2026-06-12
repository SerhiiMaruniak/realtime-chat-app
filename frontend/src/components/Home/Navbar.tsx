import { useContext } from "react";
import { HomeContext, type HomeContextValue } from "../../context/HomeContext";

const Navbar = () => {
  const homeContext = useContext(HomeContext);

  const handleChangePage = (str: HomeContextValue) => {
    homeContext?.setHomeContextValue(str);
  };

  return (
    <div className="flex justify-start items-center w-full bg-secondary_dark border-b border-spec-1-dark px-3 py-1">
      <ul className="flex justify-center sm:justify-start items-center gap-2.5 sm:gap-4 w-full">
        <li
          onClick={() => handleChangePage("All_Friends")}
          className="cursor-pointer text-label-text text-sm hover:bg-spec-1-dark/65 px-1 sm:px-3 py-1 rounded-xs transition-all ease-in-out duration-200"
          style={{
            backgroundColor:
              homeContext?.value === "All_Friends"
                ? "color-mix(in oklab, var(--color-spec-1-dark) 65%, transparent)"
                : "",
          }}
        >
          All Friends
        </li>
        <li
          onClick={() => handleChangePage("Requests")}
          className="cursor-pointer text-label-text text-sm hover:bg-spec-1-dark/65 px-1 sm:px-3 py-1 rounded-xs transition-all ease-in-out duration-200"
          style={{
            backgroundColor:
              homeContext?.value === "Requests"
                ? "color-mix(in oklab, var(--color-spec-1-dark) 65%, transparent)"
                : "",
          }}
        >
          Requests
        </li>
        <li
          onClick={() => handleChangePage("Add_Friends")}
          className="cursor-pointer text-main_dark text-sm bg-label-text/75 hover:bg-spec-1-dark/75 hover:text-label-text px-2 sm:px-3 py-1 rounded-xs transition-all ease-in-out duration-200"
          style={{
            backgroundColor:
              homeContext?.value === "Add_Friends"
                ? "color-mix(in oklab, var(--color-spec-1-dark) 75%, transparent)"
                : "",
            color: homeContext?.value === "Add_Friends" ? "var(--color-label-text)" : "",
          }}
        >
          Add Friends
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
