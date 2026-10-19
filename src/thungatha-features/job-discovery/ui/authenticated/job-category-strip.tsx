"use client";

import { ArrowDownUp } from "lucide-react";

type Category = { key: string; label: string; count: number | null };
export function JobCategoryStrip({ categories, category, sortOrder, onCategoryChange, onSortChange }: {
  categories: Category[]; category: string; sortOrder: string;
  onCategoryChange: (key: string, label: string) => void;
  onSortChange: (value: string) => void;
}) {
  return <div className="th-jobs-category-strip" role="group" aria-label="Opportunity categories">
    {categories.map(item => <button key={item.key} type="button"
      data-active={item.key === "all" ? category === "new" : category === category && item.key === category}
      onClick={() => onCategoryChange(item.key, item.label)}>
      {item.label}{item.count !== null && <span>{item.count}</span>}
    </button>)}
    <label className="th-jobs-sort"><ArrowDownUp size={15}/><select aria-label="Sort jobs" value={sortOrder} onChange={event => onSortChange(event.target.value)}>
      <option value="newest">Sort: Newest</option><option value="oldest">Sort: Oldest</option>
    </select></label>
  </div>;
}
