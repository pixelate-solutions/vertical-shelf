-- The app upserts memberships by user_id, so this must be unique.
create unique index if not exists idx_memberships_user_id_unique
  on memberships(user_id);
