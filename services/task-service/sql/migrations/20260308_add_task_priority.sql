BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
  END IF;
END$$;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS priority task_priority;

ALTER TABLE tasks
  ALTER COLUMN priority SET DEFAULT 'MEDIUM';

UPDATE tasks
SET priority = 'MEDIUM'
WHERE priority IS NULL;

ALTER TABLE tasks
  ALTER COLUMN priority SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_org_priority ON tasks(org_id, priority);

COMMIT;
