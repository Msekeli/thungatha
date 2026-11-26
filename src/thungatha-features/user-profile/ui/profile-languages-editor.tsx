"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileLanguagesEditor({
  languages,
  onChange,
}: {
  languages: string[];
  onChange: (languages: string[]) => void;
}) {
  const [additional, setAdditional] = useState("");
  const homeLanguage = languages[0] || "";
  const additionalLanguages = languages.slice(1);
  const addLanguage = () => {
    const value = additional.trim();
    if (
      value &&
      !languages.some((item) => item.toLowerCase() === value.toLowerCase())
    )
      onChange([...languages, value]);
    setAdditional("");
  };
  return (
    <section className="mt-6 space-y-4 border-t border-border pt-5">
      <div>
        <h3 className="text-base font-semibold">Languages</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell employers which languages you speak. Choose your home language
          first, then add any other languages.
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="home-language" className="text-sm font-medium">
          Home language
        </label>
        <Input
          id="home-language"
          value={homeLanguage}
          onChange={(event) =>
            onChange(
              [event.target.value, ...additionalLanguages].filter(Boolean),
            )
          }
          placeholder="e.g. isiXhosa, isiZulu, English"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Additional languages</label>
        <div className="flex flex-wrap gap-2">
          {additionalLanguages.map((language) => (
            <span
              key={language}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm"
            >
              {language}
              <button
                type="button"
                aria-label={`Remove ${language}`}
                onClick={() =>
                  onChange(
                    [
                      homeLanguage,
                      ...additionalLanguages.filter(
                        (item) => item !== language,
                      ),
                    ].filter(Boolean),
                  )
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            addLanguage();
          }}
        >
          <Input
            value={additional}
            onChange={(event) => setAdditional(event.target.value)}
            placeholder="Add another language"
            aria-label="Add an additional language"
          />
          <Button type="submit" variant="outline" disabled={!additional.trim()}>
            Add
          </Button>
        </form>
      </div>
    </section>
  );
}
