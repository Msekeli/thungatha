import { useCallback } from "react";
import type { FormEvent, Dispatch, SetStateAction } from "react";
import { EMPTY_FILTERS, type Filters } from "../job-discovery-utils";
import { employmentTypeForJobType } from "../shared/job-type-options";

export function useJobFilterActions(
  draft: Filters,
  setDraft: Dispatch<SetStateAction<Filters>>,
  setFilters: Dispatch<SetStateAction<Filters>>,
  setCategory: Dispatch<SetStateAction<string>>,
  setPage: Dispatch<SetStateAction<number>>,
  setMobileDetail: Dispatch<SetStateAction<boolean>>,
) {
  const resetResultsView = useCallback(() => {
    setPage(1);
    setMobileDetail(false);
  }, [setPage, setMobileDetail]);

  const changeDraft = useCallback(
    (key: keyof Filters, value: string) => {
      setDraft((current) => ({ ...current, [key]: value }));
    },
    [setDraft],
  );

  const applyFilters = useCallback(() => {
    setFilters({ ...draft });
    resetResultsView();
  }, [draft, setFilters, resetResultsView]);

  const submitFilters = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      applyFilters();
    },
    [applyFilters],
  );

  const clearFilters = useCallback(() => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    resetResultsView();
  }, [setDraft, setFilters, resetResultsView]);

  const changeCategory = useCallback(
    (key: string) => {
      if (key === "saved" || key === "dismissed") {
        setCategory(key);
        resetResultsView();
        return;
      }
      const employmentType = employmentTypeForJobType(key);
      setCategory("new");
      setDraft((current) => ({ ...current, employmentType }));
      setFilters((current) => ({ ...current, employmentType }));
      resetResultsView();
    },
    [setCategory, setDraft, setFilters, resetResultsView],
  );

  return {
    changeDraft,
    submitFilters,
    applyFilters,
    clearFilters,
    resetResultsView,
    changeCategory,
  };
}
