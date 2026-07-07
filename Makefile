.PHONY: db-up db-down db-reset db-logs db-psql db-seed api-openapi portal-lint portal-test portal-smoke portal-check prod-up prod-down

db-up:
	docker compose -f docker-compose.dev.yml up -d

db-down:
	docker compose -f docker-compose.dev.yml down

db-reset:
	docker compose -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.dev.yml up -d

db-logs:
	docker compose -f docker-compose.dev.yml logs -f kargomkapinda_db kargomkapinda_postgrest

db-psql:
	docker compose -f docker-compose.dev.yml exec kargomkapinda_db psql -U kargomkapinda -d kargomkapinda

db-seed:
	docker compose -f docker-compose.dev.yml exec -T kargomkapinda_db psql -U kargomkapinda -d kargomkapinda -f /seed/seed.sql

api-openapi:
	@curl -s http://127.0.0.1:3100/ | head -20

prod-up:
	docker compose -f docker-compose.dokploy.yml up -d --build

prod-down:
	docker compose -f docker-compose.dokploy.yml down

portal-lint:
	cd portal && npm run lint

portal-test:
	cd portal && npm run test

portal-smoke:
	cd portal && POSTGREST_URL=http://127.0.0.1:3100 npm run test:smoke

portal-check: portal-lint portal-test portal-smoke
	cd portal && npm run build
