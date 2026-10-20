export const themeToggleStyles = {
  width: 98,
  height: 44,
  p: "5px",
  overflow: "visible",
  "& .MuiSwitch-switchBase": {
    p: "5px",
    color: "var(--th-success)",
    transitionDuration: "180ms",
  },
  "& .MuiSwitch-switchBase.Mui-checked": {
    transform: "translateX(54px)",
    color: "var(--th-success)",
  },
  "& .MuiSwitch-thumb": {
    width: 32,
    height: 32,
    backgroundColor: "var(--th-success)",
    boxShadow:
      "0 0 0 2px var(--th-line), 0 0 12px color-mix(in srgb, var(--th-success) 55%, transparent)",
  },
  "& .MuiSwitch-track": {
    border: "1px solid var(--th-success)",
    borderRadius: 24,
    opacity: 1,
    backgroundColor: "var(--th-panel)",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "var(--th-panel)",
    opacity: 1,
  },
  "& .th-theme-switch-sun, & .th-theme-switch-moon": {
    display: "grid",
    placeItems: "center",
    width: 28,
    height: 28,
    color: "var(--th-success)",
    fontSize: 25,
    lineHeight: 1,
  },
};
