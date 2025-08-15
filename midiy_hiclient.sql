-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: dedi7494.your-server.de
-- Generation Time: Mar 20, 2025 at 11:19 AM
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

INSERT INTO `customers` (`id`, `name_surname`, `email`, `status`, `image`, `integration_id`, `password`, `phone_number`, `company_name`, `remember_token`, `deleted_at`, `created_at`, `updated_at`) VALUES
(15, 'Vusal Ferzeliyev', 'vusalferzeliyev5@gmail.com', 1, 'storage/customer/profile/google_108747585877867933399_1742460326.jpg', '108747585877867933399', '$2y$10$6RLE9pJlaOs3oogKhke3O.sOVZ7OqOi2dvTjiuwZ.P5Aqif7niDtC', NULL, 'Midiya', 'm29h227bA6kEWS33Hzr65w0XUDxU4CgLcrFEJm9TFt1U3bNji6p3jQ9o5T0c', NULL, '2025-03-12 19:26:41', '2025-03-20 11:45:26'),
(16, 'Support Team', 'support@hiclient.com', 1, NULL, NULL, '$2y$10$OL3uby5wNJwbo.h3lPnIFO4XHtfPFRIHqnsFHtcSIGUTWNZt/PqXW', NULL, NULL, NULL, NULL, '2025-03-12 19:31:35', '2025-03-12 19:54:55'),
(17, 'Acer Nitro 5', 'acern512@gmail.com', 1, 'storage/customer/profile/Dklm8yknNvMmnU8DiALVEEyIYVbhvspIsCYrFyG9.jpg', '115623646115458119974', '$2y$10$gpvx.BfJZRkm8Q4TtKz9BeTS9B8dEJq4ll8E8w5flpuPP1JRdTh0.', '+994508699858', NULL, NULL, NULL, '2025-03-12 19:32:23', '2025-03-13 19:05:56'),
(18, 'Hamidi Rasim', 'hamidirasim@gmail.com', 1, 'storage/customer/profile/mq1STILsh7QFtPIz6g0aZ916c3kVY1ZF1ZSsfgpe.png', '117841795278738486845', '$2y$10$NFler.SWdZXiSJrKK/qM1ue29/T1dTb33fEDbJQnB.33s.TN8TKpK', '0708173241', 'Midiya', 'zZ2bQrlD9llAert4VQplGZfoyewY5OoAyOJwUXJhJHr6Of6mCuUDO5vLaHDA', NULL, '2025-03-12 19:34:13', '2025-03-17 18:25:08'),
(19, 'Midiya Agency', 'midiya.agency@gmail.com', 1, 'storage/customer/profile/google_108141346101369851567_1741814676.jpg', '108141346101369851567', '$2y$10$EfzSIuQ6uZezcGgeTK2BD.T3lxvlIEi/otdwbCj83zox9SeNUp0Kq', NULL, NULL, NULL, NULL, '2025-03-13 00:24:36', '2025-03-13 00:24:36'),
(20, 'Server Midiya', 'midiyaserver@gmail.com', 1, 'storage/customer/profile/google_101475486497153163943_1741852577.jpg', '101475486497153163943', '$2y$10$WjpMo1KH7TZ.s94NGoikkOksuuCXDyvEKgGNQpYkZxpJELzmmDR6a', NULL, NULL, NULL, NULL, '2025-03-13 10:56:17', '2025-03-13 10:56:17');

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
(32, '2025_03_15_022302_create_widget_display_table', 7);

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
(9, 15, 'Midiya Agency', 'contact', 'Active', 'https://midiya.az', 'W-fnYEAKRE', 6, 0, 0.00, '2025-03-18 19:49:18', '2025-03-18 20:20:14'),
(11, 15, 'INI Company', 'video', 'Active', 'https://ini.az', 'W-N4b9GwhM', 8, 0, 0.00, '2025-03-18 20:20:48', '2025-03-20 13:11:44'),
(12, 15, 'Midiya Agency', 'video', 'Active', NULL, 'W-G5YvAbJt', 45, 0, 0.00, '2025-03-18 20:24:09', '2025-03-20 12:54:21'),
(13, 18, 'midiya', 'text', 'Active', 'https://midiya.az', 'W-bR79iP9S', 1, 0, 0.00, '2025-03-18 22:48:01', '2025-03-20 12:15:38'),
(14, 15, 'Salaaam', 'video', 'Active', 'https://midiya.az', 'W-MR6G2zUp', 15, 0, 0.00, '2025-03-20 12:55:55', '2025-03-20 13:12:35'),
(15, 15, 'Midiya Agency', 'video', 'Active', 'https://midiya.az', 'W-T3nBi5uu', 3, 0, 0.00, '2025-03-20 13:14:33', '2025-03-20 13:17:26');

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
(1, 8, '#ffffff', '#333333', '#ee7c5d'),
(2, 9, '#ffffff', '#333333', '#ee7c5d'),
(3, 10, '#000000', '#671313', '#f13b09'),
(4, 11, '#ffffff', '#333333', '#ee7c5d'),
(5, 12, '#ffffff', '#d62929', '#e65a33'),
(6, 13, '#978282', '#393232', '#f0ade7'),
(7, 14, '#ffffff', '#333333', '#ee7c5d'),
(8, 15, '#ffffff', '#a99393', '#100b09');

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
  `display_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 8, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', 'https://www.youtube.com/watch?v=dOevPvtODa0&ab_channel=ATVMusic', NULL),
(2, 9, 'Salaaaam! 👋', 'Uzunuzden ne yagir?', 'https://www.youtube.com/watch?v=dOevPvtODa0&ab_channel=ATVMusic', NULL),
(3, 10, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', 'https://www.youtube.com/watch?v=dOevPvtODa0&ab_channel=ATVMusic', NULL),
(4, 11, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(5, 12, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?', NULL, NULL),
(6, 13, 'Hi there! 👋', 'I\'m Sarah from PopConnect. How can I help you today?dssd', 'https://www.youtube.com/shorts/o-QFyGVpoKs', 'https://www.youtube.com/shorts/o-QFyGVpoKs'),
(7, 14, 'Salam qaqaşşşşşşş! 👋', 'Nətərsüz?', NULL, NULL),
(8, 15, 'Hello! 👋', 'How are your?', 'https://www.youtube.com/watch?v=dOevPvtODa0&ab_channel=ATVMusic', NULL);

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
(1, 8, 'delay5', 'bottom-right', 'all', 'all', NULL),
(2, 9, 'delay5', 'bottom-right', 'all', 'all', NULL),
(3, 10, 'delay5', 'bottom-right', 'specific', 'all', '[\"https:\\/\\/midiya.az\\/en\\/haqqimizda\\r\",\"https:\\/\\/midiya.az\\/en\\/portfolio\"]'),
(4, 11, 'delay5', 'bottom-right', 'home', 'all', NULL),
(5, 12, 'delay5', 'bottom-right', 'all', 'all', NULL),
(6, 13, 'delay5', 'bottom-left', 'all', 'all', NULL),
(7, 14, 'delay5', 'bottom-left', 'all', 'all', NULL),
(8, 15, 'immediate', 'top-right', 'all', 'all', NULL);

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
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `ticket_attachments`
--
ALTER TABLE `ticket_attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `widget_appearances`
--
ALTER TABLE `widget_appearances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `widget_contacts`
--
ALTER TABLE `widget_contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `widget_contents`
--
ALTER TABLE `widget_contents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `widget_displays`
--
ALTER TABLE `widget_displays`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
