"use client";

import { useState } from "react";

export function usePublicJobDiscoveryFilters() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Cape Town + 50 km");
  const [typesSelected, setTypesSelected] = useState<string[]>([]);
  const [quickType, setQuickType] = useState("all");
  const [modesSelected, setModesSelected] = useState<string[]>([]);
  const [sort, setSort] = useState("relevant");
  const [salary, setSalary] = useState("any");
  const [experience, setExperience] = useState("any");
  const [publishedWithin, setPublishedWithin] = useState("30d");

  const hasActiveFilters = Boolean(
    query.trim() ||
    location !== "Cape Town + 50 km" ||
    typesSelected.length ||
    quickType !== "all" ||
    modesSelected.length ||
    salary !== "any" ||
    experience !== "any" ||
    publishedWithin !== "30d",
  );
  function clearFilters() {
    setQuery("");
    setTypesSelected([]);
    setQuickType("all");
    setModesSelected([]);
    setSalary("any");
    setExperience("any");
    setPublishedWithin("30d");
    setLocation("Cape Town + 50 km");
  }

  return {
    query,
    setQuery,
    location,
    setLocation,
    typesSelected,
    setTypesSelected,
    quickType,
    setQuickType,
    modesSelected,
    setModesSelected,
    sort,
    setSort,
    salary,
    setSalary,
    experience,
    setExperience,
    publishedWithin,
    setPublishedWithin,
    hasActiveFilters,
    clearFilters,
  };
}
