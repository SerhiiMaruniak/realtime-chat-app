import themes from "../../lib/color_themes";

const Themes = () => {
  const handleThemeChange = (theme: string) => {
    localStorage.setItem("color_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };
  return (
    <div className="w-full">
      <h1 className="text-label-text font-semibold text-2xl mb-4.5">Themes:</h1>
      <ul className="grid lg:grid-cols-8 md:grid-cols-4 grid-cols-2 gap-y-5 md:gap-y-10 w-full max-h-[256px] md:max-h-full overflow-y-auto">
        {themes.map((theme, key) => (
          <li
            title={theme.name.replace("-", " ")}
            aria-label={theme.name}
            key={key}
            className="mx-auto aspect-square rounded-full w-full h-full min-w-10 min-h-10 max-w-16 max-h-16 cursor-pointer border-0 border-input-text hover:border-2 transition-normal duration-100"
            style={{
              backgroundImage: `linear-gradient(60deg, ${theme.colors.main}, ${theme.colors.secondary})`,
            }}
            onClick={() => handleThemeChange(theme.name)}
          />
        ))}
      </ul>
    </div>
  );
};

export default Themes;
