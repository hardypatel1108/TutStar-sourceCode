-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 05, 2026 at 04:20 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tutstar`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `model_type` varchar(100) DEFAULT NULL,
  `model_id` bigint(20) UNSIGNED DEFAULT NULL,
  `changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changes`)),
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `batches`
--

CREATE TABLE `batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `batch_code` varchar(150) NOT NULL,
  `plan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `class_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `time_slot` varchar(30) DEFAULT NULL,
  `students_limit` int(11) DEFAULT 100,
  `status` enum('upcoming','active','inactive','completed') DEFAULT 'upcoming',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `batch_event`
--

CREATE TABLE `batch_event` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `batch_schedules`
--

CREATE TABLE `batch_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'Asia/Kolkata',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `batch_students`
--

CREATE TABLE `batch_students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `joined_at` datetime DEFAULT current_timestamp(),
  `ended_at` datetime DEFAULT NULL,
  `status` enum('active','left','expired') DEFAULT 'active',
  `allocated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `allocated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `expiry_notified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `boards`
--

CREATE TABLE `boards` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `checkout_offers`
--

CREATE TABLE `checkout_offers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `checkout_plan_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `type` enum('percentage','flat') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `checkout_plans`
--

CREATE TABLE `checkout_plans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `months` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `board_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `ordinal` int(11) DEFAULT 0,
  `status` enum('active','inactive','blocked') DEFAULT 'active',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes_sessions`
--

CREATE TABLE `classes_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `class_date` datetime NOT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `meeting_id` bigint(20) UNSIGNED DEFAULT NULL,
  `occurrence_id` varchar(255) DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','rescheduled') DEFAULT 'scheduled',
  `zoom_meeting_id` varchar(255) DEFAULT NULL,
  `zoom_join_url` text DEFAULT NULL,
  `zoom_start_url` text DEFAULT NULL,
  `recording_link` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clazzs`
--

CREATE TABLE `clazzs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doubts`
--

