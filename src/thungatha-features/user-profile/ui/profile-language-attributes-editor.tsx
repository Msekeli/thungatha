"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ProfileLanguageAttributesEditor({
  languages,
  attributes,
  onLanguagesChange,
  onAttributesChange,
}: {
  languages: string[];
  attributes: string[];
  onLanguagesChange: (items: string[]) => void;
  onAttributesChange: (items: string[]) => void;
}) {
  const [language, setLanguage] = useState("");
  const [attribute, setAttribute] = useState("");
  const add = (
    value: string,
    items: string[],
    update: (items: string[]) => void,
    clear: () => void,
  ) => {
    const clean = value.trim();
    if (
      clean &&
      !items.some((item) => item.toLowerCase() === clean.toLowerCase())
    )
      update([...items, clean]);
    clear();
  };
  const list = (
    title: string,
    items: string[],
    value: string,
    setValue: (value: string) => void,
    update: (items: string[]) => void,
  ) => (
    <section className="rounded-xl border border-line bg-panel p-5">
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-full bg-panel-2 px-3 py-1 text-xs text-fg"
          >
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={() => update(items.filter((entry) => entry !== item))}
              className="text-fg-muted hover:text-warn"
            >
              ×
            </button>
          </span>
        ))}
        {!items.length && (
          <p className="text-xs text-fg-muted">
            Optional — add only what applies to you.
          </p>
        )}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          add(value, items, update, () => setValue(""));
        }}
      >
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-fg"
          placeholder={
            title === "Languages" ? "Add a language" : "Add an attribute"
          }
          aria-label={`Add ${title.toLowerCase()}`}
        />
        <Button type="submit" variant="secondary" size="sm">
          Add
        </Button>
      </form>
    </section>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {list("Languages", languages, language, setLanguage, onLanguagesChange)}
      {list(
        "Personal attributes",
        attributes,
        attribute,
        setAttribute,
        onAttributesChange,
      )}
    </div>
  );
}
