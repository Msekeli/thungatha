import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AuthenticatedJobSearchToolbar } from "./job-search-toolbar";
import { JobCategoryStrip } from "./job-category-strip";
import type { Filters } from "../job-discovery-utils";

type Category = { key: string; label: string; count: number | null };

export function JobDiscoveryHeader({
  draft,
  filtersOpen,
  categories,
  category,
  sortOrder,
  onQueryChange,
  onLocationChange,
  onSubmit,
  onToggleFilters,
  onSortChange,
  onCategoryChange,
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
    <Box component="header" sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 } }}>
      <Typography component="h1" variant="h5" sx={{ fontWeight: 750, mb: 2 }}>
        Job discovery
      </Typography>
      <AuthenticatedJobSearchToolbar
        query={draft.query}
        location={draft.location}
        filtersOpen={filtersOpen}
        onQueryChange={onQueryChange}
        onLocationChange={onLocationChange}
        onSubmit={onSubmit}
        onToggleFilters={onToggleFilters}
      />
      <Box sx={{ pt: 2, pb: 1 }}>
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