CREATE TABLE `doubts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `classes_session_id` bigint(20) UNSIGNED DEFAULT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `question` text NOT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `status` enum('open','answered','closed') DEFAULT 'open',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_image` varchar(255) DEFAULT NULL,
  `meeting_id` bigint(20) UNSIGNED DEFAULT NULL,
  `meeting_type` enum('single','recurring') NOT NULL DEFAULT 'single',
  `recurrence` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recurrence`)),
  `zoom_meeting_id` varchar(255) DEFAULT NULL,
  `zoom_join_url` text DEFAULT NULL,
  `zoom_start_url` text DEFAULT NULL,
  `zoom_recording_link` text DEFAULT NULL,
  `zoom_status` enum('scheduled','started','ended','cancelled') DEFAULT 'scheduled',
  `starts_at` datetime NOT NULL,
  `ends_at` datetime DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `failed_jobs`
--

INSERT INTO `failed_jobs` (`id`, `uuid`, `connection`, `queue`, `payload`, `exception`, `failed_at`) VALUES
(1, 'd1e1fadd-c333-4d87-8815-9145d344ab2e', 'database', 'default', '{\"uuid\":\"d1e1fadd-c333-4d87-8815-9145d344ab2e\",\"displayName\":\"App\\\\Mail\\\\UserRegisteredMail\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":16:{s:8:\\\"mailable\\\";O:27:\\\"App\\\\Mail\\\\UserRegisteredMail\\\":4:{s:4:\\\"user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:17;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:10:\\\"customCode\\\";s:8:\\\"CAKMxfqU\\\";s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:20:\\\"arevee0001@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\"},\"createdAt\":1765862376,\"delay\":null}', 'ErrorException: Undefined variable $password in C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\storage\\framework\\views\\8477a5484932e638352273d03229ee65.php:19\nStack trace:\n#0 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Bootstrap\\HandleExceptions.php(258): Illuminate\\Foundation\\Bootstrap\\HandleExceptions->handleError(2, \'Undefined varia...\', \'C:\\\\Users\\\\arevee...\', 19)\n#1 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\storage\\framework\\views\\8477a5484932e638352273d03229ee65.php(19): Illuminate\\Foundation\\Bootstrap\\HandleExceptions->Illuminate\\Foundation\\Bootstrap\\{closure}(2, \'Undefined varia...\', \'C:\\\\Users\\\\arevee...\', 19)\n#2 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Filesystem\\Filesystem.php(123): require(\'C:\\\\Users\\\\arevee...\')\n#3 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Filesystem\\Filesystem.php(124): Illuminate\\Filesystem\\Filesystem::Illuminate\\Filesystem\\{closure}()\n#4 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\Engines\\PhpEngine.php(57): Illuminate\\Filesystem\\Filesystem->getRequire(\'C:\\\\Users\\\\arevee...\', Array)\n#5 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\Engines\\CompilerEngine.php(76): Illuminate\\View\\Engines\\PhpEngine->evaluatePath(\'C:\\\\Users\\\\arevee...\', Array)\n#6 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\View.php(208): Illuminate\\View\\Engines\\CompilerEngine->get(\'C:\\\\Users\\\\arevee...\', Array)\n#7 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\View.php(191): Illuminate\\View\\View->getContents()\n#8 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\View.php(160): Illuminate\\View\\View->renderContents()\n#9 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php(444): Illuminate\\View\\View->render()\n#10 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php(419): Illuminate\\Mail\\Mailer->renderView(\'emails.user_reg...\', Array)\n#11 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php(312): Illuminate\\Mail\\Mailer->addContent(Object(Illuminate\\Mail\\Message), \'emails.user_reg...\', NULL, NULL, Array)\n#12 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailable.php(207): Illuminate\\Mail\\Mailer->send(\'emails.user_reg...\', Array, Object(Closure))\n#13 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Support\\Traits\\Localizable.php(19): Illuminate\\Mail\\Mailable->Illuminate\\Mail\\{closure}()\n#14 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailable.php(200): Illuminate\\Mail\\Mailable->withLocale(NULL, Object(Closure))\n#15 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\SendQueuedMailable.php(82): Illuminate\\Mail\\Mailable->send(Object(Illuminate\\Mail\\MailManager))\n#16 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): Illuminate\\Mail\\SendQueuedMailable->handle(Object(Illuminate\\Mail\\MailManager))\n#17 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#18 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#19 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#20 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(836): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#21 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(132): Illuminate\\Container\\Container->call(Array)\n#22 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Bus\\Dispatcher->Illuminate\\Bus\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#23 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#24 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(136): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#25 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(134): Illuminate\\Bus\\Dispatcher->dispatchNow(Object(Illuminate\\Mail\\SendQueuedMailable), false)\n#26 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Queue\\CallQueuedHandler->Illuminate\\Queue\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#27 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#28 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(127): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#29 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(68): Illuminate\\Queue\\CallQueuedHandler->dispatchThroughMiddleware(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Mail\\SendQueuedMailable))\n#30 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Jobs\\Job.php(102): Illuminate\\Queue\\CallQueuedHandler->call(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Array)\n#31 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(444): Illuminate\\Queue\\Jobs\\Job->fire()\n#32 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(394): Illuminate\\Queue\\Worker->process(\'database\', Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Queue\\WorkerOptions))\n#33 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(180): Illuminate\\Queue\\Worker->runJob(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), \'database\', Object(Illuminate\\Queue\\WorkerOptions))\n#34 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(148): Illuminate\\Queue\\Worker->daemon(\'database\', \'default\', Object(Illuminate\\Queue\\WorkerOptions))\n#35 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(131): Illuminate\\Queue\\Console\\WorkCommand->runWorker(\'database\', \'default\')\n#36 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): Illuminate\\Queue\\Console\\WorkCommand->handle()\n#37 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#38 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#39 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#40 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(836): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#41 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(211): Illuminate\\Container\\Container->call(Array)\n#42 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Command\\Command.php(318): Illuminate\\Console\\Command->execute(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Illuminate\\Console\\OutputStyle))\n#43 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(180): Symfony\\Component\\Console\\Command\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Illuminate\\Console\\OutputStyle))\n#44 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Application.php(1110): Illuminate\\Console\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#45 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Application.php(359): Symfony\\Component\\Console\\Application->doRunCommand(Object(Illuminate\\Queue\\Console\\WorkCommand), Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#46 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Application.php(194): Symfony\\Component\\Console\\Application->doRun(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#47 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Console\\Kernel.php(197): Symfony\\Component\\Console\\Application->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#48 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Application.php(1235): Illuminate\\Foundation\\Console\\Kernel->handle(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#49 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\artisan(16): Illuminate\\Foundation\\Application->handleCommand(Object(Symfony\\Component\\Console\\Input\\ArgvInput))\n#50 {main}\n\nNext Illuminate\\View\\ViewException: Undefined variable $password (View: C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\resources\\views\\emails\\user_registered.blade.php) in C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\storage\\framework\\views\\8477a5484932e638352273d03229ee65.php:19\nStack trace:\n#0 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\Engines\\PhpEngine.php(59): Illuminate\\View\\Engines\\CompilerEngine->handleViewException(Object(ErrorException), 0)\n#1 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\Engines\\CompilerEngine.php(76): Illuminate\\View\\Engines\\PhpEngine->evaluatePath(\'C:\\\\Users\\\\arevee...\', Array)\n#2 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\View.php(208): Illuminate\\View\\Engines\\CompilerEngine->get(\'C:\\\\Users\\\\arevee...\', Array)\n#3 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\View.php(191): Illuminate\\View\\View->getContents()\n#4 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\View.php(160): Illuminate\\View\\View->renderContents()\n#5 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php(444): Illuminate\\View\\View->render()\n#6 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php(419): Illuminate\\Mail\\Mailer->renderView(\'emails.user_reg...\', Array)\n#7 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php(312): Illuminate\\Mail\\Mailer->addContent(Object(Illuminate\\Mail\\Message), \'emails.user_reg...\', NULL, NULL, Array)\n#8 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailable.php(207): Illuminate\\Mail\\Mailer->send(\'emails.user_reg...\', Array, Object(Closure))\n#9 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Support\\Traits\\Localizable.php(19): Illuminate\\Mail\\Mailable->Illuminate\\Mail\\{closure}()\n#10 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailable.php(200): Illuminate\\Mail\\Mailable->withLocale(NULL, Object(Closure))\n#11 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\SendQueuedMailable.php(82): Illuminate\\Mail\\Mailable->send(Object(Illuminate\\Mail\\MailManager))\n#12 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): Illuminate\\Mail\\SendQueuedMailable->handle(Object(Illuminate\\Mail\\MailManager))\n#13 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#14 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#15 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#16 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(836): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#17 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(132): Illuminate\\Container\\Container->call(Array)\n#18 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Bus\\Dispatcher->Illuminate\\Bus\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#19 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#20 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(136): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#21 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(134): Illuminate\\Bus\\Dispatcher->dispatchNow(Object(Illuminate\\Mail\\SendQueuedMailable), false)\n#22 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Queue\\CallQueuedHandler->Illuminate\\Queue\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#23 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#24 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(127): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#25 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(68): Illuminate\\Queue\\CallQueuedHandler->dispatchThroughMiddleware(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Mail\\SendQueuedMailable))\n#26 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Jobs\\Job.php(102): Illuminate\\Queue\\CallQueuedHandler->call(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Array)\n#27 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(444): Illuminate\\Queue\\Jobs\\Job->fire()\n#28 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(394): Illuminate\\Queue\\Worker->process(\'database\', Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Queue\\WorkerOptions))\n#29 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(180): Illuminate\\Queue\\Worker->runJob(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), \'database\', Object(Illuminate\\Queue\\WorkerOptions))\n#30 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(148): Illuminate\\Queue\\Worker->daemon(\'database\', \'default\', Object(Illuminate\\Queue\\WorkerOptions))\n#31 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(131): Illuminate\\Queue\\Console\\WorkCommand->runWorker(\'database\', \'default\')\n#32 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): Illuminate\\Queue\\Console\\WorkCommand->handle()\n#33 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#34 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#35 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#36 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(836): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#37 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(211): Illuminate\\Container\\Container->call(Array)\n#38 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Command\\Command.php(318): Illuminate\\Console\\Command->execute(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Illuminate\\Console\\OutputStyle))\n#39 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(180): Symfony\\Component\\Console\\Command\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Illuminate\\Console\\OutputStyle))\n#40 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Application.php(1110): Illuminate\\Console\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#41 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Application.php(359): Symfony\\Component\\Console\\Application->doRunCommand(Object(Illuminate\\Queue\\Console\\WorkCommand), Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#42 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Application.php(194): Symfony\\Component\\Console\\Application->doRun(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#43 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Console\\Kernel.php(197): Symfony\\Component\\Console\\Application->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#44 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Application.php(1235): Illuminate\\Foundation\\Console\\Kernel->handle(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#45 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\artisan(16): Illuminate\\Foundation\\Application->handleCommand(Object(Symfony\\Component\\Console\\Input\\ArgvInput))\n#46 {main}', '2025-12-16 05:19:41'),
(2, 'bab8cbb0-c3db-44b7-984d-0f6cef68d8b4', 'database', 'default', '{\"uuid\":\"bab8cbb0-c3db-44b7-984d-0f6cef68d8b4\",\"displayName\":\"App\\\\Mail\\\\PaymentSuccessfulMail\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":16:{s:8:\\\"mailable\\\";O:30:\\\"App\\\\Mail\\\\PaymentSuccessfulMail\\\":3:{s:7:\\\"payment\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Payment\\\";s:2:\\\"id\\\";i:44;s:9:\\\"relations\\\";a:2:{i:0;s:7:\\\"student\\\";i:1;s:12:\\\"student.user\\\";}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:20:\\\"arevee0001@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\"},\"createdAt\":1766385552,\"delay\":null}', 'InvalidArgumentException: View [emails.payments.success] not found. in C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\FileViewFinder.php:138\nStack trace:\n#0 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\FileViewFinder.php(78): Illuminate\\View\\FileViewFinder->findInPaths(\'emails.payments...\', Array)\n#1 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\Factory.php(150): Illuminate\\View\\FileViewFinder->find(\'emails.payments...\')\n#2 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Markdown.php(93): Illuminate\\View\\Factory->make(\'emails.payments...\', Array)\n#3 [internal function]: Illuminate\\Mail\\Markdown->Illuminate\\Mail\\{closure}()\n#4 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\View\\Compilers\\BladeCompiler.php(1035): call_user_func(Object(Closure))\n#5 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Markdown.php(75): Illuminate\\View\\Compilers\\BladeCompiler->usingEchoFormat(\'new \\\\Illuminate...\', Object(Closure))\n#6 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailable.php(380): Illuminate\\Mail\\Markdown->render(\'emails.payments...\', Array)\n#7 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Collections\\helpers.php(236): Illuminate\\Mail\\Mailable->Illuminate\\Mail\\{closure}(Array)\n#8 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php(440): value(Object(Closure), Array)\n#9 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php(419): Illuminate\\Mail\\Mailer->renderView(Object(Closure), Array)\n#10 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php(312): Illuminate\\Mail\\Mailer->addContent(Object(Illuminate\\Mail\\Message), Object(Closure), Object(Closure), NULL, Array)\n#11 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailable.php(207): Illuminate\\Mail\\Mailer->send(Object(Closure), Array, Object(Closure))\n#12 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Support\\Traits\\Localizable.php(19): Illuminate\\Mail\\Mailable->Illuminate\\Mail\\{closure}()\n#13 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailable.php(200): Illuminate\\Mail\\Mailable->withLocale(NULL, Object(Closure))\n#14 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\SendQueuedMailable.php(82): Illuminate\\Mail\\Mailable->send(Object(Illuminate\\Mail\\MailManager))\n#15 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): Illuminate\\Mail\\SendQueuedMailable->handle(Object(Illuminate\\Mail\\MailManager))\n#16 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#17 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#18 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#19 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(836): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#20 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(132): Illuminate\\Container\\Container->call(Array)\n#21 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Bus\\Dispatcher->Illuminate\\Bus\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#22 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#23 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(136): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#24 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(134): Illuminate\\Bus\\Dispatcher->dispatchNow(Object(Illuminate\\Mail\\SendQueuedMailable), false)\n#25 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Queue\\CallQueuedHandler->Illuminate\\Queue\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#26 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#27 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(127): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#28 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(68): Illuminate\\Queue\\CallQueuedHandler->dispatchThroughMiddleware(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Mail\\SendQueuedMailable))\n#29 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Jobs\\Job.php(102): Illuminate\\Queue\\CallQueuedHandler->call(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Array)\n#30 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(444): Illuminate\\Queue\\Jobs\\Job->fire()\n#31 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(394): Illuminate\\Queue\\Worker->process(\'database\', Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Queue\\WorkerOptions))\n#32 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(180): Illuminate\\Queue\\Worker->runJob(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), \'database\', Object(Illuminate\\Queue\\WorkerOptions))\n#33 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(148): Illuminate\\Queue\\Worker->daemon(\'database\', \'default\', Object(Illuminate\\Queue\\WorkerOptions))\n#34 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(131): Illuminate\\Queue\\Console\\WorkCommand->runWorker(\'database\', \'default\')\n#35 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): Illuminate\\Queue\\Console\\WorkCommand->handle()\n#36 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#37 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#38 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#39 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(836): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#40 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(211): Illuminate\\Container\\Container->call(Array)\n#41 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Command\\Command.php(318): Illuminate\\Console\\Command->execute(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Illuminate\\Console\\OutputStyle))\n#42 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(180): Symfony\\Component\\Console\\Command\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Illuminate\\Console\\OutputStyle))\n#43 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Application.php(1110): Illuminate\\Console\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#44 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Application.php(359): Symfony\\Component\\Console\\Application->doRunCommand(Object(Illuminate\\Queue\\Console\\WorkCommand), Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#45 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\symfony\\console\\Application.php(194): Symfony\\Component\\Console\\Application->doRun(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#46 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Console\\Kernel.php(197): Symfony\\Component\\Console\\Application->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#47 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Application.php(1235): Illuminate\\Foundation\\Console\\Kernel->handle(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#48 C:\\Users\\arevee\\Desktop\\Rakesh\\tutstar\\application-tutstar.com\\artisan(16): Illuminate\\Foundation\\Application->handleCommand(Object(Symfony\\Component\\Console\\Input\\ArgvInput))\n#49 {main}', '2025-12-22 06:46:45');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `comment` text DEFAULT NULL,
  `forced_by_admin` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `model_type` varchar(100) DEFAULT NULL,
  `model_id` bigint(20) UNSIGNED DEFAULT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `size` bigint(20) DEFAULT NULL,
  `visibility` enum('public','private') DEFAULT 'private',
  `used_for` enum('profile','homework','doubt','recording','attachment') DEFAULT 'attachment',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `file_entries`
--

CREATE TABLE `file_entries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `homeworks`
--

