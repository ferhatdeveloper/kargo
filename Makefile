.PHONY: db-up db-down db-reset db-logs db-psql db-seed api-openapi

db-up:
	docker compose up -d

db-down:
	docker compose down

db-reset:
	docker compose down -v
	docker compose up -d

db-logs:
	docker compose logs -f db postgrest

db-psql:
	docker compose exec db psql -U navlun -d navlun

db-seed:
	docker compose exec -T db psql -U navlun -d navlun -f /seed/seed.sql

api-openapi:
	@curl -s http://127.0.0.1:3000/ | head -20
