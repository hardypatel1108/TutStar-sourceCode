# TutStar Application Flow (Current Project)

This document maps current flows by module/actor based on routes, controllers, and services in the repository.

## 1. User Roles

The app has 3 role-specific panels/guards:

1. Student (`web` auth)
2. Teacher (`teacher` guard)
3. Admin (`admin` guard)

## 2. Entry Points

Public:

- `/` home page
- `/about-us`
- `/plan/{boardSlug}/{classSlug}`
- `/plans/{classId}/{type}`
- `/plans/{id}`

Auth:

- Student: `/login`, `/register`
- Teacher: `/teacher/login`
- Admin: `/admin/login`

## 3. Student Flow

Main routes under authenticated `web`:

- `/my-classes`
- `/schedule`
- `/notifications`
- `/other-notifications`
- `/home-work`
- `/practice-test`
- `/my-subscriptions`
- `/post-doubt`
- `/checkout/{id}`, `/enroll/{id}`

### Student core journey

1. Student registers/logs in.
2. Student explores plans/classes.
3. Student starts checkout (`/checkout/{id}`).
4. Payment is initiated via PhonePe:
   - `POST /phonepe/create`
   - `POST /phonepe/process`
5. On successful webhook, payment is fulfilled into:
   - subscription (new/renew)
   - pending enrollment (if batch not auto-extended)
6. After admin assignment, student gets active batch access.
7. Student consumes:
   - classes
   - homework
   - practice tests
   - notifications
   - doubt posting

## 4. Teacher Flow

Routes under `/teacher/*` with `auth:teacher`:

- Dashboard: `/teacher/dashboard`
- Doubts: `/teacher/doubts`
- Homeworks: `/teacher/homeworks`
- Practice tests: `/teacher/practice-tests`
- Class sessions: `/teacher/upcoming-classes`
- Today classes: `/teacher/today-classes`
- Allotted batches: `/teacher/allotted-batches`
- Notifications: `/teacher/notifications`
- Teacher settings pages

### Teacher actions

1. Views assigned batches/sessions.
2. Responds to doubts.
3. Creates homeworks/practice tests for assigned context.
4. Reads notifications and marks them read.

## 5. Admin Flow

Routes under `/admin/*` with `auth:admin`.

Modules:

- Dashboard/analytics
- Academics: boards, classes, subjects, teachers
- Batch system: batches, batch schedules, batch students, class sessions
- Student services: students, doubts, events, feedbacks
- Billing & plans: plans, offers, checkout plans/offers, payments, pending enrollments, student subscriptions
- Meetings (Zoom-backed meeting module)
- Admin settings

### Admin enrollment operations

1. Reviews payments and pending enrollments.
2. Resolves/assigns pending enrollment to a batch.
3. Student receives active allocation and access.

## 6. Payment -> Enrollment -> Access Flow

Key implementation files:

- `app/Http/Controllers/PhonePeWebhookController.php`
- `app/Services/EnrollmentFulfillmentService.php`
- `app/Http/Controllers/Admin/PendingEnrollmentController.php`

### Actual flow

1. Webhook arrives at `POST /api/phonepe/webhook`.
2. Payment is located by `gateway_txn_id` and marked verified.
3. If completed:
   - mail + notification sent
   - `EnrollmentFulfillmentService` runs:
     - creates/extends `student_subscriptions`
     - extends active `batch_students` rows where possible
     - else creates `pending_enrollments`
4. Admin handles unresolved pending enrollment:
   - resolve/assign actions
5. Student access is effectively controlled by:
   - active subscription
   - active batch allocation

## 7. Zoom Meeting Flow (Class Sessions / Events)

Core files:

- `app/Services/ZoomService.php`
- `app/Http/Controllers/ZoomWebhookController.php`
- `app/Jobs/ProcessZoomWebhookEvent.php`
- `app/Services/Zoom/WebhookEventProcessor.php`

### Creation/update

1. Admin creates recurring/single meeting-backed entities.
2. `ZoomService` creates/updates/deletes meetings and occurrences in Zoom.
3. Meeting metadata is persisted locally (meeting id, urls, occurrences, status).

### Webhook processing

1. Zoom hits `POST /api/zoom/webhook`.
2. Payload deduped into `zoom_webhook_events`.
3. Job `ProcessZoomWebhookEvent` is queued.
4. Processor updates local meeting/session states (e.g. started/completed).

## 8. Notifications Flow

Service:

- `app/Services/NotificationService.php`

Notification sources include:

- payments
- cron reminders
- homework/practice/test/class related
- system/custom events

Surfaces:

- Student notifications pages
- Teacher notifications page
- email notifications depending on sender flags

## 9. Scheduled/Cron Flow

Scheduler definition:

- `routes/console.php`

Scheduled commands:

1. `app:run-daily-jobs` (every minute)
2. `app:expired-batch-students` (daily)
3. `app:send-fee-due-reminders` (hourly)

Purpose:

- periodic notifications
- expiry status transitions
- fee due reminders at stage windows

## 10. Data Model (High-Level)

Main entities:

- users, admins, teachers, students
- boards, classes (`clazzs`), subjects
- plans, plan_offers, checkout_plans, checkout_offers
- payments, pending_enrollments, student_subscriptions
- batches, batch_students, batch_schedules
- classes_sessions, meetings, meeting_occurrences
- events (with batch linkage)
- homeworks, practice_tests, doubts, notifications
- audit_logs, zoom_webhook_events

## 11. Known Production Hardening Items

Before final production rollout:

1. Remove debug/public helper routes from `routes/web.php`
2. Enforce PhonePe webhook signature check (`PhonePeWebhookController::isValidSignature`)
3. Ensure queue worker cron is running (Zoom webhook job processing depends on it)
4. Keep `APP_DEBUG=false`

## 12. Suggested Test Sequence (End-to-End)

1. Create plan + checkout plan + offer
2. Student checkout -> payment completed
3. Verify webhook updates payment + subscription/pending enrollment
4. Admin assign pending enrollment to batch
5. Verify student can see class/homework/practice items
6. Create class session/event with Zoom
7. Verify webhook events are consumed and statuses update
8. Verify notifications (student + teacher) and reminder cron behavior

