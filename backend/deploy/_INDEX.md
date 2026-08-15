# Deploy INDEX

## Generator

- [create-step-deployment.sh](create-step-deployment.sh)

## Templates

- [deployment-templates/nginx-setup](deployment-templates/nginx-setup)
- [deployment-templates/ssl-setup](deployment-templates/ssl-setup)
- [deployment-templates/project-files-copy](deployment-templates/project-files-copy)
- [deployment-templates/nodejs-dependencies](deployment-templates/nodejs-dependencies)
- [deployment-templates/database-setup](deployment-templates/database-setup)
- [deployment-templates/pm2-setup](deployment-templates/pm2-setup)
- [deployment-templates/email-service-setup](deployment-templates/email-service-setup)
- [deployment-templates/maintenance-setup](deployment-templates/maintenance-setup)

## Optional Manual Templates

- [deployment-templates/create-user.sh](deployment-templates/create-user.sh)
- [deployment-templates/firewall-cloud.sh](deployment-templates/firewall-cloud.sh)
- [deployment-templates/firewall-selfhosted.sh](deployment-templates/firewall-selfhosted.sh)
- [deployment-templates/transfer-keys.sh](deployment-templates/transfer-keys.sh)

## Recommended Order

1. Build package.
2. Upload package.
3. Run `deploy.sh` for the target environment.
4. Run smoke tests: HTTPS, API, PM2, disk usage.
