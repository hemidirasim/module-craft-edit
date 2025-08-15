-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: dedi7494.your-server.de
-- Generation Time: Apr 07, 2025 at 10:02 PM
-- Server version: 10.5.28-MariaDB-0+deb11u1+hetzner2
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `midiy_hiclient`
--

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
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` text NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `sub_title` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `parent_id` bigint(20) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category_post`
--

CREATE TABLE `category_post` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) DEFAULT NULL,
  `post_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `subject` text NOT NULL,
  `message` text NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `email`, `phone`, `subject`, `message`, `deleted_at`, `created_at`, `updated_at`) VALUES
(3, 'dasasd', 'asdas@dasas.az', NULL, 'Product Support', 'dsadas', NULL, '2025-03-10 16:54:26', '2025-03-10 16:54:26');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name_surname` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `credit_balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `image` varchar(255) DEFAULT NULL,
  `integration_id` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(200) DEFAULT NULL,
  `company_name` varchar(200) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name_surname`, `email`, `status`, `credit_balance`, `image`, `integration_id`, `password`, `phone_number`, `company_name`, `remember_token`, `deleted_at`, `created_at`, `updated_at`) VALUES
(23, 'Vusal Ferzeliyev', 'vusalferzeliyev5@gmail.com', 1, 0.00, 'storage/customer/profile/Twve1p3tXvDsxqHoEXFc8uVtfpl9nVtAfD4mExyE.jpg', '108747585877867933399', '$2y$10$7GWJbXzu5nHHpHx4EngjoO/CzCT3HfODi6.xZZptwdYDnAkK5R/oK', NULL, NULL, NULL, NULL, '2025-03-29 19:17:10', '2025-03-29 19:18:03'),
(25, 'Acer Nitro 5', 'acern512@gmail.com', 1, 0.00, 'storage/customer/profile/google_108130951587231602911_1743662786.jpg', '108130951587231602911', '$2y$10$Ra9rh90m1L1EPDYTsdgM5ehGfmXE5a3/OkqljLD/58vOicFj9NEAy', NULL, NULL, NULL, NULL, '2025-04-03 08:46:26', '2025-04-03 08:46:26'),
(26, 'Hamidi Rasim', 'hamidirasim@gmail.com', 1, 0.00, 'storage/customer/profile/google_117841795278738486845_1743681801.jpg', '117841795278738486845', '$2y$10$NiKmGsW3548N5mZ82.g5KONo9p2SxyelgRbOO/Bo.RCf.TLLITD5K', NULL, NULL, NULL, NULL, '2025-04-03 14:03:21', '2025-04-03 14:03:21'),
(27, 'Vusal Farzaliyev', 'vusalfarzaliyev5@gmail.com', 1, 0.00, 'storage/customer/profile/google_115623646115458119974_1743762630.jpg', '115623646115458119974', '$2y$10$5XRVl7hIa2oNGfmIs1lbDuelwy1Ft8IwtmrGCWtF4Igt08SQ4jhG6', NULL, NULL, NULL, NULL, '2025-04-04 12:30:30', '2025-04-04 12:30:30');

--
-- Triggers `customers`
--
DELIMITER $$
CREATE TRIGGER `after_user_insert` AFTER INSERT ON `customers` FOR EACH ROW BEGIN
    INSERT INTO user_balances (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW());
END
$$
DELIMITER ;

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

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order` int(11) DEFAULT NULL,
  `title` text NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `icon_url` varchar(255) DEFAULT NULL,
  `parent_id` bigint(20) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
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
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_resets_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2022_06_26_124326_categories', 1),
(6, '2022_06_26_124807_posts', 1),
(7, '2022_06_26_183436_create_menus_table', 1),
(8, '2022_06_26_191026_create_settings_table', 1),
(9, '2022_06_26_201300_create_translates_table', 1),
(10, '2022_06_28_214837_create_post_galeries_table', 1),
(11, '2022_07_05_114151_create_category_post_table', 1),
(12, '2022_07_11_131950_create_contacts_table', 1),
(13, '2022_07_20_010345_create_cache_table', 1),
(14, '2022_08_19_140744_create_static_pages_table', 1),
(15, '2025_03_09_171200_create_customers_table', 2),
(17, '2025_03_14_194146_create_tickets_tables', 3),
(23, '2025_03_15_022302_create_ticket_attachments_table', 4),
(28, '2025_03_15_022302_create_widgets_table', 6),
(29, '2025_03_15_022302_create_widget_appearances_table', 7),
(30, '2025_03_15_022302_create_widget_contacts._table', 7),
(31, '2025_03_15_022302_create_widget_contents_table', 7),
(32, '2025_03_15_022302_create_widget_display_table', 7),
(36, '2025_04_07_140411_create_notifications_table', 8),
(37, '2025_04_07_184942_add_credit_balance_to_customers_table', 9);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_tasks`
--

