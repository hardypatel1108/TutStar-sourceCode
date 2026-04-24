# TutStar Deployment Guide (Namecheap Shared Hosting)

This guide is tailored to the current project structure (`Laravel + Inertia + React/Vite`) and current routes/services.

## 1. Pre-Deployment Checklist (Local)

1. Confirm production-safe routes:
   - Remove/disable public debug routes in `routes/web.php`:
     - `GET /debug/zoom-token`
     - `GET /clear-cache`
2. Ensure `.env` is production-ready:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://your-domain.com`
3. Build frontend assets:
   - `npm ci`
   - `npm run build`
4. Install production PHP dependencies:
   - `composer install --no-dev --optimize-autoloader`
5. Ensure `public/hot` does not exist on server deployment.

## 2. Upload Layout on Namecheap

Recommended structure:

- App root: `/home/<cpanel_user>/tutstar`
- Public web root: `/home/<cpanel_user>/tutstar/public`

If your plan allows setting document root per domain/subdomain, point it directly to `.../tutstar/public`.

If not, fallback:
1. Put full app in `/home/<cpanel_user>/tutstar`
2. Copy `tutstar/public/*` into `public_html/`
3. Edit `public_html/index.php` to point to:
   - `/home/<cpanel_user>/tutstar/vendor/autoload.php`
   - `/home/<cpanel_user>/tutstar/bootstrap/app.php`

## 3. Environment Variables for This Project

Set these in server `.env` (minimum):

- App/URL:
  - `APP_NAME=TutStar`
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `APP_URL=https://your-domain.com`
- Database:
  - `DB_CONNECTION=mysql`
  - `DB_HOST=...`
  - `DB_PORT=3306`
  - `DB_DATABASE=...`
  - `DB_USERNAME=...`
  - `DB_PASSWORD=...`
- Mail:
  - `MAIL_MAILER=...`
  - `MAIL_HOST=...`
  - `MAIL_PORT=...`
  - `MAIL_USERNAME=...`
  - `MAIL_PASSWORD=...`
  - `MAIL_ENCRYPTION=tls`
  - `MAIL_FROM_ADDRESS=...`
  - `MAIL_FROM_NAME="TutStar"`
- Queue:
  - `QUEUE_CONNECTION=database`
- Zoom (`config/services.php`):
  - `ZOOM_ACCOUNT_ID=...`
  - `ZOOM_CLIENT_ID=...`
  - `ZOOM_CLIENT_SECRET=...`
  - `ZOOM_BASE_URL=https://api.zoom.us/v2`
  - `ZOOM_TIMEZONE=Asia/Kolkata`
  - `ZOOM_DEFAULT_USER=...`
  - `ZOOM_WEBHOOK_SECRET=...`
- PhonePe (`config/phonepe.php`):
  - `PHONEPE_ENV=prod`
  - `PHONEPE_PROD_CLIENT_ID=...`
  - `PHONEPE_PROD_CLIENT_VERSION=...`
  - `PHONEPE_PROD_CLIENT_SECRET=...`

Important:
- `PhonePeWebhookController::isValidSignature()` currently returns `true` early. Re-enable signature verification before live.

## 4. Server Commands (Run Once After Upload)

From app root (`/home/<cpanel_user>/tutstar`):

1. `php artisan key:generate --force`
2. `php artisan migrate --force`
3. `php artisan storage:link`
4. `php artisan config:cache`
5. `php artisan route:cache`
6. `php artisan view:cache`

Optional after deploy:

- `php artisan optimize`

## 5. Cron Setup (Required)

This project schedules commands in `routes/console.php`:

- `app:run-daily-jobs` (scheduled every minute)
- `app:expired-batch-students` (daily)
- `app:send-fee-due-reminders` (hourly)

### Required cPanel cron

Set **one** master scheduler cron (every minute):

`* * * * * /usr/local/bin/php /home/<cpanel_user>/tutstar/artisan schedule:run >> /dev/null 2>&1`

/opt/alt/php83/usr/bin/php /home/u764803161/domains/tutstar.com/public_html/artisan schedule:run >> /dev/null 2>&1
### Queue processing cron (needed for Zoom webhook jobs)

`ZoomWebhookController` dispatches `ProcessZoomWebhookEvent` (queued job). On shared hosting, use cron worker:

`* * * * * /usr/local/bin/php /home/<cpanel_user>/tutstar/artisan queue:work --stop-when-empty --tries=3 >> /dev/null 2>&1`

If queue workers are not allowed, temporary fallback:
- set `QUEUE_CONNECTION=sync` (not recommended for scale/reliability).

## 6. Webhooks & External Endpoints

Current route endpoints:

- Zoom webhook: `POST /api/zoom/webhook`
- PhonePe webhook: `POST /api/phonepe/webhook`

Ensure provider dashboard points to full HTTPS URL:

- `https://your-domain.com/api/zoom/webhook`
- `https://your-domain.com/api/phonepe/webhook`

## 7. Files/Folders Permissions

Ensure writable:

- `storage/`
- `bootstrap/cache/`

## 8. Production Validation (Smoke Test)

After deployment verify:

1. Admin login (`/admin/login`)
2. Teacher login (`/teacher/login`)
3. Student login/register (`/login`, `/register`)
4. Assets load (no Vite dev references)
5. Payment create flow works
6. Webhook hits are stored (`zoom_webhook_events`, payment audit logs)
7. Notification flows work
8. Queue jobs process (webhooks, mails)

## 9. Rollback Basics

1. Keep DB backup before migration
2. Keep previous release zip
3. If deploy fails:
   - restore files
   - restore DB backup
   - run `php artisan config:clear && php artisan cache:clear`




* * * * *	/opt/alt/php83/usr/bin/php /home/u764803161/domains/tutstar.com/public_html/artisan queue:work --stop-when-empty --tries=3 >> /home/u764803161/queue.log 2>&1


* * * * *	/opt/alt/php83/usr/bin/php /home/u764803161/domains/tutstar.com/public_html/artisan schedule:run >> /dev/null 2>&1