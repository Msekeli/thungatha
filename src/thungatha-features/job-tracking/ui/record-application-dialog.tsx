"use client";

import { useState, type FormEvent } from "react";
import { ClipboardPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";

type Props = { open: boolean; onClose: () => void };

export function RecordApplicationDialog({ open, onClose }: Props) {
  const [notice, setNotice] = useState(false);
  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(true);
  }

  return (
    <Modal title="Record an application" description="Add the details of an opportunity you have applied for." onClose={onClose}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">Company / employer <span className="text-destructive">*</span>
            <Input required placeholder="e.g. Acme Technologies" />
          </label>
          <label className="space-y-1.5 text-sm font-medium">Job title <span className="text-destructive">*</span>
            <Input required placeholder="e.g. Frontend Developer" />
          </label>
          <label className="space-y-1.5 text-sm font-medium">Application date
            <Input type="date" />
          </label>
          <label className="space-y-1.5 text-sm font-medium">Where did you apply?
            <NativeSelect defaultValue="">
              <option value="" disabled>Select a source</option>
              <option>Company website</option><option>LinkedIn</option><option>Recruitment agency</option><option>Thungatha</option><option>Other</option>
            </NativeSelect>
          </label>
        </div>
        <label className="block space-y-1.5 text-sm font-medium">Application link <span className="font-normal text-muted-foreground">(optional)</span>
          <Input type="url" placeholder="https://..." />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">Job description <span className="font-normal text-muted-foreground">(optional)</span>
          <Textarea rows={5} placeholder="Paste the job advert here to keep the role details with your application." />
        </label>
        {notice && <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">This is the UI-only preview. Application saving will be connected after the data model is agreed. Nothing has been saved.</p>}
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">You will confirm submission separately.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit"><ClipboardPlus data-icon="inline-start" />Preview form</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
