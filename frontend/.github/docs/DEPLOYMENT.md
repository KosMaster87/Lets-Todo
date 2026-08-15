# Let's Todo App - Frontend Deployment Guide

## Overview

This document provides comprehensive deployment instructions for the Let's Todo App frontend, covering both development and production environments.

## Architecture

- **Framework**: Vanilla JavaScript ES6+ Modules
- **Server**: Express.js Development Server
- **Build System**: No build step required (direct ES modules)
- **Live Reload**: Integrated development workflow
- **Routing**: SPA with client-side routing fallback

## Dependencies

### Production Dependencies

```json
{
  "express": "^4.18.2"
}
```

### Development Dependencies

```json
{
  "concurrently": "^9.1.2",
  "connect-livereload": "^0.6.1",
  "livereload": "^0.9.3",
  "nodemon": "^3.1.10"
}
```

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Git

### Installation Steps

1. **Clone Repository**

   ```bash
   git clone https://github.com/KosMaster87/Lets-Todo.git
   cd lets-todo/frontend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Setup

### Development Server (`dev-server.js`)

The development server provides:

- **Static File Serving**: Serves all frontend assets
- **SPA Routing**: Fallback to `index.html` for client-side routes
- **LiveReload Integration**: Automatic browser refresh on file changes
- **Port Management**: Automatic port detection (default: 5500)
- **Cookie Compatibility**: Binds to `127.0.0.1` for backend integration

### Available Scripts

| Script               | Command                                                                      | Description                                  |
| -------------------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| `npm run dev`        | `concurrently -n SERVER,RELOAD "nodemon dev-server.js" "npm run livereload"` | Full development environment with hot reload |
| `npm run start`      | `node dev-server.js`                                                         | Start server without live reload             |
| `npm run watch`      | `nodemon dev-server.js --watch src --watch assets/styles`                    | Server with file watching                    |
| `npm run livereload` | `livereload . --wait 500 --debug --extraExts js,css,html`                    | LiveReload service only                      |
| `npm run docs`       | `jsdoc -c jsdoc.json`                                                        | Generate JSDoc documentation                 |

### Development Workflow

1. **Start Development Environment**

   ```bash
   npm run dev
   ```

2. **Access Application**
   - Frontend: `http://127.0.0.1:5500`
   - Backend API: `http://127.0.0.1:3000`
   - LiveReload: Port 35729

3. **File Watching**
   - JavaScript: `src/**/*.js`
   - CSS: `assets/styles/**/*.css`
   - HTML: `*.html`

## Production Deployment

### Static Hosting (Recommended)

The application can be deployed as static files to any web server:

1. **Prepare Files**

   ```bash
   # No build step required - serve files directly
   ```

2. **Upload to Web Server**
   - Upload all files to web root
   - Ensure `.htaccess` is included for Apache servers

3. **Server Configuration**
   - Configure SPA routing fallback to `index.html`
   - Set appropriate cache headers
   - Enable gzip compression

### Apache Configuration (`.htaccess`)

```apache
# SPA Routing
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
</IfModule>
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/lets-todo;
    index index.html;

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache Control
    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /index.html {
        expires 0;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # Compression
    gzip on;
    gzip_types text/plain text/css application/javascript;
}
```

## Environment Configuration

### Environment Variables

| Variable   | Description                | Default       |
| ---------- | -------------------------- | ------------- |
| `NODE_ENV` | Environment mode           | `development` |
| `PORT`     | Server port (if supported) | `5500`        |

### Development vs Production

**Development:**

- LiveReload enabled
- Detailed error messages
- Source maps available
- Debug logging active

**Production:**

- LiveReload disabled
- Optimized error handling
- Security headers enabled
- Performance optimizations

## Features

### Core Features

- Todo Management (CRUD operations)
- User Authentication
- Dark/Light Theme Toggle
- Responsive Design
- Offline Functionality (PWA ready)
- Data Import/Export
- Real-time Updates

### Technical Features

- ES6+ Modules (no bundler required)
- Modern JavaScript APIs
- Service Worker Support
- Local Storage Persistence
- RESTful API Integration
- Component-based Architecture

## Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Server automatically finds next available port
# Check console output for actual port number
```

**LiveReload Not Working**

```bash
# Ensure both services are running
npm run dev

# Check if port 35729 is blocked by firewall
```

**API Connection Issues**

```bash
# Verify backend is running on port 3000
# Check cookie domain settings in dev-server.js
```

**Module Loading Errors**

```bash
# Ensure proper ES module syntax
# Check file extensions (.js required)
# Verify export/import statements
```

### Performance Optimization

1. **Enable Compression**
   - Configure gzip/brotli on web server
   - Use appropriate cache headers

2. **Optimize Assets**
   - Compress images
   - Minify CSS (optional)
   - Enable browser caching

3. **Monitor Performance**
   - Use browser DevTools
   - Analyze bundle size
   - Check network requests

## Progressive Web App

The application is PWA-ready with:

- Service Worker for offline functionality
- Web App Manifest
- Responsive design
- Touch-friendly interface

## Security Considerations

- No sensitive data in frontend code
- API authentication via HTTP-only cookies
- XSS protection via Content Security Policy
- HTTPS recommended for production

## Additional Resources

- [Project Documentation](../../README.md)
- [API Documentation](../../../backend/README.md)
- Development guidelines: optional local `copilot-instructions.md`
