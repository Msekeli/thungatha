"use client";

import { FormControl, MenuItem, Select, Stack } from "@mui/material";
import { JobTypeChips } from "../shared/job-discovery-controls";
import { ArrowDownUp } from "lucide-react";

type Category = { key: string; label: string; count: number | null };
type Props = {
  categories: Category[];
  category: string;
  sortOrder: string;
  onCategoryChange: (key: string, label: string) => void;
  onSortChange: (value: string) => void;
};

export function JobCategoryStrip({
  categories,
  category,
  sortOrder,
  onCategoryChange,
  onSortChange,
}: Props) {
  return (
    <Stack
      direction="row"
      spacing={1}
      role="group"
      aria-label="Opportunity categories"
      sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}
    >
      <JobTypeChips
        activeKey={category === "new" ? "all" : category}
        counts={Object.fromEntries(categories.map((item) => [item.key, item.count]))}
        onSelect={(key, label) => onCategoryChange(key, label)}
      />
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ ml: "auto", alignItems: "center" }}
      >
        <ArrowDownUp size={15} aria-hidden="true" />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            aria-label="Sort jobs"
            value={sortOrder}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <MenuItem value="newest">Sort: Newest</MenuItem>
            <MenuItem value="oldest">Sort: Oldest</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}
