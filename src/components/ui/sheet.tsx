import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "./button";

type SheetProps = {
  /** Titre du formulaire (« Après la séance », « Questionnaire du matin »). */
  title: string;
  /** Où revenir en fermant (lien « ✕ Fermer », clic sur le voile). */
  closeHref: string;
  /** Server action du formulaire. */
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  children: ReactNode;
  /** Écran affiché derrière le panneau sur PC (masqué sur téléphone, inerte). */
  background?: ReactNode;
};

/**
 * Formulaire de saisie (DESIGN.md §6, D33) : écran plein sur téléphone, panneau latéral de 480 px sur PC
 * avec un voile sur l'écran d'origine. Bouton primary collé en bas.
 */
export function Sheet({ title, closeHref, action, submitLabel, children, background }: SheetProps) {
  return (
    <>
      {background && (
        <div className="max-lg:hidden" inert>
          {background}
        </div>
      )}
      <div className="fixed inset-0 z-40 flex bg-bg lg:top-(--header-height) lg:bg-transparent">
        <Link href={closeHref} tabIndex={-1} aria-hidden="true" className="absolute inset-0 hidden bg-text/25 lg:block" />
        <form
          action={action}
          aria-labelledby="sheet-title"
          className="relative ml-auto flex h-full w-full flex-col bg-surface lg:w-(--sheet-width) lg:border-l-(length:--border-hairline) lg:border-line lg:shadow-pop"
        >
          <header className="flex h-(--header-height) shrink-0 items-center gap-3 border-b-(length:--border-hairline) border-line px-page-x">
            <Link href={closeHref} className="focus-ring -mx-2 inline-flex min-h-(--touch-min) items-center gap-1.5 rounded-sm px-2 text-label text-accent-ink">
              <span aria-hidden="true">✕</span> Fermer
            </Link>
            <h1 id="sheet-title" className="font-display text-title-sm text-text">
              {title}
            </h1>
          </header>
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-page-x py-6 lg:px-8">{children}</div>
          <div className="shrink-0 border-t-(length:--border-hairline) border-line bg-surface/95 px-page-x py-4 lg:px-8">
            <Button type="submit" className="w-full">
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
