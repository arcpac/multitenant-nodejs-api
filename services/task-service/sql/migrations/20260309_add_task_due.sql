BEGIN;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS due_date date;

ALTER TABLE tasks
  ALTER COLUMN due_date SET DEFAULT NULL;


CREATE INDEX IF NOT EXISTS idx_tasks_org_due_date
  ON tasks(org_id, due_date);
  
COMMIT;
