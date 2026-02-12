#!/bin/bash
# /opt/nautilus/backup.sh — Cron: 0 3 * * * (her gece 03:00)

BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo "[$(date)] Starting backup..."

# PostgreSQL backup
docker exec nautilus-db pg_dump -U nautilus -Fc nautilus 
  > "${BACKUP_DIR}/db_${DATE}.dump"

# Redis backup
docker exec nautilus-redis redis-cli BGSAVE
docker cp nautilus-redis:/data/dump.rdb "${BACKUP_DIR}/redis_${DATE}.rdb"

# Uploads backup (incremental) - simulated with cp for now as rsync might not be available or paths differ in dev
# In prod: rsync -az --delete /var/lib/docker/volumes/nautilus_uploads/_data/ "${BACKUP_DIR}/uploads/"

# Sıkıştır
gzip "${BACKUP_DIR}/db_${DATE}.dump"
gzip "${BACKUP_DIR}/redis_${DATE}.rdb"

# Eski backup'ları temizle
find "${BACKUP_DIR}" -name "db_*.dump.gz" -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}" -name "redis_*.rdb.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup completed: db_${DATE}, redis_${DATE}"
