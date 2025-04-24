#!/bin/bash

COMMIT_SHA=$(git rev-parse --short HEAD)
echo "Deploying new version $COMMIT_SHA..."

gcloud builds submit ./backend/ \
    --project ai-apps-445910 \
    --region europe-west1 \
    --tag europe-west1-docker.pkg.dev/ai-apps-445910/docu-talk/docu-talk-backend:$COMMIT_SHA

gcloud run deploy docu-talk-backend \
   --project ai-apps-445910 \
   --region europe-west1 \
   --image europe-west1-docker.pkg.dev/ai-apps-445910/docu-talk/docu-talk-backend:$COMMIT_SHA \
   --platform managed \
   --allow-unauthenticated
