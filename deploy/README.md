# Deploy README

This folder contains the deployment generator for the VPS.

## Purpose

- Builds a transportable deployment package.
- Generates a `deploy.sh` script that executes modular setup steps.
- Uses templates from [deploy/deployment-templates](deploy/deployment-templates).

## Quick Start

1. Build the package: `./deploy/create-step-deployment.sh`
2. Copy the archive to the server.
3. Extract it and run `sudo ./deploy.sh prod|feat|stage|all`.

## Key Files

- [deploy/create-step-deployment.sh](deploy/create-step-deployment.sh): Generator for the package and `deploy.sh`.
- [deploy/deployment-templates](deploy/deployment-templates): Modular deployment steps.
- [deploy/INDEX.md](deploy/INDEX.md): Quick overview of all templates.

## Note

New templates are automatically included when building the package. Always build a new package after changes so updates are included on the target server.
