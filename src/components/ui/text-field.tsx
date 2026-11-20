import type { InputHTMLAttributes } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  hint?: string;
  /** Message d'erreur : remplace l'aide, passe le champ en alert et en aria-invalid. */
  error?: string;
  /** Zone de texte sur plusieurs lignes (commentaire), au lieu d'un champ d'une ligne. */
  multiline?: boolean;
  rows?: number;
};

const FIELD =
  "focus-ring min-h-(--control-height) w-full rounded-md border-(length:--border-hairline) bg-surface-raised px-4 py-3 text-body text-text placeholder:text-text-subtle disabled:cursor-not-allowed disabled:text-text-subtle";

/** Saisie : label au-dessus, aide dessous, 16 px minimum ; pleine largeur sur téléphone, 480 px max sur PC (DESIGN.md §5). */
export function TextField({ id, label, hint, error, multiline = false, rows = 4, className = "", ...rest }: TextFieldProps) {
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className={`flex w-full flex-col gap-2 lg:max-w-(--sheet-width) ${className}`}>
      <label htmlFor={id} className="text-label text-text">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={rest.name}
          defaultValue={rest.defaultValue as string | undefined}
          placeholder={rest.placeholder}
          maxLength={rest.maxLength}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={`${FIELD} ${error ? "border-alert" : "border-line-strong"}`}
        />
      ) : (
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={`${FIELD} ${error ? "border-alert" : "border-line-strong"}`}
          {...rest}
        />
      )}
      {message && (
        <p id={messageId} className={`text-caption ${error ? "text-alert" : "text-text-muted"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