CREATE TABLE `payment_tasks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending' CHECK (`status` in ('pending','processing','completed','failed','cancelled')),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `credit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `publisher` bigint(20) UNSIGNED NOT NULL,
  `title` text NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `sub_title` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `view_count` bigint(20) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `image_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `youtube_link` varchar(255) DEFAULT NULL,
  `youtube_image` varchar(255) DEFAULT NULL,
  `published_date` datetime NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `post_galeries`
--

CREATE TABLE `post_galeries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` text DEFAULT NULL,
  `key` text NOT NULL,
  `file` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `title`, `key`, `file`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, '123 Business Street\r\nTech City, CA 90210\r\nUnited States', 'address', NULL, NULL, '2025-03-09 11:24:59', '2025-03-09 11:24:59'),
(2, 'info@popconnect.com', 'email', NULL, NULL, '2025-03-09 11:25:10', '2025-03-09 11:25:10'),
(3, '+1 (555) 123-4567', 'phone', NULL, NULL, '2025-03-09 11:25:21', '2025-03-09 11:25:21'),
(4, 'PopConnect - Interactive Website Popup Service', 'site_title', NULL, NULL, '2025-03-09 13:07:52', '2025-03-09 13:09:00');

-- --------------------------------------------------------

--
-- Table structure for table `static_pages`
--

CREATE TABLE `static_pages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` text NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `sub_title` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `image_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `static_pages`
--

