"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileLanguageAttributesEditor({
  attributes,
  onAttributesChange,
}: {
  attributes: string[];
  onAttributesChange: (items: string[]) => void;
}) {
  const [value, setValue] = useState("");
  const add = () => {
    const clean = value.trim();
    if (
      clean &&
      !attributes.some((item) => item.toLowerCase() === clean.toLowerCase())
    )
      onAttributesChange([...attributes, clean]);
    setValue("");
  };
  return (
    <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <h2 className="text-base font-semibold">Interests and hobbies</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        What do you enjoy doing outside work? Add hobbies, sports, creative
        activities or community interests. This section is optional.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {attributes.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm"
          >
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={() =>
                onAttributesChange(attributes.filter((entry) => entry !== item))
              }
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        {!attributes.length && (
          <p className="text-sm text-muted-foreground">
            No interests or hobbies added.
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
          placeholder="e.g. Reading, football, volunteering"
          aria-label="Add an interest or hobby"
        />
        <Button type="submit" variant="outline" disabled={!value.trim()}>
          Add
        </Button>
      </form>
    </section>
  );
}
