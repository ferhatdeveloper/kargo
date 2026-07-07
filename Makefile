.PHONY: db-up db-down db-reset db-logs db-psql db-seed api-openapi portal-lint portal-test portal-smoke portal-check prod-up prod-down

db-up:
	docker compose -f docker-compose.dev.yml up -d

db-down:
	docker compose -f docker-compose.dev.yml down

db-reset:
	docker compose -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.dev.yml up -d

db-logs:
	docker compose -f docker-compose.dev.yml logs -f db postgrest

db-psql:
	docker compose -f docker-compose.dev.yml exec db psql -U navlun -d navlun

db-seed:
	docker compose -f docker-compose.dev.yml exec -T db psql -U navlun -d navlun -f /seed/seed.sql

api-openapi:
	@curl -s http://127.0.0.1:3000/ | head -20

prod-up:
	docker compose up -d --build

prod-down:
	docker compose down

portal-lint:
	cd portal && npm run lint

portal-test:
	cd portal && npm run test

portal-smoke:
	cd portal && npm run test:smoke

portal-check: portal-lint portal-test portal-smoke
	cd portal && npm run build
