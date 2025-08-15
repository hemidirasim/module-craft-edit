-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 10.66.4.2
-- Generation Time: May 13, 2025 at 04:18 PM
-- Server version: 5.7.32-log
-- PHP Version: 7.3.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db1144`
--

-- --------------------------------------------------------

--
-- Table structure for table `post`
--

CREATE TABLE `post` (
  `id` int(10) UNSIGNED NOT NULL,
  `post_type_id` int(10) UNSIGNED DEFAULT NULL,
  `post_type_id_two` int(11) UNSIGNED DEFAULT NULL,
  `is_base_post` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `staff_id` varchar(22) DEFAULT '28',
  `staff_id_two` varchar(11) DEFAULT NULL,
  `special_url` varchar(255) DEFAULT NULL,
  `youtube` text,
  `gallery` text,
  `img_url` varchar(256) DEFAULT NULL,
  `show_home` varchar(10) NOT NULL DEFAULT '0',
  `projects` varchar(444) DEFAULT '0',
  `partners` varchar(60) DEFAULT NULL,
  `event_date` int(11) DEFAULT NULL,
  `post_date` int(10) UNSIGNED DEFAULT NULL,
  `partnsers_token` varchar(255) DEFAULT NULL,
  `post_token` varchar(555) DEFAULT NULL,
  `viewed` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `status` int(10) UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `post`
--

INSERT INTO `post` (`id`, `post_type_id`, `post_type_id_two`, `is_base_post`, `staff_id`, `staff_id_two`, `special_url`, `youtube`, `gallery`, `img_url`, `show_home`, `projects`, `partners`, `event_date`, `post_date`, `partnsers_token`, `post_token`, `viewed`, `sort_order`, `status`) VALUES
(1760, NULL, NULL, 0, 'Seçim edin', 'Seçim edin', '', 'https://www.youtube.com/watch?v=lVvQdjo_H6w', NULL, '/uploads/Lw2etE1znoXy.jpg', '0', '', '', NULL, 1708417680, NULL, '73ff592eb17f6dbf', 0, 0, 1),
(1761, NULL, NULL, 0, 'Seçim edin', 'Seçim edin', '', '', NULL, '/uploads/tQXJIvHjTZ5G.jpg', '0', '', '155', NULL, 1703331180, '034284752dea530a', '1fa04665ccb400cd', 0, 0, 1),
(1762, NULL, NULL, 0, '38', 'Seçim edin', '', '', NULL, '/uploads/MAtxu4OcRSnK.jpg', '0', 'cbbeed724d7f7fc6', '', NULL, 1746707280, NULL, '956464e453a41186', 0, 0, 1),
(1763, NULL, NULL, 0, '38', 'Seçim edin', '', '', NULL, '/uploads/tB8ev3onY61R.jpg', '0', 'cbbeed724d7f7fc6', '', NULL, 1746275640, NULL, '395c385f5edc2763', 0, 0, 1),
(1764, NULL, NULL, 0, 'Seçim edin', 'Seçim edin', '/uploads/36XKziwkOHTo.pdf', '', NULL, '/uploads/h5asi6o2WfFM.jpg', '0', '', '', NULL, 1747029480, NULL, '1f1495c00230d738', 0, 0, 1),
(1767, NULL, NULL, 0, '12', 'Seçim edin', '', '', NULL, '/uploads/NLFlOUZkXgmc.jpg', '0', '', '', NULL, 1747114920, NULL, 'f3fedd76a21038d6', 0, 0, 1),
(1768, NULL, NULL, 0, 'Seçim edin', 'Seçim edin', '/uploads/xuLiBgHawyp7.pdf', '', NULL, '/uploads/794W5Mj1PLac.jpg', '0', '', '', NULL, 1747115580, NULL, 'a24fe92966b07098', 0, 0, 1),
(1769, NULL, NULL, 0, '10', 'Seçim edin', '', '', NULL, '/uploads/gwQtvN4KVfqY.jpg', '0', '', '', NULL, 1747121640, NULL, '0224aea57f8d22cf', 0, 0, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_type_id` (`post_type_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `post`
--
ALTER TABLE `post`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1770;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