CREATE TABLE `homeworks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `classes_session_id` bigint(20) UNSIGNED DEFAULT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `topic` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `zoom_meeting_id` text DEFAULT NULL,
  `zoom_uuid` varchar(255) DEFAULT NULL,
  `zoom_host_email` varchar(255) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `duration` int(11) NOT NULL DEFAULT 60,
  `status` enum('scheduled','started','ended','cancelled') NOT NULL DEFAULT 'scheduled',
  `start_url` text DEFAULT NULL,
  `join_url` text DEFAULT NULL,
  `recording_status` enum('none','processing','available','failed') NOT NULL DEFAULT 'none',
  `recording_url` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `meeting_type` enum('single','recurring') NOT NULL DEFAULT 'single',
  `recurrence` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recurrence`)),
  `timezone` varchar(50) DEFAULT 'Asia/Kolkata'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meeting_occurrences`
--

CREATE TABLE `meeting_occurrences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `meeting_id` bigint(20) UNSIGNED NOT NULL,
  `occurrence_id` varchar(100) NOT NULL,
  `start_time` datetime NOT NULL,
  `duration` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meeting_user`
--

CREATE TABLE `meeting_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `meeting_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role` enum('host','teacher','student','admin','guest') NOT NULL DEFAULT 'student',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_09_22_192236_add_profile_fields_to_users_table', 2),
(5, '2025_09_25_061412_add_deleted_at_to_users_table', 3),
(6, '2025_09_25_103541_create_freebies_table', 4),
(7, '2025_09_25_112803_create_tools_table', 5),
(8, '2025_09_25_115057_create_meetups_table', 6),
(9, '2025_09_26_094600_create_permission_tables', 7),
(10, '2025_10_20_113452_create_portfolios_table', 8),
(11, '2025_11_05_025051_create_admins_table', 9),
(12, '2026_02_22_130000_add_time_slot_to_batches_table', 10),
(13, '2026_02_22_140000_create_zoom_webhook_events_table', 11),
(14, '2026_02_22_150000_add_zoom_management_fields_to_events_table', 12),
(15, '2026_02_22_151500_expand_zoom_url_columns_on_events_table', 13),
(16, '2026_02_22_190000_fix_meeting_occurrence_unique_constraint', 14),
(17, '2026_02_22_210000_add_preferred_class_label_to_students_table', 15),
(18, '2026_02_22_220000_add_preferred_board_label_to_students_table', 16),
(19, '2026_02_22_230000_add_ongoing_batches_to_plans_table', 17),
(20, '2026_02_23_190000_create_batch_event_pivot_table', 18),
(21, '2025_11_05_025052_create_teachers_table', 19),
(22, '2025_11_05_025053_create_students_table', 19),
(23, '2025_11_05_025832_create_teachers_table', 19),
(24, '2025_11_05_025833_create_students_table', 19),
(25, '2025_11_06_114111_create_boards_table', 19),
(26, '2025_11_06_114113_create_subjects_table', 19),
(27, '2025_11_06_114240_create_teachers_table', 19),
(28, '2025_11_06_114248_create_students_table', 19),
(29, '2025_11_06_114249_create_plans_table', 19),
(30, '2025_11_06_114250_create_plan_subjects_table', 19),
(31, '2025_11_06_114254_create_batches_table', 19),
(32, '2025_11_06_114255_create_batch_students_table', 19),
(33, '2025_11_06_114256_create_batch_schedules_table', 19),
(34, '2025_11_06_114258_create_student_subscriptions_table', 19),
(35, '2025_11_06_114259_create_payments_table', 19),
(36, '2025_11_06_114300_create_events_table', 19),
(37, '2025_11_06_114301_create_class_sessions_table', 19),
(38, '2025_11_06_114302_create_homework_table', 19),
(39, '2025_11_06_114303_create_practice_tests_table', 19),
(40, '2025_11_06_114304_create_doubts_table', 19),
(41, '2025_11_06_114305_create_notifications_table', 19),
(42, '2025_11_06_114308_create_audit_logs_table', 19),
(43, '2025_11_06_115151_create_plan_offers_table', 19),
(44, '2025_11_06_115154_create_checkout_offers_table', 19),
(45, '2025_11_29_063642_create_checkout_plans_table', 19),
(46, '2025_11_06_114112_create_clazzs_table', 20),
(47, '2025_11_06_114306_create_file_entries_table', 20),
(48, '2025_11_06_115136_create_feedback_table', 21),
(49, '2026_02_23_210000_create_admins_table', 22),
(50, '2026_02_23_210001_create_audit_logs_table', 22),
(51, '2026_02_23_210002_create_batch_event_table', 22),
(52, '2026_02_23_210003_create_batch_schedules_table', 22),
(53, '2026_02_23_210004_create_batch_students_table', 22),
(54, '2026_02_23_210005_create_batches_table', 22),
(55, '2026_02_23_210006_create_boards_table', 22),
(56, '2026_02_23_210007_create_cache_table', 22),
(57, '2026_02_23_210008_create_cache_locks_table', 22),
(58, '2026_02_23_210009_create_checkout_offers_table', 22),
(59, '2026_02_23_210010_create_checkout_plans_table', 22),
(60, '2026_02_23_210011_create_classes_table', 22),
(61, '2026_02_23_210012_create_classes_sessions_table', 22),
(62, '2026_02_23_210013_create_clazzs_table', 22),
(63, '2026_02_23_210014_create_doubts_table', 22),
(64, '2026_02_23_210015_create_events_table', 22),
(65, '2026_02_23_210016_create_failed_jobs_table', 22),
(66, '2026_02_23_210017_create_feedback_table', 22),
(67, '2026_02_23_210018_create_file_entries_table', 22),
(68, '2026_02_23_210019_create_files_table', 22),
(69, '2026_02_23_210020_create_homeworks_table', 22),
(70, '2026_02_23_210021_create_job_batches_table', 22),
(71, '2026_02_23_210022_create_jobs_table', 22),
(72, '2026_02_23_210023_create_meeting_occurrences_table', 22),
(73, '2026_02_23_210024_create_meeting_user_table', 22),
(74, '2026_02_23_210025_create_meetings_table', 22),
(75, '2026_02_23_210026_create_model_has_permissions_table', 22),
(76, '2026_02_23_210027_create_model_has_roles_table', 22),
(77, '2026_02_23_210028_create_notifications_table', 22),
(78, '2026_02_23_210029_create_password_reset_tokens_table', 22),
(79, '2026_02_23_210030_create_payments_table', 22),
(80, '2026_02_23_210031_create_pending_enrollments_table', 22),
(81, '2026_02_23_210032_create_permissions_table', 22),
(82, '2026_02_23_210033_create_plan_offers_table', 22),
(83, '2026_02_23_210034_create_plan_subjects_table', 22),
(84, '2026_02_23_210035_create_plans_table', 22),
(85, '2026_02_23_210036_create_practice_tests_table', 22),
(86, '2026_02_23_210037_create_role_has_permissions_table', 22),
(87, '2026_02_23_210038_create_roles_table', 22),
(88, '2026_02_23_210039_create_sessions_table', 22),
(89, '2026_02_23_210040_create_student_subscriptions_table', 22),
(90, '2026_02_23_210041_create_students_table', 22),
(91, '2026_02_23_210042_create_subject_features_table', 22),
(92, '2026_02_23_210043_create_subject_overview_points_table', 22),
(93, '2026_02_23_210044_create_subject_overviews_table', 22),
(94, '2026_02_23_210045_create_subject_syllabus_chapters_table', 22),
(95, '2026_02_23_210046_create_subject_syllabus_topics_table', 22),
(96, '2026_02_23_210047_create_subjects_table', 22),
(97, '2026_02_23_210048_create_teacher_teaching_experiences_table', 22),
(98, '2026_02_23_210049_create_teachers_table', 22),
(99, '2026_02_23_210050_create_users_table', 22),
(100, '2026_02_23_210051_create_zoom_webhook_events_table', 22),
(101, '2026_03_24_000001_add_viewed_at_to_notifications_table', 22);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(6, 'App\\Models\\User', 4),
(7, 'App\\Models\\User', 12),
(7, 'App\\Models\\User', 18),
(7, 'App\\Models\\User', 21),
(8, 'App\\Models\\User', 11),
(8, 'App\\Models\\User', 22);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('system','class','homework','payment','event','custom',' newuser','cron') DEFAULT 'system',
  `model_type` varchar(100) DEFAULT NULL,
  `model_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `viewed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subscription_id` bigint(20) UNSIGNED DEFAULT NULL,
  `checkout_plan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `gateway` enum('phonepe','manual') DEFAULT 'manual',
  `gateway_txn_id` varchar(255) DEFAULT NULL,
  `gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gateway_response`)),
  `gateway_verified` tinyint(1) DEFAULT 0,
  `mail_sent_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `note` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pending_enrollments`
