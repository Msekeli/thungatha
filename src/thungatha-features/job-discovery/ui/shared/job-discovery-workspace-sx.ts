import type { SxProps, Theme } from "@mui/material/styles";

export function jobDiscoveryWorkspaceSx(
  hasLeadingColumn: boolean,
): SxProps<Theme> {
  return {
    display: "grid",
    gridTemplateColumns: hasLeadingColumn
      ? "minmax(0, 15%) minmax(0, 1fr) minmax(0, 1fr)"
      : "minmax(340px, 0.92fr) minmax(0, 1.08fr)",
    gap: 2.25,
    alignItems: "stretch",
    minHeight: 0,
    height: hasLeadingColumn ? "100%" : undefined,
    overflow: hasLeadingColumn ? "hidden" : undefined,
    "& > *": { minWidth: 0 },
    "& > .th-jobs-results-panel": {
      height: hasLeadingColumn ? "100%" : undefined,
      overflowY: hasLeadingColumn ? "auto" : undefined,
    },
    "& > .th-jobs-detail-panel": {
      position: hasLeadingColumn ? "static" : undefined,
      height: hasLeadingColumn ? "100%" : undefined,
      maxHeight: hasLeadingColumn ? "none" : undefined,
      overflowY: hasLeadingColumn ? "auto" : undefined,
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
      overflow: "visible",
      "& > aside": { order: 3, maxHeight: "none" },
      "& > .th-jobs-results-panel": { order: 1 },
      "& > .th-jobs-detail-panel": { order: 2 },
      "& > .th-jobs-results-panel, & > .th-jobs-detail-panel": {
        height: "auto",
        maxHeight: "none",
        overflow: "visible",
      },
    },
  };
}
