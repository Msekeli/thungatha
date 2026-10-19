import { AuthenticatedJobSearchToolbar } from "./job-search-toolbar";
import { JobCategoryStrip } from "./job-category-strip";
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
    <>
      <header className="th-jobs-header th-jobs-redesign-header">
        <div>
          <h1>Job Discovery</h1>
          <p className="th-jobs-subtitle">
            Official employer opportunities in Cape Town and surrounding areas
          </p>
        </div>
        <AuthenticatedJobSearchToolbar
          query={draft.query}
          location={draft.location}
          filtersOpen={filtersOpen}
          onQueryChange={onQueryChange}
          onLocationChange={onLocationChange}
          onSubmit={onSubmit}
          onToggleFilters={onToggleFilters}
        />
      </header>
      <JobCategoryStrip
        categories={categories}
        category={category}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
        onCategoryChange={onCategoryChange}
      />
    </>
  );
}
