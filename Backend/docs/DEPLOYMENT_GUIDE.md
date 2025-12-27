# HRMS Backend Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MySQL 8+ database
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hrms-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=hrms_dev

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Create Database

```bash
mysql -u root -p
CREATE DATABASE hrms_dev;
exit;
```

### 5. Run Database Migrations & Seed

```bash
npm run db:seed
```

This will:
- Create all tables
- Seed initial data (roles, leave types, etc.)
- Create test users:
  - Admin: `admin@hrms.com` / `Admin@123`
  - Employee: `employee@hrms.com` / `Employee@123`

### 6. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 7. Test API

Visit: `http://localhost:5000/health`

Expected response:
```json
{
  "status": "OK",
  "message": "HRMS API is running"
}
```

## Production Deployment

### Option 1: Traditional VPS (Ubuntu/Debian)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <repository-url>
cd hrms-backend

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env  # Edit with production values
```

#### 3. Setup MySQL Database

```bash
mysql -u root -p
CREATE DATABASE hrms_production;
CREATE USER 'hrms_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON hrms_production.* TO 'hrms_user'@'localhost';
FLUSH PRIVILEGES;
exit;
```

#### 4. Run Seed Script

```bash
npm run db:seed
```

#### 5. Start with PM2

```bash
pm2 start server.js --name hrms-api
pm2 save
pm2 startup
```

#### 6. Setup Nginx Reverse Proxy

```bash
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/hrms-api
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hrms-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

### Option 2: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: hrms_production
      MYSQL_USER: hrms_user
      MYSQL_PASSWORD: hrms_password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USERNAME: hrms_user
      DB_PASSWORD: hrms_password
      DB_DATABASE: hrms_production
      JWT_SECRET: your_jwt_secret
      JWT_REFRESH_SECRET: your_refresh_secret
    depends_on:
      - mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

Deploy:

```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create hrms-api

# Add MySQL addon
heroku addons:create cleardb:ignite

# Get database URL
heroku config:get CLEARDB_DATABASE_URL

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set JWT_REFRESH_SECRET=your_refresh_secret

# Deploy
git push heroku main

# Run seed
heroku run npm run db:seed
```

#### Railway / Render

1. Connect GitHub repository
2. Add MySQL database service
3. Configure environment variables
4. Deploy automatically on push

## Post-Deployment

### 1. Verify Deployment

```bash
curl https://api.yourdomain.com/health
```

### 2. Create Admin User

If seed script wasn't run:

```bash
# Connect to production database
mysql -u hrms_user -p hrms_production

# Or via API (if registration is open)
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePassword123",
    "role_name": "Admin",
    "employee_data": {
      "employee_code": "ADM001",
      "first_name": "Admin",
      "last_name": "User",
      "date_of_joining": "2024-01-01"
    }
  }'
```

### 3. Setup Monitoring

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs hrms-api

# Monitor processes
pm2 monit
```

### 4. Database Backups

Create backup script:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u hrms_user -p hrms_production > $BACKUP_DIR/hrms_backup_$DATE.sql
find $BACKUP_DIR -type f -mtime +30 -delete
```

Setup cron job:

```bash
crontab -e
# Add daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Database Connection Issues

```bash
# Check MySQL status
sudo systemctl status mysql

# Check connection
mysql -u hrms_user -p -h localhost hrms_production

# View logs
tail -f /var/log/mysql/error.log
```

### Application Errors

```bash
# PM2 logs
pm2 logs hrms-api --lines 100

# Restart app
pm2 restart hrms-api

# Check environment
pm2 env hrms-api
```

### Performance Issues

```bash
# Check server resources
htop

# Database performance
mysql -u root -p -e "SHOW PROCESSLIST;"

# Analyze slow queries
mysql -u root -p -e "SHOW FULL PROCESSLIST;"
```

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW)
- [ ] Disable root login
- [ ] Setup fail2ban
- [ ] Regular security updates
- [ ] Database backups
- [ ] Environment variables secured
- [ ] API rate limiting enabled

## Maintenance

### Update Application

```bash
git pull origin main
npm install
pm2 restart hrms-api
```

### Database Migration

```bash
# Backup first
mysqldump -u hrms_user -p hrms_production > backup.sql

# Run migration
npm run db:migrate

# If issues, restore
mysql -u hrms_user -p hrms_production < backup.sql
