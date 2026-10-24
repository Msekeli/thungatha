"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
function TagList({
  title,
  items,
  onChange,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [value, setValue] = useState("");
  const add = () => {
    const clean = value.trim();
    if (
      clean &&
      !items.some((item) => item.toLowerCase() === clean.toLowerCase())
    )
      onChange([...items, clean]);
    setValue("");
  };
  return (
    <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm"
          >
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={() => onChange(items.filter((entry) => entry !== item))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        {!items.length && (
          <p className="text-sm text-muted-foreground">
            Optional — add only what applies to you.
          </p>
        )}
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={
            title === "Languages" ? "Add a language" : "Add an attribute"
          }
          aria-label={`Add ${title.toLowerCase()}`}
        />
        <Button type="submit" variant="outline" disabled={!value.trim()}>
          Add
        </Button>
      </form>
    </section>
  );
}
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
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TagList
        title="Languages"
        items={languages}
        onChange={onLanguagesChange}
      />
      <TagList
        title="Personal attributes"
        items={attributes}
        onChange={onAttributesChange}
      />
    </div>
  );
}
