# WyshCare Monitoring Stack

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  WyshCare   │────▶│  Prometheus  │◀────│  Grafana    │
│  API        │     │  :9090       │     │  :3001      │
│  :30013     │     └──────┬───────┘     └─────────────┘
└─────────────┘            │
                           │
                    ┌──────▼───────┐
                    │ Alertmanager │
                    │  :9093       │
                    └──────────────┘
```

## Deploy

```bash
# Start the full stack (app + monitoring)
docker compose -f docker-compose.yml -f infra/monitoring/docker-compose.monitoring.yml up -d

# View logs
docker compose -f infra/monitoring/docker-compose.monitoring.yml logs -f

# Stop monitoring only
docker compose -f infra/monitoring/docker-compose.monitoring.yml down
```

## Access

| Service      | URL                     | Credentials       |
|-------------|-------------------------|-------------------|
| Prometheus  | http://localhost:9090    | —                 |
| Grafana     | http://localhost:3001    | admin / admin     |
| Alertmanager| http://localhost:9093    | —                 |

## Metrics Available

- `wyshcare_http_requests_total` — Total HTTP requests
- `wyshcare_http_request_errors_total` — Total HTTP errors
- `wyshcare_http_request_duration_seconds` — Request latency histogram
- `wyshcare_health_checks_total` — Health check results (postgres, redis)
- `wyshcare_build_info` — Build version info

## Alerts

| Alert                 | Severity | Condition                                |
|----------------------|----------|------------------------------------------|
| HighErrorRate        | Critical | Error rate > 5% over 5 min               |
| HighRequestLatency   | Warning  | P95 latency > 2s over 5 min              |
| ServiceDown          | Critical | API unreachable for 1 min                |
| DatabaseDown         | Critical | PostgreSQL health check failing          |
| RedisDown            | Critical | Redis health check failing               |

## Configure Slack

Edit `infra/monitoring/alertmanager/alertmanager.yml` and replace `your-slack-webhook` with your actual Slack webhook URL.
