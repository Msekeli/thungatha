"use client";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

export type JobDetailTab = { label: string; value: string };

type JobDetailTabsProps = {
  tabs?: JobDetailTab[];
  value: string;
  onChange: (value: string) => void;
};

const DEFAULT_TABS: JobDetailTab[] = [
  { label: "Job description", value: "description" },
  { label: "Requirements", value: "requirements" },
  { label: "Benefits", value: "benefits" },
  { label: "About the company", value: "company" },
];

export function JobDetailTabs({
  tabs = DEFAULT_TABS, value, onChange,
}: JobDetailTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, nextValue: string) => onChange(nextValue)}
      variant="scrollable"
      scrollButtons="auto"
      aria-label="Job details sections"
    >
      {tabs.map((tab) => (
        <Tab key={tab.value} label={tab.label} value={tab.value} />
      ))}
    </Tabs>
  );
}