--

CREATE TABLE `pending_enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED NOT NULL,
  `checkout_plan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `resolved` tinyint(1) NOT NULL DEFAULT 0,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'users.view', 'web', '2025-09-26 04:36:48', '2025-09-26 04:36:48'),
(2, 'users.edit', 'web', '2025-09-26 04:36:48', '2025-09-26 04:36:48'),
(3, 'users.delete', 'web', '2025-09-26 04:36:48', '2025-09-26 04:36:48'),
(4, 'users.create', 'web', '2025-09-26 04:36:48', '2025-09-26 04:36:48');

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `board_id` bigint(20) UNSIGNED DEFAULT NULL,
  `class_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `type` enum('single','combo','all') DEFAULT 'single',
  `duration_days` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `ongoing_batches` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plan_offers`
--

CREATE TABLE `plan_offers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `type` enum('percentage','flat') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plan_subjects`
--

CREATE TABLE `plan_subjects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `practice_tests`
--

CREATE TABLE `practice_tests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(6, 'admin', 'admin', '2025-10-01 04:56:07', '2025-10-01 04:56:07'),
(7, 'student', 'web', '2025-10-01 05:26:27', '2025-10-01 05:26:27'),
(8, 'teacher', 'teacher', '2025-10-01 05:26:27', '2025-10-01 05:26:27');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 7),
(2, 6),
(3, 6),
(4, 6);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('K8SFw7rjA8JWcPBqC1dgdinu8in5XKuMWwknO5M3', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoidE5WR0pBbUpTSVRHdUtwMlE3Z3d3djVVclhXYnB5WDA4ZjRoTjBLTyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6MzoidXJsIjthOjA6e319', 1775205934),
('Ok2tNk2cGhN6yKkXhhEeLx0iukJkbHzHKKR3EM9g', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiS25HSElrMWVOeWw0azN4MTk0Mko3UVFTbHpoNW9zY0VacUFSaTg0VCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1775223791),
('RicPTEzNCsgyUwjFNPILq72AB9TTgjluSXjuF7cC', 17, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoidVhQQTB1dDczNG1lOGFxc080SzRKdFVaaXdjZDdyS1dubEs0c25rRiI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czoxNDY6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hZG1pbi9wbGFucz9ib2FyZD0mY2xhc3M9NiZoYXNfb2ZmZXI9Jm1heF9kdXJhdGlvbj0mbWF4X3ByaWNlPSZtaW5fZHVyYXRpb249Jm1pbl9wcmljZT0mc2VhcmNoPSZzdGF0dXM9JnN1YmplY3Q9JnR5cGU9c2luZ2xlIjt9czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NzA6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC8ud2VsbC1rbm93bi9hcHBzcGVjaWZpYy9jb20uY2hyb21lLmRldnRvb2xzLmpzb24iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxNzt9', 1775205938),
('TiSveK4ljNT7DnUpuhCsRi1aZMShDRn6cJ1600aP', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiN3ZUdTJoVFVEN1AyUHNMYmZiUTJBeVRBZ1VVVDdYbHBITzl3eTJSNCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9teS1jbGFzc2VzIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozMjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL215LWNsYXNzZXMiO319', 1775223789);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `student_uid` varchar(50) NOT NULL,
  `class_id` bigint(20) UNSIGNED DEFAULT NULL,
  `preferred_class_label` varchar(50) DEFAULT NULL,
  `board_id` bigint(20) UNSIGNED DEFAULT NULL,
  `preferred_board_label` varchar(50) DEFAULT NULL,
  `school` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `status` enum('active','inactive','blocked') DEFAULT 'active',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_subscriptions`
--

CREATE TABLE `student_subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `status` enum('active','expired','cancelled') DEFAULT 'active',
  `auto_renew` tinyint(1) DEFAULT 0,
  `price_paid` decimal(10,2) DEFAULT 0.00,
  `phonepe_order_id` varchar(255) DEFAULT NULL,
  `reminder_5_sent` tinyint(1) NOT NULL DEFAULT 0,
  `reminder_3_sent` tinyint(1) NOT NULL DEFAULT 0,
  `reminder_1_sent` tinyint(1) NOT NULL DEFAULT 0,
  `last_in_app_reminder_at` timestamp NULL DEFAULT NULL,
  `last_email_reminder_at` timestamp NULL DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `board_id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject_features`
--

CREATE TABLE `subject_features` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject_overviews`
--

CREATE TABLE `subject_overviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `pointer_type` enum('bullet','check') NOT NULL DEFAULT 'bullet',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject_overview_points`
--

CREATE TABLE `subject_overview_points` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subject_overview_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject_syllabus_chapters`
--

CREATE TABLE `subject_syllabus_chapters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject_syllabus_topics`
--

CREATE TABLE `subject_syllabus_topics` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `chapter_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `bio` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `contact_email` varchar(191) DEFAULT NULL,
  `contact_mobile` varchar(20) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `comfortable_timings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`comfortable_timings`)),
  `languages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`languages`)),
  `experience_years` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_teaching_experiences`
--

CREATE TABLE `teacher_teaching_experiences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `experience_years` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role` enum('admin','teacher','student') NOT NULL DEFAULT 'student',
  `name` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `zoom_webhook_events`
--

CREATE TABLE `zoom_webhook_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_name` varchar(120) DEFAULT NULL,
  `dedupe_key` varchar(64) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `received_at` timestamp NULL DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `attempts` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `headers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`headers`)),
  `raw_body` longtext DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_model` (`model_type`,`model_id`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `batches`
--
ALTER TABLE `batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_batch_teacher` (`teacher_id`),
  ADD KEY `idx_batch_class` (`class_id`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `batches_time_slot_index` (`time_slot`);

--
-- Indexes for table `batch_event`
--
ALTER TABLE `batch_event`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_batch_event_event_batch` (`event_id`,`batch_id`),
  ADD KEY `batch_event_batch_id_index` (`batch_id`);

--
-- Indexes for table `batch_schedules`
--
ALTER TABLE `batch_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_schedule_batch` (`batch_id`),
  ADD KEY `idx_start_datetime` (`start_datetime`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `batch_students`
--
ALTER TABLE `batch_students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_batch_student` (`batch_id`,`student_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `allocated_by` (`allocated_by`);

--
-- Indexes for table `boards`
--
ALTER TABLE `boards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `boards_slug_unique` (`slug`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `checkout_offers`
--
ALTER TABLE `checkout_offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_active` (`active`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `checkout_offers_checkout_plan_id_foreign` (`checkout_plan_id`);

--
-- Indexes for table `checkout_plans`
--
ALTER TABLE `checkout_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `checkout_plans_plan_id_foreign` (`plan_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `classes_slug_unique` (`slug`),
  ADD KEY `idx_board` (`board_id`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `classes_sessions`
--
ALTER TABLE `classes_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `idx_session_date` (`class_date`),
  ADD KEY `idx_session_status` (`status`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `classes_sessions_meeting_id_foreign` (`meeting_id`),
  ADD KEY `idx_classes_sessions_occurrence_id` (`occurrence_id`);

--
-- Indexes for table `clazzs`
--
ALTER TABLE `clazzs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doubts`
--
ALTER TABLE `doubts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classes_session_id` (`classes_session_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_time` (`starts_at`),
  ADD KEY `idx_zoom_status` (`zoom_status`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `events_meeting_id_index` (`meeting_id`),
  ADD KEY `events_meeting_type_index` (`meeting_type`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `feedback_student_id_foreign` (`student_id`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_model` (`model_type`,`model_id`),
  ADD KEY `idx_used_for` (`used_for`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `file_entries`
--
ALTER TABLE `file_entries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `homeworks`
--
ALTER TABLE `homeworks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_homework_per_session` (`classes_session_id`),
  ADD KEY `idx_classes_session_id` (`classes_session_id`),
  ADD KEY `idx_teacher_id` (`teacher_id`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meetings_created_by_foreign` (`created_by`),
  ADD KEY `zoom_meeting_id` (`zoom_meeting_id`(768)),
  ADD KEY `zoom_uuid` (`zoom_uuid`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `meeting_occurrences`
--
ALTER TABLE `meeting_occurrences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_meeting_occurrence_meeting_occurrence` (`meeting_id`,`occurrence_id`),
  ADD KEY `idx_meeting_occurrences_occurrence_id` (`occurrence_id`);

--
-- Indexes for table `meeting_user`
--
ALTER TABLE `meeting_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `meeting_user_unique` (`meeting_id`,`user_id`),
  ADD KEY `meeting_user_user_foreign` (`user_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_id` (`subscription_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_pay_student` (`student_id`),
  ADD KEY `idx_pay_status` (`status`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `payments_checkout_plan_id_foreign` (`checkout_plan_id`);

--
-- Indexes for table `pending_enrollments`
--
ALTER TABLE `pending_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pending_enrollments_payment_id_foreign` (`payment_id`),
  ADD KEY `pending_enrollments_plan_id_foreign` (`plan_id`),
  ADD KEY `pending_enrollments_checkout_plan_id_foreign` (`checkout_plan_id`),
  ADD KEY `idx_pending_enrollments_student_id` (`student_id`),
  ADD KEY `idx_pending_enrollments_resolved` (`resolved`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `board_id` (`board_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `plan_offers`
--
ALTER TABLE `plan_offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_plan_id` (`plan_id`),
  ADD KEY `idx_active` (`active`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `plan_subjects`
--
ALTER TABLE `plan_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_plan_subject` (`plan_id`,`subject_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `practice_tests`
--
ALTER TABLE `practice_tests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_teacher_id` (`teacher_id`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `fk_practice_tests_batch` (`batch_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `student_uid` (`student_uid`),
  ADD KEY `idx_class` (`class_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_students_board_id` (`board_id`);

--
-- Indexes for table `student_subscriptions`
--
ALTER TABLE `student_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `idx_sub_student` (`student_id`),
  ADD KEY `idx_sub_status` (`status`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_class` (`class_id`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `subjects_board_id_foreign` (`board_id`);

--
-- Indexes for table `subject_features`
--
ALTER TABLE `subject_features`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subject_features_subject` (`subject_id`);

--
-- Indexes for table `subject_overviews`
--
ALTER TABLE `subject_overviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subject_overviews_subject` (`subject_id`);

--
-- Indexes for table `subject_overview_points`
--
ALTER TABLE `subject_overview_points`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_overview_points_overview` (`subject_overview_id`);

--
-- Indexes for table `subject_syllabus_chapters`
--
ALTER TABLE `subject_syllabus_chapters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_syllabus_chapters_subject` (`subject_id`);

--
-- Indexes for table `subject_syllabus_topics`
--
ALTER TABLE `subject_syllabus_topics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_syllabus_topics_chapter` (`chapter_id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `teacher_teaching_experiences`
--
ALTER TABLE `teacher_teaching_experiences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_teacher_class_subject` (`teacher_id`,`class_id`,`subject_id`),
  ADD KEY `fk_tte_class` (`class_id`),
  ADD KEY `fk_tte_subject` (`subject_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`);

--
-- Indexes for table `zoom_webhook_events`
--
ALTER TABLE `zoom_webhook_events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `zoom_webhook_events_dedupe_key_unique` (`dedupe_key`),
  ADD KEY `zoom_webhook_events_event_name_status_index` (`event_name`,`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `batches`
--
ALTER TABLE `batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `batch_event`
--
ALTER TABLE `batch_event`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `batch_schedules`
--
ALTER TABLE `batch_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `batch_students`
--
ALTER TABLE `batch_students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `boards`
--
ALTER TABLE `boards`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `checkout_offers`
--
ALTER TABLE `checkout_offers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `checkout_plans`
--
ALTER TABLE `checkout_plans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classes_sessions`
--
ALTER TABLE `classes_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clazzs`
--
ALTER TABLE `clazzs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doubts`
--
ALTER TABLE `doubts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `file_entries`
--
ALTER TABLE `file_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `homeworks`
--
ALTER TABLE `homeworks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meeting_occurrences`
--
ALTER TABLE `meeting_occurrences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meeting_user`
--
ALTER TABLE `meeting_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pending_enrollments`
--
ALTER TABLE `pending_enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plan_offers`
--
ALTER TABLE `plan_offers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plan_subjects`
--
ALTER TABLE `plan_subjects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `practice_tests`
--
ALTER TABLE `practice_tests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_subscriptions`
--
ALTER TABLE `student_subscriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subject_features`
--
ALTER TABLE `subject_features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subject_overviews`
--
ALTER TABLE `subject_overviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subject_overview_points`
--
ALTER TABLE `subject_overview_points`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subject_syllabus_chapters`
--
ALTER TABLE `subject_syllabus_chapters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subject_syllabus_topics`
--
ALTER TABLE `subject_syllabus_topics`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teacher_teaching_experiences`
--
ALTER TABLE `teacher_teaching_experiences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `zoom_webhook_events`
--
ALTER TABLE `zoom_webhook_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `batches`
--
ALTER TABLE `batches`
  ADD CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `batches_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `batches_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `batches_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `batch_event`
--
ALTER TABLE `batch_event`
  ADD CONSTRAINT `batch_event_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `batch_event_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `batch_schedules`
--
ALTER TABLE `batch_schedules`
  ADD CONSTRAINT `batch_schedules_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `batch_students`
--
ALTER TABLE `batch_students`
  ADD CONSTRAINT `batch_students_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `batch_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `batch_students_ibfk_3` FOREIGN KEY (`allocated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `checkout_offers`
--
ALTER TABLE `checkout_offers`
  ADD CONSTRAINT `checkout_offers_checkout_plan_id_foreign` FOREIGN KEY (`checkout_plan_id`) REFERENCES `checkout_plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `checkout_plans`
--
ALTER TABLE `checkout_plans`
  ADD CONSTRAINT `checkout_plans_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `classes_sessions`
--
ALTER TABLE `classes_sessions`
  ADD CONSTRAINT `classes_sessions_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `classes_sessions_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `classes_sessions_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `classes_sessions_meeting_id_foreign` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `doubts`
--
ALTER TABLE `doubts`
  ADD CONSTRAINT `doubts_ibfk_1` FOREIGN KEY (`classes_session_id`) REFERENCES `classes_sessions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `doubts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doubts_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `files_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `homeworks`
--
ALTER TABLE `homeworks`
  ADD CONSTRAINT `homeworks_ibfk_1` FOREIGN KEY (`classes_session_id`) REFERENCES `classes_sessions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `homeworks_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `meetings_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `meeting_occurrences`
--
ALTER TABLE `meeting_occurrences`
  ADD CONSTRAINT `fk_occurrence_meeting` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `meeting_user`
--
ALTER TABLE `meeting_user`
  ADD CONSTRAINT `meeting_user_meeting_foreign` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_user_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_checkout_plan_id_foreign` FOREIGN KEY (`checkout_plan_id`) REFERENCES `checkout_plans` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `student_subscriptions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pending_enrollments`
--
ALTER TABLE `pending_enrollments`
  ADD CONSTRAINT `pending_enrollments_checkout_plan_id_foreign` FOREIGN KEY (`checkout_plan_id`) REFERENCES `checkout_plans` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pending_enrollments_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pending_enrollments_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pending_enrollments_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `plans`
--
ALTER TABLE `plans`
  ADD CONSTRAINT `plans_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `plans_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `plan_offers`
--
ALTER TABLE `plan_offers`
  ADD CONSTRAINT `plan_offers_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `plan_subjects`
--
ALTER TABLE `plan_subjects`
  ADD CONSTRAINT `plan_subjects_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `plan_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `practice_tests`
--
ALTER TABLE `practice_tests`
  ADD CONSTRAINT `fk_practice_tests_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `practice_tests_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_board` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_subscriptions`
--
ALTER TABLE `student_subscriptions`
  ADD CONSTRAINT `student_subscriptions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_board_id_foreign` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `subject_features`
--
ALTER TABLE `subject_features`
  ADD CONSTRAINT `fk_subject_features_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subject_overviews`
--
ALTER TABLE `subject_overviews`
  ADD CONSTRAINT `fk_subject_overviews_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subject_overview_points`
--
ALTER TABLE `subject_overview_points`
  ADD CONSTRAINT `fk_overview_points_overview` FOREIGN KEY (`subject_overview_id`) REFERENCES `subject_overviews` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subject_syllabus_chapters`
--
ALTER TABLE `subject_syllabus_chapters`
  ADD CONSTRAINT `fk_syllabus_chapters_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subject_syllabus_topics`
--
ALTER TABLE `subject_syllabus_topics`
  ADD CONSTRAINT `fk_syllabus_topics_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `subject_syllabus_chapters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_teaching_experiences`
--
ALTER TABLE `teacher_teaching_experiences`
  ADD CONSTRAINT `fk_tte_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tte_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tte_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
