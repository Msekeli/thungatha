"use client";

import { useState } from "react";

export function usePublicJobDiscoveryFilters() {
  const [query, setQuery] = useState("");
  // Keep the default visible in the control and applied to the feed query.
  const [location, setLocation] = useState("Cape Town");
  const [typesSelected, setTypesSelected] = useState<string[]>([]);
  const [quickType, setQuickType] = useState("all");
  const [modesSelected, setModesSelected] = useState<string[]>([]);
  const [sort, setSort] = useState("relevant");
  const [experience, setExperience] = useState("any");
  const [publishedWithin, setPublishedWithin] = useState("30d");

  const hasActiveFilters = Boolean(
    query.trim() ||
    location.trim() ||
    typesSelected.length ||
    quickType !== "all" ||
    modesSelected.length ||
    experience !== "any" ||
    publishedWithin !== "30d",
  );
  function clearFilters() {
    setQuery("");
    setTypesSelected([]);
    setQuickType("all");
    setModesSelected([]);
    setExperience("any");
    setPublishedWithin("30d");
    setLocation("Cape Town");
  }

  return {
    query, setQuery, location, setLocation, typesSelected, setTypesSelected,
    quickType, setQuickType, modesSelected, setModesSelected, sort, setSort,
    experience, setExperience, publishedWithin,
    setPublishedWithin, hasActiveFilters, clearFilters,
  };
}
