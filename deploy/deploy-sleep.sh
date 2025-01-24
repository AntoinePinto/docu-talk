#!/bin/bash

COMMIT_SHA=$(git rev-parse --short HEAD)
echo "Deploying new version $COMMIT_SHA..."

gcloud builds submit \
  --project ai-apps-445910 \
  --region europe-west1 \
  --config deploy/sleep/cloudbuild.yaml \
  --substitutions=COMMIT_SHA="$COMMIT_SHA"