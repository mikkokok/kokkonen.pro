#!/bin/bash
set -e

ARTIFACT_PATH="$1"
WIN_USER="$2"
WIN_PASS="$3"
WIN_HOST="$4"
DEST_PATH="C:/inetpub/wwwroot/kokkonen.pro"

echo "Deploying artifacts to Windows server..."
echo "Removing previous files from $DEST_PATH on $WIN_HOST"
# Remove old files on the Windows server
sshpass -p "$WIN_PASS" ssh -o StrictHostKeyChecking=no "$WIN_USER@$WIN_HOST" \
  "powershell -Command \"Remove-Item -Recurse -Force '$DEST_PATH\\*'\"" || true

echo "Copying new files to $DEST_PATH on $WIN_HOST"
# Copy new files to the Windows server
sshpass -p "$WIN_PASS" scp -r -o StrictHostKeyChecking=no $ARTIFACT_PATH "$WIN_USER@$WIN_HOST:\"$DEST_PATH/\""