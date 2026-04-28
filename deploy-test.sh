#!/bin/bash

set -e

IMAGE_NAME="scrape-workflow"
IMAGE_TAG="test"
DOCKERFILE="Dockerfile"
OUTPUT_DIR="${HOME}/scrape-workflow"

MAIN_SERVER="root@exporteru.com"
REMOTE_WORK_DIR="/root/exporteru"

mkdir -p "$OUTPUT_DIR"

echo "=== Сборка и загрузка Next.js приложения ==="

docker rmi "${IMAGE_NAME}:${IMAGE_TAG}" 2>/dev/null || true

# Сборка из текущего корня (.)
docker build . -t "${IMAGE_NAME}:${IMAGE_TAG}" -f "${DOCKERFILE}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TAR_FILE="${OUTPUT_DIR}/${IMAGE_NAME}-${IMAGE_TAG}-${TIMESTAMP}.tar"
docker save -o "$TAR_FILE" "${IMAGE_NAME}:${IMAGE_TAG}"

ARCHIVE_FILE="${TAR_FILE}.gz"
gzip -c "$TAR_FILE" > "$ARCHIVE_FILE"

scp "$ARCHIVE_FILE" "$MAIN_SERVER:${REMOTE_WORK_DIR}/"

ssh "$MAIN_SERVER" bash << EOF
  set -e
  cd ${REMOTE_WORK_DIR}

  gunzip -c $(basename "$ARCHIVE_FILE") | docker load

  docker compose up -d --no-deps --no-build parser

  rm -f $(basename "$ARCHIVE_FILE")
EOF

rm -f "$TAR_FILE" "$ARCHIVE_FILE"

echo "=== Готово! ==="