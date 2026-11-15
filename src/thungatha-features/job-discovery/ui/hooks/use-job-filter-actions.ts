import { useCallback, useEffect, useRef } from "react";
import type { FormEvent, Dispatch, SetStateAction } from "react";
import { EMPTY_FILTERS, type Filters } from "../job-discovery-utils";

export function useJobFilterActions(
  draft: Filters,
  setDraft: Dispatch<SetStateAction<Filters>>,
  setFilters: Dispatch<SetStateAction<Filters>>,
  setCategory: Dispatch<SetStateAction<string>>,
  setPage: Dispatch<SetStateAction<number>>,
  setMobileDetail: Dispatch<SetStateAction<boolean>>,
) {
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    },
    [],
  );

  const resetResultsView = useCallback(() => {
    setPage(1);
    setMobileDetail(false);
  }, [setPage, setMobileDetail]);

  const changeDraft = useCallback(
    (key: keyof Filters, value: string) => {
      setDraft((current) => ({ ...current, [key]: value }));
      if (key === "query") {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
          setFilters((current) => ({ ...current, query: value }));
          setPage(1);
          setMobileDetail(false);
        }, 350);
      }
    },
    [setDraft, setFilters, setPage, setMobileDetail],
  );

  const applyFilters = useCallback(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
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
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    resetResultsView();
  }, [setDraft, setFilters, resetResultsView]);

  const changeCategory = useCallback(
    (key: string) => {
      setCategory(key === "saved" || key === "dismissed" ? key : "new");
      resetResultsView();
    },
    [setCategory, resetResultsView],
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
