import themes from "../../lib/color_themes";

const Themes = () => {
  const handleThemeChange = (theme: string) => {
    localStorage.setItem("color_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  const renderThemeName = (name: string): string => {
    const nameToRender = name
      .split("-")
      .map((n) => {
        const firstChar = n.charAt(0).toUpperCase();
        return firstChar + n.slice(1);
      })
      .join(" ");

    return nameToRender;
  };

  return (
    <div className="w-full">
      <h1 className="text-label-text font-semibold text-2xl mb-4.5">Themes:</h1>
      <ul className="grid lg:grid-cols-8 md:grid-cols-4 grid-cols-2 gap-x-4 gap-y-5 md:gap-y-10 w-full max-h-[256px] md:max-h-full overflow-y-auto">
        {themes.map((theme, key) => (
          <li
            title={theme.name.replace("-", " ")}
            aria-label={theme.name}
            key={key}
            className="flex flex-col items-center w-full"
            onClick={() => handleThemeChange(theme.name)}
          >
            <div
              className="rounded-full w-full max-w-16 aspect-square shrink-0 cursor-pointer border-0 border-input-text hover:border-2 transition-all duration-100"
              style={{
                backgroundImage: `linear-gradient(60deg, ${theme.colors.main}, ${theme.colors.secondary})`,
              }}
            />
            <p className="text-center text-label-text text-sm break-words w-full">
              {renderThemeName(theme.name)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Themes;
