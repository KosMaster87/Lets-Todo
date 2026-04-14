# Deploy INDEX

## Generator

- [deploy/create-step-deployment.sh](deploy/create-step-deployment.sh)

## Templates

- [deploy/deployment-templates/nginx-setup](deploy/deployment-templates/nginx-setup)
- [deploy/deployment-templates/ssl-setup](deploy/deployment-templates/ssl-setup)
- [deploy/deployment-templates/project-files-copy](deploy/deployment-templates/project-files-copy)
- [deploy/deployment-templates/nodejs-dependencies](deploy/deployment-templates/nodejs-dependencies)
- [deploy/deployment-templates/database-setup](deploy/deployment-templates/database-setup)
- [deploy/deployment-templates/pm2-setup](deploy/deployment-templates/pm2-setup)
- [deploy/deployment-templates/email-service-setup](deploy/deployment-templates/email-service-setup)
- [deploy/deployment-templates/maintenance-setup](deploy/deployment-templates/maintenance-setup)

## Optional Manual Templates

- [deploy/deployment-templates/create-user.sh](deploy/deployment-templates/create-user.sh)
- [deploy/deployment-templates/firewall-cloud.sh](deploy/deployment-templates/firewall-cloud.sh)
- [deploy/deployment-templates/firewall-selfhosted.sh](deploy/deployment-templates/firewall-selfhosted.sh)
- [deploy/deployment-templates/transfer-keys.sh](deploy/deployment-templates/transfer-keys.sh)

## Recommended Order

1. Build package.
2. Upload package.
3. Run `deploy.sh` for the target environment.
4. Run smoke tests: HTTPS, API, PM2, disk usage.
