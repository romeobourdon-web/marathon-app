-- P2-M6 (D33) : douleur au tendon d'Achille (1-5), notée après chaque séance et chaque matin.
-- journal_entry : nouvelle colonne pain.
alter table public.journal_entry
  add column pain smallint check (pain between 1 and 5);

-- daily_checkin : soreness était déjà la douleur → renommée pain (les données suivent le renommage) ;
-- pain_note sert de note libre du questionnaire → renommée note.
alter table public.daily_checkin rename column soreness to pain;
alter table public.daily_checkin rename column pain_note to note;
