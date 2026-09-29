-- Versão da sessão: sobe quando a senha muda ou o usuário é desativado,
-- e aí todos os tokens antigos daquele usuário param de valer.
-- Bancos novos já nascem com a coluna (01-schema.sql).
-- Uso: docker exec -i localiza-ae-db psql -U localiza -d localiza_ae < server/scripts/migrations/002-token-version.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 0;
