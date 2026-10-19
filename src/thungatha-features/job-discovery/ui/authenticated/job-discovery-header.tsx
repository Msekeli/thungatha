import Box from "@mui/material/Box";
import { AuthenticatedJobSearchToolbar } from "./job-search-toolbar";
import { JobCategoryStrip } from "./job-category-strip";
import { JobDiscoveryHeroShell } from "../shared/job-discovery-hero-shell";
import type { Filters } from "../job-discovery-utils";

type Category = { key: string; label: string; count: number | null };

export function JobDiscoveryHeader({
  draft, filtersOpen, categories, category, sortOrder,
  onQueryChange, onLocationChange, onSubmit, onToggleFilters,
  onSortChange, onCategoryChange,
}: {
  draft: Filters;
  filtersOpen: boolean;
  categories: Category[];
  category: string;
  sortOrder: string;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleFilters: () => void;
  onSortChange: (value: string) => void;
  onCategoryChange: (key: string, label: string) => void;
}) {
  return (
    <Box component="header">
      <JobDiscoveryHeroShell
        title={<>Find your next <Box component="span" sx={{ color: "primary.main" }}>opportunity</Box></>}
        description="Explore job opportunities matched to your search. Save roles and manage your applications from one place."
      >
        <AuthenticatedJobSearchToolbar
          query={draft.query}
          location={draft.location}
          filtersOpen={filtersOpen}
          onQueryChange={onQueryChange}
          onLocationChange={onLocationChange}
          onSubmit={onSubmit}
          onToggleFilters={onToggleFilters}
        />
      </JobDiscoveryHeroShell>
      <Box sx={{ px: { xs: 2, md: 4 }, pb: 2 }}>
        <JobCategoryStrip
          categories={categories}
          category={category}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
          onCategoryChange={onCategoryChange}
        />
      </Box>
    </Box>
  );
}
