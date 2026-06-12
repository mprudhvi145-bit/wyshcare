# Backup and Recovery Plan

## Overview

This document defines the disaster recovery (DR) strategy for WyshCare, covering database (Supabase PostgreSQL), file storage (S3-compatible), and application configuration.

## Recovery Objectives

| Metric | Target |
|---|---|
| **RTO** (Recovery Time Objective) | 4 hours |
| **RPO** (Recovery Point Objective) | 1 hour |

### What This Means

- In the event of total system failure, WyshCare must be fully operational within **4 hours**.
- Maximum acceptable data loss is **1 hour** of transactions.

## Supabase PostgreSQL Backup

### Strategy: Daily pg_dump + WAL Archiving

| Backup Type | Frequency | Retention | Storage |
|---|---|---|---|
| Full database dump (pg_dump) | Daily at 02:00 UTC | 30 days | S3 bucket |
| WAL archive (continuous) | Every 5 minutes | 24 hours | S3 bucket |
| Monthly snapshot | 1st of each month | 12 months | S3 Glacier |

### Daily pg_dump Command

```bash
pg_dump \
  --host=$SUPABASE_DB_HOST \
  --port=5432 \
  --username=$SUPABASE_DB_USER \
  --dbname=$SUPABASE_DB_NAME \
  --format=custom \
  --no-owner \
  --compress=9 \
  --file=wyshcare_$(date +%Y-%m-%d).dump
```

### Upload to S3

```bash
aws s3 cp wyshcare_$(date +%Y-%m-%d).dump \
  s3://wyshcare-backups/postgres/daily/
```

### WAL Archiving (Point-in-Time Recovery)

Configure `archive_command` in Supabase:

```sql
ALTER SYSTEM SET archive_command = 'aws s3 cp %p s3://wyshcare-backups/postgres/wal/%f';
ALTER SYSTEM SET archive_mode = 'on';
```

## Storage Backup (S3-Compatible)

### What Is Backed Up

| Asset | Source | Backup Strategy |
|---|---|---|
| Health records (vault uploads) | S3: wyshcare-health-records | Cross-region replication |
| Diagnostic reports | S3: wyshcare-diagnostics | Cross-region replication |
| User avatars/clinic branding | S3: wyshcare-assets | Daily sync to DR region |
| Prescription PDFs | Generated on-demand | Not stored (regenerated from DB) |

### Cross-Region Replication

```json
{
  "ReplicationConfiguration": {
    "Role": "arn:aws:iam::ACCOUNT:role/s3-replication",
    "Rules": [{
      "Status": "Enabled",
      "Destination": {
        "Bucket": "arn:aws:s3:::wyshcare-backups-us-west-2"
      }
    }]
  }
}
```

### Retention Policy

| Tier | Retention | Deletion |
|---|---|---|
| Hot (primary region) | 90 days | Lifecycle policy |
| Warm (DR region) | 365 days | Lifecycle policy |
| Cold (Glacier) | 7 years | Compliance requirement |

## Restore Procedure

### Full Restore Runbook

**RTO Target: 4 hours**

| Step | Action | Estimated Time |
|---|---|---|
| 1 | Declare disaster, notify on-call | 15 min |
| 2 | Provision new Supabase project | 30 min |
| 3 | Download latest backup from S3 | 15 min |
| 4 | Restore PostgreSQL dump | 30 min |
| 5 | Replay WAL for point-in-time recovery | 30 min |
| 6 | Verify data integrity (row counts) | 15 min |
| 7 | Update DATABASE_URL in secrets manager | 15 min |
| 8 | Restart backend services | 10 min |
| 9 | Run health checks | 15 min |
| 10 | Verify all endpoints functional | 45 min |

### Restore Commands

```bash
# Step 3: Download latest backup
aws s3 cp s3://wyshcare-backups/postgres/daily/$(LATEST) ./restore.dump

# Step 4: Restore database
pg_restore \
  --host=$NEW_SUPABASE_HOST \
  --port=5432 \
  --username=$NEW_SUPABASE_USER \
  --dbname=$NEW_SUPABASE_DB \
  --no-owner \
  --jobs=4 \
  restore.dump

# Step 5: Point-in-time recovery (if needed)
# Apply WAL files from S3 to bring DB to specific timestamp
```

### S3 Restore

```bash
# Replicate from DR region back to primary
aws s3 sync \
  s3://wyshcare-backups-us-west-2/health-records/ \
  s3://wyshcare-health-records/ \
  --source-region us-west-2 \
  --region us-east-1
```

## DR Testing Schedule

| Test Type | Frequency | Scope | Success Criteria |
|---|---|---|---|
| Backup integrity check | Daily | Verify backup files exist and are non-empty | All expected files present |
| Restore dry run | Monthly | Full restore to staging environment | RTO < 4h, RPO < 1h |
| Failover test | Quarterly | Simulate primary region failure | All traffic served from DR |
| Tabletop exercise | Biannual | Walk through runbook with team | No ambiguity in steps |
| Full DR drill | Annual | Complete failover + restore | Business sign-off |

### Backup Integrity Check Script

```bash
#!/bin/bash
# Run daily via cron
BACKUP_FILE=$(aws s3 ls s3://wyshcare-backups/postgres/daily/ | sort -r | head -1 | awk '{print $4}')
SIZE=$(aws s3 ls s3://wyshcare-backups/postgres/daily/$BACKUP_FILE | awk '{print $3}')

if [ $SIZE -lt 1000000 ]; then
  echo "ERROR: Backup file suspiciously small: $SIZE bytes"
  exit 1
fi

# Verify dump integrity
pg_restore --list $BACKUP_FILE > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "ERROR: Backup file corrupt"
  exit 1
fi

echo "OK: Backup $BACKUP_FILE verified ($SIZE bytes)"
```

## Monitoring & Alerting

| Alert | Trigger | Notification |
|---|---|---|
| Backup failure | Daily backup job fails | PagerDuty critical |
| Backup size anomaly | Size drops >50% vs 7-day avg | Slack alert |
| DR test failure | Monthly restore test fails | Email to CTO |
| S3 replication delay | Lag > 1 hour | Slack alert |
| WAL archiving failure | No WAL file in 15 min | PagerDuty critical |

## Compliance Notes

- **HIPAA**: Backups must be encrypted at rest (AES-256). Access logged.
- **ABDM**: Health data backups must be stored in India region (ap-south-1).
- **GDPR**: User data deletion requests must also purge backups (within 30 days).
- **SOX**: Backup logs retained for 7 years.

## Responsibilities

| Role | Responsibility |
|---|---|
| DevOps Engineer | Maintain backup scripts, S3 lifecycle, DR infrastructure |
| Backend Lead | Verify restore procedure, test data integrity |
| CTO | Approve DR test schedule, sign off on drills |
| Security Officer | Audit backup encryption, access logs |
