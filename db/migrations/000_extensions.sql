-- Extensions ve temel şemalar
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE SCHEMA IF NOT EXISTS app;
COMMENT ON SCHEMA app IS 'Uygulama tabloları (PostgREST public ile aynı — public kullanılıyor)';

CREATE SCHEMA IF NOT EXISTS audit;
COMMENT ON SCHEMA audit IS 'Denetim / log tabloları';