INSERT INTO `static_pages` (`id`, `title`, `slug`, `sub_title`, `content`, `status`, `image_url`, `video_url`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Michael Johnson', 'michael-johnson', 'Marketing Director, TechSolutions', '<p>&quot;Since implementing PopConnect on our website, our customer engagement has increased by 40%. The video popup creates an instant personal connection that visitors love.&quot;</p>', 1, 'userfiles/files/IMG-20241221-WA0010jpg_0.jpg', NULL, NULL, '2025-03-09 11:06:05', '2025-03-09 11:18:52'),
(2, 'Sarah Williams', 'sarah-williams', 'Customer Support Manager, RetailPlus', '<p>&quot;The integration was incredibly simple, and our support team now receives inquiries through multiple channels. Our response time has improved dramatically.&quot;</p>', 1, NULL, NULL, NULL, '2025-03-09 11:06:28', '2025-03-09 11:06:28'),
(3, 'David Chen', 'david-chen', 'CEO, GrowthPartners', '<section id=\"testimonials\">\r\n<p>&quot;PopConnect has transformed our website from a static page to an interactive experience. Our conversion rate has increased by 25% in just two months.&quot;</p>\r\n</section>', 1, NULL, NULL, NULL, '2025-03-09 11:06:55', '2025-03-09 11:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('new','open','in-progress','closed') NOT NULL DEFAULT 'new',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `category` varchar(255) NOT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `last_reply_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_attachments`
--

CREATE TABLE `ticket_attachments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `reply_id` bigint(20) UNSIGNED DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_replies`
--

CREATE TABLE `ticket_replies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `is_customer` int(11) NOT NULL DEFAULT 0,
  `message` text NOT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_replies`
--

INSERT INTO `ticket_replies` (`id`, `ticket_id`, `user_id`, `is_admin`, `is_customer`, `message`, `attachment`, `created_at`, `updated_at`) VALUES
(49, 22, 23, 0, 1, 'fdsfsd', NULL, '2025-04-02 12:01:05', '2025-04-02 12:01:05'),
(50, 22, 23, 0, 1, 'fdsfdssfdsdf', NULL, '2025-04-02 12:01:13', '2025-04-02 12:01:13');

-- --------------------------------------------------------

--
-- Table structure for table `translates`
--

CREATE TABLE `translates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` text NOT NULL,
  `key` text NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name_surname` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name_surname`, `email`, `status`, `email_verified_at`, `password`, `deleted_at`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Midiya Agency', 'admin@admin.com', 1, '2025-03-09 10:32:44', '$2a$12$5fxaOIZsjghgzupuNMn33u4.bVB4pwj/2jeNT/AHCD46.YAs3t4TW', NULL, 'gR1VdCqSFu', '2025-03-09 10:32:44', '2025-03-09 10:32:44');

-- --------------------------------------------------------

--
-- Table structure for table `widgets`
--

CREATE TABLE `widgets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `widget_name` varchar(100) NOT NULL,
  `widget_type` varchar(50) NOT NULL,
  `status` enum('Active','Draft','Paused') NOT NULL DEFAULT 'Draft',
  `website_url` varchar(255) DEFAULT NULL,
  `embed_code` varchar(50) NOT NULL,
  `views_count` int(11) NOT NULL DEFAULT 0,
  `clicks_count` int(11) NOT NULL DEFAULT 0,
  `ctr` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `widgets`
--

INSERT INTO `widgets` (`id`, `user_id`, `widget_name`, `widget_type`, `status`, `website_url`, `embed_code`, `views_count`, `clicks_count`, `ctr`, `created_at`, `updated_at`) VALUES
(47, 23, 'test ucun', 'contact', 'Active', 'https://midiya.az', 'W-G5NNva7h', 156, 65, 41.67, '2025-04-05 16:12:12', '2025-04-06 17:24:53'),
(50, 26, 'Villa Baku', 'contact', 'Active', 'https://villa-baku.az', 'W-5xLC41zh', 37, 6, 16.22, '2025-04-06 14:33:42', '2025-04-07 18:32:19'),
(51, 23, 'asdashdkjah', 'video', 'Draft', 'https://ini.az', 'W-72CsHttj', 32, 1, 3.13, '2025-04-06 16:59:11', '2025-04-07 21:18:37'),
(52, 26, 'Villa Baku- Video', 'video', 'Active', 'https://villa-baku.az', 'W-71ABysaS', 4, 0, 0.00, '2025-04-06 17:45:21', '2025-04-07 21:48:31'),
(57, 28, 'salam', 'contact', 'Active', 'https://salam.com', 'W-DozQHSlJ', 6, 1, 16.67, '2025-04-07 08:50:38', '2025-04-07 08:53:50');

-- --------------------------------------------------------

--
-- Table structure for table `widget_appearances`
--

CREATE TABLE `widget_appearances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `widget_id` bigint(20) UNSIGNED NOT NULL,
  `bg_color` varchar(20) NOT NULL DEFAULT '#FFFFFF',
  `text_color` varchar(20) NOT NULL DEFAULT '#333333',
  `button_color` varchar(20) NOT NULL DEFAULT '#ee7c5d'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `widget_appearances`
--

INSERT INTO `widget_appearances` (`id`, `widget_id`, `bg_color`, `text_color`, `button_color`) VALUES
(28, 30, '#8d7c7c', '#ffffff', '#e45444'),
(29, 31, '#ffffff', '#333333', '#a75139'),
(30, 32, '#ffffff', '#333333', '#ee7c5d'),
(31, 33, '#000000', '#000000', '#ee7c5d'),
(32, 34, '#eb0000', '#f22626', '#7c1e04'),
(33, 35, '#ffffff', '#333333', '#ee7c5d'),
(34, 36, '#ffffff', '#333333', '#ee7c5d'),
(35, 37, '#ffffff', '#333333', '#ee7c5d'),
(37, 39, '#cfcfcf', '#ffffff', '#ee7c5d'),
(39, 41, '#ffffff', '#333333', '#ee7c5d'),
(40, 42, '#ffffff', '#ab4444', '#ee7c5d'),
(41, 43, '#ffffff', '#333333', '#ee7c5d'),
(42, 44, '#ffffff', '#333333', '#ee7c5d'),
(43, 45, '#ffffff', '#333333', '#ee7c5d'),
(44, 46, '#c13e3e', '#b92222', '#483f3c'),
(45, 47, '#ffffff', '#333333', '#ee7c5d'),
(46, 48, '#969696', '#f7f7f7', '#ee7c5d'),
(47, 49, '#ffffff', '#333333', '#ee7c5d'),
(48, 50, '#8f8f8f', '#ffffff', '#a60c66'),
(49, 51, '#ffffff', '#333333', '#ee7c5d'),
(50, 52, '#7f1010', '#ffffff', '#ee7c5d'),
(51, 53, '#ffffff', '#333333', '#ee7c5d'),
(52, 54, '#ffffff', '#333333', '#ee7c5d'),
(53, 55, '#ffffff', '#333333', '#ee7c5d'),
(54, 56, '#ffffff', '#333333', '#ee7c5d'),
(55, 57, '#ffffff', '#333333', '#ee7c5d'),
(56, 58, '#ffffff', '#333333', '#ee7c5d'),
(57, 59, '#ffffff', '#333333', '#ee7c5d');

-- --------------------------------------------------------

--
-- Table structure for table `widget_contacts`
--

CREATE TABLE `widget_contacts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `widget_id` bigint(20) UNSIGNED NOT NULL,
  `contact_method` varchar(50) NOT NULL,
  `contact_value` varchar(255) NOT NULL,
  `contact_icon` varchar(50) DEFAULT NULL,
  `contact_type` varchar(255) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `widget_contacts`
--

INSERT INTO `widget_contacts` (`id`, `widget_id`, `contact_method`, `contact_value`, `contact_icon`, `contact_type`, `display_order`) VALUES
(51, 27, 'WhatsApp', '54355643534', 'fab fa-whatsapp', 'tel', 1),
(52, 27, 'Phone Call', '5433333', 'fas fa-phone-alt', 'tel', 2),
(53, 29, 'WhatsApp', '+994508699858', 'fab fa-whatsapp', 'tel', 1),
(54, 29, 'Phone Call', '+994508699858', 'fas fa-phone-alt', 'tel', 2),
(61, 28, 'WhatsApp', '+994508699858', 'fab fa-whatsapp', 'tel', 1),
(62, 28, 'Phone Call', '+994508699858', 'fas fa-phone-alt', 'tel', 2),
(79, 30, 'WhatsApp', '+994508699858', 'fab fa-whatsapp', 'tel', 1),
(80, 30, 'Phone Call', '+994508699858', 'fas fa-phone-alt', 'tel', 2),
(81, 31, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(82, 31, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(83, 32, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(84, 32, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(87, 34, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(88, 34, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(93, 36, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(94, 36, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(95, 37, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(96, 37, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(97, 33, 'WhatsApp', '+994704303044', 'fab fa-whatsapp', 'tel', 1),
(98, 33, 'Phone Call', '+994704303044', 'fas fa-phone-alt', 'tel', 2),
(113, 39, 'WhatsApp', '+994704303044', 'fab fa-whatsapp', 'tel', 1),
(114, 39, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(117, 41, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(118, 41, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(119, 42, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(120, 42, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(121, 43, 'WhatsApp', '234524234', 'fab fa-whatsapp', 'tel', 1),
(122, 43, 'Phone Call', '423423', 'fas fa-phone-alt', 'tel', 2),
(123, 44, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(124, 44, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(139, 46, 'WhatsApp', '4243334', 'fab fa-whatsapp', 'tel', 1),
(140, 46, 'Phone Call', '67767', 'fas fa-phone-alt', 'tel', 2),
(144, 45, 'WhatsApp', '423423423', 'fab fa-whatsapp', 'tel', 1),
(145, 45, 'dasassadasda', '6757576', 'fas fa-phone-alt', 'tel', 2),
(146, 45, 'Facebook Messenger', 'farazaliadkjas', 'fab fa-facebook-messenger', 'url', 3),
(149, 48, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 1),
(150, 48, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 2),
(151, 48, 'Custom Contactsd', 'sdsd', 'fas fa-link', 'url', 3),
(164, 49, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(165, 49, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(166, 47, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(167, 47, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(168, 50, 'WhatsApp', '+994704303044', 'fab fa-whatsapp', 'tel', 1),
(169, 50, 'Phone Call', '+994704303044', 'fas fa-phone-alt', 'tel', 2),
(170, 51, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(171, 51, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(172, 52, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(173, 52, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(174, 52, 'Email', 'hamidirasim@gmail.com', 'fas fa-envelope', 'url', 3),
(177, 53, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(178, 53, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(179, 54, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(180, 54, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(181, 55, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(182, 55, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(183, 56, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(184, 56, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(189, 57, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(190, 57, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(195, 58, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(196, 58, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2),
(197, 59, 'WhatsApp', '+1 (555) 123-4567', 'fab fa-whatsapp', 'tel', 1),
(198, 59, 'Phone Call', '+1 (555) 987-6543', 'fas fa-phone-alt', 'tel', 2);

-- --------------------------------------------------------

--
-- Table structure for table `widget_contents`
--

CREATE TABLE `widget_contents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `widget_id` bigint(20) UNSIGNED NOT NULL,
  `greeting_title` varchar(255) DEFAULT NULL,
  `greeting_message` text DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `widget_contents`
--

INSERT INTO `widget_contents` (`id`, `widget_id`, `greeting_title`, `greeting_message`, `video_url`, `thumbnail_url`) VALUES
(20, 27, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', 'uploads/videos/DTpxbEJ76Awv88AeIgAFOdwoXpbHpAIKscCSAEEm.mp4', NULL),
(21, 28, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(22, 29, 'sdasadasdas👋', 'dsadasdasd234234?', NULL, NULL),
(23, 27, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(24, 29, 'sdasadasdas👋', 'dsadasdasd234234?', NULL, NULL),
(25, 28, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(26, 28, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(27, 28, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(28, 30, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(29, 31, 'Salam! 👋', 'Aşağıdakı əlaqə vasitələrindən birin seçib əlaqə saxlaya bilərsiniz.', NULL, NULL),
(30, 32, 'sadasdasdasd', 'asdasdasd asdas', NULL, NULL),
(31, 33, 'Salam! 👋', 'Təmir və tikinti ilə bağlı suallarınız varsa, zəhmət olmasa aşağıdakı əlaqə vasitələrindən birin seçib bizimlə əlaqə saxlayın.', NULL, NULL),
(32, 34, 'sdaasdasd', 'I\'m Sarah from PopCoasddasasdsadnnect. How can I help you today?', 'o5h1QR6XMm7jl6DQdTjdBRVyjKFHvy', NULL),
(33, 35, 'dsadsa', 'sdasdaasd', NULL, NULL),
(34, 36, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', 'Vz3kyUxZ7GdjPMH46PcC5pLYxDkrv0', NULL),
(35, 37, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', '8tVGg0IXB1xQ3cQ1iL4HR5vkHdQHfR', NULL),
(37, 39, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', '0dHSue8cbX1l0cG50iKwmD88YUbjrT', NULL),
(39, 41, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', 'RFJdXv6270oaepL7bWT51bXwMtYBln', NULL),
(40, 42, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', '1kSbpCFDFRCKiKKl0lxHguJet4cAt4', NULL),
(41, 43, 'dasdasda', 'fdsfk;lsdkf;lsd', 'RdXOSZx1YkWS2zOEPT1SFG8HB1GN1l', NULL),
(42, 44, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(43, 45, 'dkasmdlkasmlkd', 'dkmalsdasl;dma', 'UVpJCQtcVdIWYyhyn0Qy3V2ut7AYgE', NULL),
(44, 46, 'Hi there! dopasjpojopkop', 'kdaosjdopasjdkpoasI\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(45, 47, 'test ucun', 'dadlasdkl;a', NULL, NULL),
(46, 48, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(47, 49, 'dasda', 'dsaasI\'m Sarah from PopConnect. How can I help you today?', 'AVcpGfcCPmnOrbeNmnpkW0j6ZebRqm', NULL),
(48, 50, 'Salam! 👋', 'Təmir, tikinti və ya dizayn xidməti ilə bağlı suallarınızı cavablamağa hazırıq.', NULL, NULL),
(49, 51, 'dsada', 'dksajlkda', '5VWlHsVng0rMS90NAzfHZmyAEuMjA2', NULL),
(50, 52, 'Salamm! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', 'BCWo1Z1S95negZYwzkNfW7FPG4rP9U', NULL),
(51, 53, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(52, 54, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(53, 55, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(54, 56, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(55, 57, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(56, 58, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(57, 59, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `widget_displays`
--

CREATE TABLE `widget_displays` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `widget_id` bigint(20) UNSIGNED NOT NULL,
  `display_timing` varchar(20) NOT NULL DEFAULT 'delay5',
  `display_position` varchar(20) NOT NULL DEFAULT 'bottom-right',
  `display_pages` varchar(20) NOT NULL DEFAULT 'all',
  `display_devices` varchar(20) NOT NULL DEFAULT 'all',
  `page_urls` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `widget_displays`
--

INSERT INTO `widget_displays` (`id`, `widget_id`, `display_timing`, `display_position`, `display_pages`, `display_devices`, `page_urls`) VALUES
(20, 27, 'immediate', 'bottom-left', 'home', 'all', NULL),
(21, 28, 'immediate', 'bottom-right', 'specific', 'all', '[\"https:\\/\\/midiya.az\\/en\\/bizimle-elaqe\"]'),
(22, 29, 'immediate', 'bottom-right', 'all', 'all', NULL),
(23, 27, 'immediate', 'bottom-left', 'home', 'all', NULL),
(24, 29, 'immediate', 'bottom-right', 'all', 'all', NULL),
(25, 28, 'immediate', 'bottom-right', 'specific', 'all', '[\"https:\\/\\/midiya.az\\/en\\/bizimle-elaqe\"]'),
(26, 28, 'immediate', 'bottom-right', 'specific', 'all', '[\"https:\\/\\/midiya.az\\/en\\/bizimle-elaqe\"]'),
(27, 28, 'immediate', 'bottom-right', 'specific', 'all', '[\"https:\\/\\/midiya.az\\/en\\/bizimle-elaqe\"]'),
(28, 30, 'immediate', 'bottom-right', 'all', 'all', NULL),
(29, 31, 'delay5', 'bottom-right', 'all', 'all', NULL),
(30, 32, 'delay5', 'bottom-right', 'all', 'all', NULL),
(31, 33, 'immediate', 'bottom-right', 'all', 'all', NULL),
(32, 34, 'immediate', 'bottom-right', 'all', 'all', NULL),
(33, 35, 'immediate', 'bottom-right', 'all', 'all', NULL),
(34, 36, 'immediate', 'bottom-right', 'all', 'all', NULL),
(35, 37, 'immediate', 'bottom-right', 'all', 'all', NULL),
(37, 39, 'scroll50', 'bottom-right', 'all', 'mobile', NULL),
(38, 41, 'immediate', 'bottom-right', 'all', 'all', NULL),
(39, 42, 'delay10', 'bottom-left', 'all', 'all', NULL),
(40, 43, 'delay5', 'top-right', 'all', 'all', NULL),
(41, 44, 'delay5', 'bottom-right', 'all', 'all', NULL),
(42, 45, 'immediate', 'bottom-right', 'all', 'all', NULL),
(43, 46, 'delay10', 'top-right', 'all', 'all', NULL),
(44, 47, 'immediate', 'bottom-right', 'all', 'all', NULL),
(45, 48, 'delay5', 'bottom-right', 'all', 'all', NULL),
(46, 49, 'immediate', 'bottom-right', 'all', 'all', NULL),
(47, 50, 'immediate', 'bottom-right', 'all', 'all', NULL),
(48, 51, 'immediate', 'bottom-right', 'all', 'all', NULL),
(49, 52, 'delay5', 'bottom-right', 'all', 'all', NULL),
(50, 53, 'delay5', 'bottom-right', 'all', 'all', NULL),
(51, 54, 'delay5', 'bottom-right', 'all', 'all', NULL),
(52, 55, 'delay5', 'bottom-right', 'all', 'all', NULL),
(53, 56, 'delay5', 'bottom-right', 'all', 'all', NULL),
(54, 57, 'exit', 'bottom-right', 'all', 'all', NULL),
(55, 58, 'delay5', 'bottom-right', 'all', 'all', NULL),
(56, 59, 'delay5', 'bottom-right', 'all', 'all', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `widget_statistics`
--

CREATE TABLE `widget_statistics` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `widget_id` bigint(20) UNSIGNED NOT NULL,
  `device` varchar(255) DEFAULT NULL,
  `page` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `widget_statistics`
--

INSERT INTO `widget_statistics` (`id`, `widget_id`, `device`, `page`, `created_at`, `updated_at`, `deleted_at`) VALUES
(87, 47, 'desktop', 'https://midiya.az/en/haqqimizda', '2025-04-06 16:53:32', '2025-04-06 16:53:32', NULL),
(88, 47, 'desktop', 'https://midiya.az/en/portfolio', '2025-04-06 16:53:38', '2025-04-06 16:53:38', NULL),
(89, 47, 'desktop', 'https://midiya.az/en', '2025-04-06 16:53:40', '2025-04-06 16:53:40', NULL),
(90, 47, 'desktop', 'https://midiya.az/en', '2025-04-06 16:55:21', '2025-04-06 16:55:21', NULL),
(91, 47, 'mobile', 'https://midiya.az/en', '2025-04-06 16:55:40', '2025-04-06 16:55:40', NULL),
(92, 47, 'mobile', 'https://midiya.az/en/bizimle-elaqe', '2025-04-06 16:55:47', '2025-04-06 16:55:47', NULL),
(93, 51, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 16:59:18', '2025-04-06 16:59:18', NULL),
(94, 47, 'mobile', 'https://midiya.az/en/bizimle-elaqe', '2025-04-06 16:59:25', '2025-04-06 16:59:25', NULL),
(95, 47, 'mobile', 'https://midiya.az/en/bizimle-elaqe', '2025-04-06 16:59:26', '2025-04-06 16:59:26', NULL),
(96, 47, 'desktop', 'https://midiya.az/en/bizimle-elaqe', '2025-04-06 16:59:27', '2025-04-06 16:59:27', NULL),
(97, 47, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-G5NNva7h', '2025-04-06 16:59:48', '2025-04-06 16:59:48', NULL),
(98, 47, 'desktop', 'https://midiya.az/en/bizimle-elaqe', '2025-04-06 17:11:01', '2025-04-06 17:11:01', NULL),
(99, 47, 'desktop', 'https://midiya.az/en/bizimle-elaqe', '2025-04-06 17:11:05', '2025-04-06 17:11:05', NULL),
(100, 47, 'desktop', 'https://midiya.az/en/bizimle-elaqe', '2025-04-06 17:11:39', '2025-04-06 17:11:39', NULL),
(101, 47, 'desktop', 'https://midiya.az/en/bizimle-elaqe', '2025-04-06 17:11:42', '2025-04-06 17:11:42', NULL),
(102, 51, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:05', '2025-04-06 17:12:05', NULL),
(103, 51, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:08', '2025-04-06 17:12:08', NULL),
(104, 51, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:16', '2025-04-06 17:12:16', NULL),
(105, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:27', '2025-04-06 17:12:27', NULL),
(106, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:28', '2025-04-06 17:12:28', NULL),
(107, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:29', '2025-04-06 17:12:29', NULL),
(108, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:30', '2025-04-06 17:12:30', NULL),
(109, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:31', '2025-04-06 17:12:31', NULL),
(110, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:32', '2025-04-06 17:12:32', NULL),
(111, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:33', '2025-04-06 17:12:33', NULL),
(112, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:33', '2025-04-06 17:12:33', NULL),
(113, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:34', '2025-04-06 17:12:34', NULL),
(114, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:42', '2025-04-06 17:12:42', NULL),
(115, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:12:43', '2025-04-06 17:12:43', NULL),
(116, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:13:27', '2025-04-06 17:13:27', NULL),
(117, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:13:28', '2025-04-06 17:13:28', NULL),
(118, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:18:03', '2025-04-06 17:18:03', NULL),
(119, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:18:04', '2025-04-06 17:18:04', NULL),
(120, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:23:18', '2025-04-06 17:23:18', NULL),
(121, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:23:19', '2025-04-06 17:23:19', NULL),
(122, 51, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:23:27', '2025-04-06 17:23:27', NULL),
(123, 51, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:23:38', '2025-04-06 17:23:38', NULL),
(124, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:24:18', '2025-04-06 17:24:18', NULL),
(125, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:24:25', '2025-04-06 17:24:25', NULL),
(126, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:24:29', '2025-04-06 17:24:29', NULL),
(127, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:24:30', '2025-04-06 17:24:30', NULL),
(128, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:24:31', '2025-04-06 17:24:31', NULL),
(129, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:24:33', '2025-04-06 17:24:33', NULL),
(130, 51, 'mobile', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:24:34', '2025-04-06 17:24:34', NULL),
(131, 47, 'desktop', 'https://midiya.az/en/bizimle-elaqe', '2025-04-06 17:24:53', '2025-04-06 17:24:53', NULL),
(132, 51, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:26:44', '2025-04-06 17:26:44', NULL),
(133, 51, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-72CsHttj', '2025-04-06 17:32:24', '2025-04-06 17:32:24', NULL),
(134, 50, 'desktop', 'https://villa-baku.az/', '2025-04-06 17:40:53', '2025-04-06 17:40:53', NULL),
(135, 50, 'desktop', 'https://villa-baku.az/', '2025-04-06 17:41:08', '2025-04-06 17:41:08', NULL),
(136, 50, 'desktop', 'https://villa-baku.az/elaqe', '2025-04-06 17:41:27', '2025-04-06 17:41:27', NULL),
(137, 52, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-71ABysaS', '2025-04-06 17:48:06', '2025-04-06 17:48:06', NULL),
(138, 50, 'desktop', 'https://villa-baku.az/', '2025-04-06 19:06:49', '2025-04-06 19:06:49', NULL),
(139, 50, 'desktop', 'https://villa-baku.az/', '2025-04-06 19:28:44', '2025-04-06 19:28:44', NULL),
(140, 52, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-71ABysaS', '2025-04-06 21:33:42', '2025-04-06 21:33:42', NULL),
(141, 50, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-5xLC41zh', '2025-04-06 21:33:52', '2025-04-06 21:33:52', NULL),
(142, 50, 'desktop', 'https://villa-baku.az/tr/', '2025-04-07 05:59:08', '2025-04-07 05:59:08', NULL),
(143, 57, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-DozQHSlJ', '2025-04-07 08:52:04', '2025-04-07 08:52:04', NULL),
(144, 57, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-DozQHSlJ', '2025-04-07 08:52:40', '2025-04-07 08:52:40', NULL),
(145, 57, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-DozQHSlJ', '2025-04-07 08:52:47', '2025-04-07 08:52:47', NULL),
(146, 57, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-DozQHSlJ', '2025-04-07 08:53:04', '2025-04-07 08:53:04', NULL),
(147, 57, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-DozQHSlJ', '2025-04-07 08:53:18', '2025-04-07 08:53:18', NULL),
(148, 57, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-DozQHSlJ', '2025-04-07 08:53:50', '2025-04-07 08:53:50', NULL),
(153, 50, 'unknown', 'https://villa-baku.az/tr/', '2025-04-07 09:43:48', '2025-04-07 09:43:48', NULL),
(154, 52, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-71ABysaS', '2025-04-07 11:04:25', '2025-04-07 11:04:25', NULL),
(155, 50, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-5xLC41zh', '2025-04-07 11:04:52', '2025-04-07 11:04:52', NULL),
(156, 50, 'desktop', 'https://villa-baku.az/', '2025-04-07 13:31:52', '2025-04-07 13:31:52', NULL),
(157, 50, 'desktop', 'https://villa-baku.az/', '2025-04-07 13:32:35', '2025-04-07 13:32:35', NULL),
(158, 50, 'mobile', 'https://villa-baku.az/', '2025-04-07 13:33:45', '2025-04-07 13:33:45', NULL),
(159, 50, 'mobile', 'https://villa-baku.az/', '2025-04-07 13:34:00', '2025-04-07 13:34:00', NULL),
(160, 50, 'mobile', 'https://villa-baku.az/', '2025-04-07 14:02:37', '2025-04-07 14:02:37', NULL),
(161, 50, 'mobile', 'https://villa-baku.az/', '2025-04-07 14:02:54', '2025-04-07 14:02:54', NULL),
(162, 50, 'mobile', 'https://villa-baku.az/', '2025-04-07 14:03:28', '2025-04-07 14:03:28', NULL),
(163, 50, 'mobile', 'https://villa-baku.az/', '2025-04-07 14:11:03', '2025-04-07 14:11:03', NULL),
(164, 50, 'mobile', 'https://villa-baku.az/', '2025-04-07 14:11:46', '2025-04-07 14:11:46', NULL),
(165, 50, 'desktop', 'https://villa-baku.az/', '2025-04-07 14:26:52', '2025-04-07 14:26:52', NULL),
(166, 50, 'desktop', 'https://villa-baku.az/', '2025-04-07 14:44:57', '2025-04-07 14:44:57', NULL),
(167, 50, 'desktop', 'https://villa-baku.az/', '2025-04-07 15:08:00', '2025-04-07 15:08:00', NULL),
(168, 50, 'mobile', 'https://villa-baku.az/', '2025-04-07 18:32:19', '2025-04-07 18:32:19', NULL),
(169, 52, 'desktop', 'https://hiclient.midiya.az/customer-dashboard/widget/preview/W-71ABysaS', '2025-04-07 21:48:31', '2025-04-07 21:48:31', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `widget_videos`
--

CREATE TABLE `widget_videos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `widget_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `token` varchar(50) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `widget_videos`
--

INSERT INTO `widget_videos` (`id`, `widget_id`, `token`, `path`, `created_at`, `updated_at`, `deleted_at`) VALUES
(72, 0, 'p64mZwzWVxExTmBj92xT8wQQsuDuJn', 'widget_videos/widget_67f11676120ba.mp4', '2025-04-05 13:39:34', '2025-04-05 13:39:34', NULL),
(73, 0, '2uVgeOv2o6W1GFMRi3PClLz5MFKd1j', 'widget_videos/widget_67f1169c9b06c.mp4', '2025-04-05 13:40:12', '2025-04-05 13:40:12', NULL),
(74, 0, 'DzXq6ZgHxxo1SoOPIXuxpfUktcXgyq', 'widget_videos/widget_67f1169cc1b1e.mp4', '2025-04-05 13:40:12', '2025-04-05 13:40:12', NULL),
(75, 0, 'qHQQNtKmyR2izzwpzU4leSEFDDvyDf', 'widget_videos/widget_67f1169cc24e7.mp4', '2025-04-05 13:40:12', '2025-04-05 13:40:12', NULL),
(76, 0, 'ozMBxOBfUCSZy1b5kBuRNMEbbQtZaZ', 'widget_videos/widget_67f116f063a45.mp4', '2025-04-05 13:41:36', '2025-04-05 13:41:36', NULL),
(77, 0, '7Neuw6z2wvuCDTD4GJ2VSaq6AUKEA9', 'widget_videos/widget_67f11706316c7.mp4', '2025-04-05 13:41:58', '2025-04-05 13:41:58', NULL),
(78, 39, '0dHSue8cbX1l0cG50iKwmD88YUbjrT', 'widget_videos/widget_67f117360064a.mp4', '2025-04-05 13:42:46', '2025-04-05 13:43:09', NULL),
(79, 0, 'g73rm4VnCQjhaFwZ0ZqBAbfGB38is1', 'widget_videos/widget_67f1195dca0ab.mp4', '2025-04-05 13:51:57', '2025-04-05 13:51:57', NULL),
(80, 41, 'RFJdXv6270oaepL7bWT51bXwMtYBln', 'widget_videos/widget_67f119c7a9b2c.mp4', '2025-04-05 13:53:43', '2025-04-05 13:53:46', NULL),
(81, 0, 'f3O4yHFMgvvbCGWYsfl3t6bz3BsY6g', 'widget_videos/widget_67f11fc84ebeb.mp4', '2025-04-05 14:19:20', '2025-04-05 14:19:20', NULL),
(82, 42, '1kSbpCFDFRCKiKKl0lxHguJet4cAt4', 'widget_videos/widget_67f11fd9c4636.mp4', '2025-04-05 14:19:37', '2025-04-05 14:19:52', NULL),
(83, 0, 'FdhYdrJKCInmv7OF3Lm3oBmdIWtMNU', 'widget_videos/widget_67f1216aecfbc.mp4', '2025-04-05 14:26:18', '2025-04-05 14:26:18', NULL),
(84, 0, 'eUXdE6R4Cy1DkLdA6SDHRZUopKFQaK', 'widget_videos/widget_67f1226e984d0.mp4', '2025-04-05 14:30:38', '2025-04-05 14:30:38', NULL),
(85, 43, 'RdXOSZx1YkWS2zOEPT1SFG8HB1GN1l', 'widget_videos/widget_67f123114ee8e.mp4', '2025-04-05 14:33:21', '2025-04-05 14:33:40', NULL),
(86, 45, 'UVpJCQtcVdIWYyhyn0Qy3V2ut7AYgE', 'widget_videos/widget_67f126904154a.mp4', '2025-04-05 14:48:16', '2025-04-05 14:48:41', NULL),
(87, 0, '89mnOKjgAAPM3fmO2EiudOuKzJtNGM', 'widget_videos/widget_67f169226b5d5.mp4', '2025-04-05 19:32:18', '2025-04-05 19:32:18', NULL),
(88, 49, 'AVcpGfcCPmnOrbeNmnpkW0j6ZebRqm', 'widget_videos/widget_67f1ae7b8e2b7.mp4', '2025-04-06 00:28:11', '2025-04-06 00:28:19', NULL),
(89, 51, '5VWlHsVng0rMS90NAzfHZmyAEuMjA2', 'widget_videos/widget_67f296b6588ec.mp4', '2025-04-06 16:59:02', '2025-04-06 16:59:11', NULL),
(90, 52, 'BCWo1Z1S95negZYwzkNfW7FPG4rP9U', 'widget_videos/widget_67f2a102d969c.mp4', '2025-04-06 17:42:58', '2025-04-06 17:45:21', NULL);

--
-- Indexes for dumped tables
--

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
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category_post`
--
ALTER TABLE `category_post`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customers_email_unique` (`email`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `payment_tasks`
--
ALTER TABLE `payment_tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `post_galeries`
--
ALTER TABLE `post_galeries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `static_pages`
--
ALTER TABLE `static_pages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ticket_attachments`
--
ALTER TABLE `ticket_attachments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `translates`
--
ALTER TABLE `translates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `widgets`
--
ALTER TABLE `widgets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `widget_appearances`
--
ALTER TABLE `widget_appearances`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `widget_contacts`
--
ALTER TABLE `widget_contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `widget_contents`
--
ALTER TABLE `widget_contents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `widget_displays`
--
ALTER TABLE `widget_displays`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `widget_statistics`
--
ALTER TABLE `widget_statistics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `widget_statistics_widget_id_foreign` (`widget_id`);

--
-- Indexes for table `widget_videos`
--
ALTER TABLE `widget_videos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `category_post`
--
ALTER TABLE `category_post`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `payment_tasks`
--
ALTER TABLE `payment_tasks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `post_galeries`
--
ALTER TABLE `post_galeries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `static_pages`
--
ALTER TABLE `static_pages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `ticket_attachments`
--
ALTER TABLE `ticket_attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `translates`
--
ALTER TABLE `translates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `widgets`
--
ALTER TABLE `widgets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `widget_appearances`
--
ALTER TABLE `widget_appearances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `widget_contacts`
--
ALTER TABLE `widget_contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=199;

--
-- AUTO_INCREMENT for table `widget_contents`
--
ALTER TABLE `widget_contents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `widget_displays`
--
ALTER TABLE `widget_displays`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `widget_statistics`
--
ALTER TABLE `widget_statistics`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=170;

--
-- AUTO_INCREMENT for table `widget_videos`
--
ALTER TABLE `widget_videos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `widget_statistics`
--
ALTER TABLE `widget_statistics`
  ADD CONSTRAINT `widget_statistics_widget_id_foreign` FOREIGN KEY (`widget_id`) REFERENCES `widgets` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
