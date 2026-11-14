import type { InputHTMLAttributes } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  hint?: string;
  /** Message d'erreur : remplace l'aide, passe le champ en alert et en aria-invalid. */
  error?: string;
};

/** Saisie : label au-dessus, aide en dessous, 16 px minimum (pas de zoom iOS) (DESIGN.md §4). */
export function TextField({ id, label, hint, error, className = "", ...rest }: TextFieldProps) {
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-label text-text-muted">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`focus-ring h-(--control-height) rounded-md border-(length:--border-hairline) bg-surface-raised px-4 text-body text-text placeholder:text-text-muted ${
          error ? "border-alert" : "border-line-strong"
        }`}
        {...rest}
      />
      {message && (
        <p id={messageId} className={`text-caption ${error ? "text-alert" : "text-text-muted"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
