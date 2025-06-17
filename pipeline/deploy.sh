#!/bin/bash
set -e

ARTIFACT_PATH="$1"
WIN_USER="$2"
WIN_PASS="$3"
WIN_HOST="$4"
DEST_PATH="C:/inetpub/wwwroot/kokkonen.pro"

# Remove old files on the Windows server
sshpass -p "$WIN_PASS" ssh -o StrictHostKeyChecking=no "$WIN_USER@$WIN_HOST" \
  "powershell -Command \"Remove-Item -Recurse -Force '$DEST_PATH\\*'\"" || true

# Copy new files to the Windows server
sshpass -p "$WIN_PASS" scp -r -o StrictHostKeyChecking=no $ARTIFACT_PATH $WIN_USER@$WIN_HOST:$DEST_PATH/