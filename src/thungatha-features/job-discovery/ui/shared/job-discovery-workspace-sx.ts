import type { SxProps, Theme } from "@mui/material/styles";

export function jobDiscoveryWorkspaceSx(
  hasLeadingColumn: boolean,
): SxProps<Theme> {
  return {
    display: "grid",
    gridTemplateColumns: hasLeadingColumn
      ? "minmax(0, 15%) minmax(0, 1fr) minmax(0, 1fr)"
      : "minmax(340px, 0.92fr) minmax(0, 1.08fr)",
    gridTemplateRows: "minmax(0, 1fr)",
    gap: 2.25,
    alignItems: "stretch",
    minHeight: 0,
    height: hasLeadingColumn ? "100%" : undefined,
    maxHeight: hasLeadingColumn ? "100%" : undefined,
    overflow: hasLeadingColumn ? "hidden" : undefined,
    "& > *": { minWidth: 0, minHeight: 0 },
    "& > .th-jobs-results-panel": {
      minHeight: 0,
      height: hasLeadingColumn ? "100%" : undefined,
      maxHeight: hasLeadingColumn ? "100%" : undefined,
      overflowX: "hidden",
      overflowY: "auto",
      overscrollBehaviorY: "contain",
      WebkitOverflowScrolling: "touch",
    },
    "& > .th-jobs-detail-panel": {
      position: hasLeadingColumn ? "static" : undefined,
      minHeight: 0,
      height: hasLeadingColumn ? "100%" : undefined,
      maxHeight: hasLeadingColumn ? "100%" : undefined,
      overflowY: "auto",
      overscrollBehaviorY: "contain",
      WebkitOverflowScrolling: "touch",
    },
    ...(hasLeadingColumn
      ? {
          "@media (max-width: 1199px) and (min-width: 761px)": {
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
            gridTemplateRows: "minmax(0, 1fr) auto",
            "& > aside": {
              gridColumn: "1 / -1",
              gridRow: 2,
              maxHeight: 180,
            },
          },
        }
      : {}),
    "@media (max-width: 1100px) and (min-width: 761px)": {
      gridTemplateColumns: "minmax(280px, 0.9fr) minmax(0, 1.1fr)",
      gap: 1.5,
    },
    "@media (max-width: 760px)": {
      display: hasLeadingColumn ? "flex" : "block",
      flexDirection: hasLeadingColumn ? "column" : undefined,
      height: "auto",
      maxHeight: "none",
      overflow: "visible",
      "& > aside": { order: 3, maxHeight: "none" },
      "& > .th-jobs-results-panel": {
        order: 1,
        minHeight: 0,
        maxHeight: "min(58dvh, 560px)",
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehaviorY: "contain",
        WebkitOverflowScrolling: "touch",
      },
      "& > .th-jobs-detail-panel": {
        order: 2,
        minHeight: 0,
        maxHeight: "min(68dvh, 640px)",
        overflowY: "auto",
        overscrollBehaviorY: "contain",
        WebkitOverflowScrolling: "touch",
      },
    },
  };
}
