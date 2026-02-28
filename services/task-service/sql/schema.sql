BEGIN;

-- TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

CREATE INDEX IF NOT EXISTS idx_teams_org_id ON teams(org_id);

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  team_id    uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- TASK ENUMS (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_visibility') THEN
    CREATE TYPE task_visibility AS ENUM ('TEAM_ONLY', 'ORG_VISIBLE', 'PRIVATE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('TODO', 'DOING', 'DONE');
  END IF;
END$$;

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  team_id             uuid NULL REFERENCES teams(id) ON DELETE SET NULL,

  created_by          uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to_user_id uuid NULL REFERENCES users(id) ON DELETE SET NULL,

  visibility          task_visibility NOT NULL DEFAULT 'ORG_VISIBLE',
  status              task_status NOT NULL DEFAULT 'TODO',

  title               text NOT NULL,
  description         text NULL,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  -- TEAM_ONLY must have a team_id
  CONSTRAINT chk_team_only_requires_team
    CHECK (visibility <> 'TEAM_ONLY' OR team_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_team_id ON tasks(org_id, team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_assignee ON tasks(org_id, assigned_to_user_id);

COMMIT;