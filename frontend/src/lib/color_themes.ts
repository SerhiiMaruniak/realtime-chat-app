export type ThemeType = {
  name: string;
  colors: {
    main: string;
    secondary: string;
  };
};
const themes: readonly ThemeType[] = [
  {
    name: "default",
    colors: {
      main: "#ffffff",
      secondary: "#333333",
    },
  },
  {
    name: "ocean-mist",
    colors: {
      main: "#1f2f3f",
      secondary: "#b7d8e2",
    },
  },
  {
    name: "forest-glow",
    colors: {
      main: "#1f2b24",
      secondary: "#d6f2de",
    },
  },
  {
    name: "rose-quartz",
    colors: {
      main: "#31242b",
      secondary: "#f7d8e5",
    },
  },
  {
    name: "sunset-peach",
    colors: {
      main: "#35271f",
      secondary: "#f8dfd2",
    },
  },
  {
    name: "arctic-blue",
    colors: {
      main: "#1d2933",
      secondary: "#e4f4ff",
    },
  },
  {
    name: "emerald-silk",
    colors: {
      main: "#182520",
      secondary: "#dff8ed",
    },
  },
  {
    name: "mocha-cream",
    colors: {
      main: "#2a221d",
      secondary: "#f5e9df",
    },
  },
  {
    name: "black-white",
    colors: {
      main: "#000000",
      secondary: "#f2f2f2",
    },
  },
  {
    name: "amethyst-dusk",
    colors: {
      main: "#202030",
      secondary: "#bda5ec",
    },
  },
];

export default themes;
