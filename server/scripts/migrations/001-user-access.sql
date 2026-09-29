-- Pra bancos criados antes do gerenciamento de funcionários.
-- Bancos novos já nascem com essas colunas (01-schema.sql).
-- Uso: docker exec -i localiza-ae-db psql -U localiza -d localiza_ae < server/scripts/migrations/001-user-access.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
