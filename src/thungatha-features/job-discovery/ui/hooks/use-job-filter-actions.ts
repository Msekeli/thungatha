import { useCallback } from "react";
import type { FormEvent, Dispatch, SetStateAction } from "react";
import { EMPTY_FILTERS, type Filters } from "../job-discovery-utils";

export function useJobFilterActions(
  draft: Filters,
  setDraft: Dispatch<SetStateAction<Filters>>,
  setFilters: Dispatch<SetStateAction<Filters>>,
  setPage: Dispatch<SetStateAction<number>>,
  setMobileDetail: Dispatch<SetStateAction<boolean>>,
) {
  const changeDraft = useCallback(
    (key: keyof Filters, value: string) => {
      setDraft((current) => ({ ...current, [key]: value }));
    },
    [setDraft],
  );

  const submitFilters = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFilters({ ...draft });
      setPage(1);
      setMobileDetail(false);
    },
    [draft, setFilters, setPage, setMobileDetail],
  );

  const clearFilters = useCallback(() => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setMobileDetail(false);
  }, [setDraft, setFilters, setPage, setMobileDetail]);

  return { changeDraft, submitFilters, clearFilters };
}
