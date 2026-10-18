"use client";

import { useEffect, type ReactNode } from "react";

type ModalProps = { title: string; description?: string; labelledBy?: string; onClose: () => void; children: ReactNode };

export function Modal({ title, description, labelledBy, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = previousOverflow; };
  }, [onClose]);
  return <div className="th-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="th-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy ?? "th-modal-title"}>
      <header className="th-modal-header"><div><h2 id={labelledBy ?? "th-modal-title"}>{title}</h2>{description && <p className="th-modal-description">{description}</p>}</div><button type="button" className="th-modal-close" aria-label="Close dialog" onClick={onClose}>×</button></header>
      <div className="th-modal-body">{children}</div>
    </section>
  </div>;
}
