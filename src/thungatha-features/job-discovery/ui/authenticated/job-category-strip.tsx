"use client";

import { ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type Category = { key: string; label: string; count: number | null };
export function JobCategoryStrip({ categories, category, sortOrder, onCategoryChange, onSortChange }: {
  categories: Category[]; category: string; sortOrder: string;
  onCategoryChange: (key: string, label: string) => void;
  onSortChange: (value: string) => void;
}) {
  return <div className="th-jobs-category-strip" role="group" aria-label="Opportunity categories">
    {categories.map(item => <Button key={item.key} variant="ghost" size="sm" className="th-jobs-category-button" data-active={item.key === "all" ? category === "new" : category === item.key}
      onClick={() => onCategoryChange(item.key, item.label)}>
      {item.label}{item.count !== null && <span>{item.count}</span>}
    </Button>)}
    <label className="th-jobs-sort"><ArrowDownUp size={15}/><select aria-label="Sort jobs" value={sortOrder} onChange={event => onSortChange(event.target.value)}>
      <option value="newest">Sort: Newest</option><option value="oldest">Sort: Oldest</option>
    </select></label>
  </div>;
}
