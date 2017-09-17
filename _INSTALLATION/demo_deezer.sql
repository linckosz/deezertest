-- phpMyAdmin SQL Dump
-- version 4.7.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 17, 2017 at 04:19 PM
-- Server version: 10.2.6-MariaDB
-- PHP Version: 7.0.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `demo_deezer`
--
CREATE DATABASE IF NOT EXISTS `demo_deezer` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `demo_deezer`;

-- --------------------------------------------------------

--
-- Table structure for table `playlist`
--

CREATE TABLE `playlist` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `md5` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'md5 (used to secure CRUD)',
  `created` bigint(20) UNSIGNED NOT NULL COMMENT 'Timestamp in Milliseconds',
  `updated` bigint(20) UNSIGNED NOT NULL COMMENT 'Timestamp in Milliseconds',
  `deleted` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Timestamp in Milliseconds',
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `favorite` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '0:non-favorite / 1:favorite'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `playlist`
--

INSERT INTO `playlist` (`id`, `md5`, `created`, `updated`, `deleted`, `user_id`, `name`, `favorite`) VALUES
(1, '54d40443deff03162a6ebb057c8380c8', 1505576211897, 1505665047073, NULL, 1, 'ивт List! 好é', 1),
(2, '8c8af352208316681250ff99b1514e61', 1505576268268, 1505635029630, NULL, 2, 's7owju7dqi4x', 1),
(3, '609b89e81bd77203c1d313c2961038e7', 1505576269092, 1505635029630, NULL, 2, 'r58ih3svym4665d', 0),
(4, '5c3b22f07fd11dc7f4236c5acf5ea5e3', 1505576269767, 1505635029630, NULL, 2, 'c1vzz268n8f1', 0),
(5, '4b07c3fe56b841975e6c3c61dfc55d99', 1505576270514, 1505635029630, NULL, 3, 'p21mt5gyqmo12qqr', 0),
(6, 'c9a5affc8d4c9eb6c84288193b6a5abb', 1505576271275, 1505635029630, NULL, 1, 'jtu4riw86io', 0),
(7, '53c96df0d938bef2a05fe817df6e064d', 1505576272061, 1505635029630, NULL, 2, '2qwib2', 0),
(8, '52c9724f4b499e002c948857213b8e9f', 1505576272808, 1505635029630, NULL, 1, 'bt2ppau', 0),
(9, '5297ce024d79ff1baf60874774fa365e', 1505576273575, 1505635029630, NULL, 2, 'y97ibxlos4wiaqm9', 0),
(10, 'c79fdb3ebd89dbf4648889db6c68640e', 1505576274388, 1505635029630, NULL, 1, 'kzlui4u265shr7gundg', 0);

-- --------------------------------------------------------

--
-- Table structure for table `playlist_x_song`
--

CREATE TABLE `playlist_x_song` (
  `playlist_id` bigint(20) UNSIGNED NOT NULL,
  `song_id` bigint(20) UNSIGNED NOT NULL,
  `attached` tinyint(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `playlist_x_song`
--

INSERT INTO `playlist_x_song` (`playlist_id`, `song_id`, `attached`) VALUES
(1, 1, 1),
(1, 5, 0),
(1, 10, 1),
(1, 16, 1),
(1, 30, 1),
(1, 32, 1),
(1, 42, 1),
(3, 2, 1),
(3, 8, 1),
(3, 19, 1),
(3, 25, 1),
(3, 41, 1),
(6, 7, 1),
(6, 14, 1),
(6, 21, 1);

-- --------------------------------------------------------

--
-- Table structure for table `song`
--

CREATE TABLE `song` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `md5` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'md5 (used to secure CRUD)',
  `created` bigint(20) UNSIGNED NOT NULL COMMENT 'Timestamp in Milliseconds',
  `updated` bigint(20) UNSIGNED NOT NULL COMMENT 'Timestamp in Milliseconds',
  `deleted` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Timestamp in Milliseconds',
  `name` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` smallint(5) UNSIGNED NOT NULL COMMENT 'Duration in seconds'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `song`
--

INSERT INTO `song` (`id`, `md5`, `created`, `updated`, `deleted`, `name`, `duration`) VALUES
(1, '89bcee85e5d53ee79d70ebd026a7c188', 1505570949369, 1505570949369, NULL, 'bruno先 é*&\' \" иве < .mp3', 120),
(2, 'd84e43376803864dd43925bdaffd7778', 1505575902982, 1505575902982, NULL, 'fbabxg66ozzw1vuuxmt.mp3', 101),
(3, '73ca6644ead0236c04eca29d7d572237', 1505575912365, 1505575912365, NULL, '4beft94b9aad8v.mp3', 418),
(4, '68d1f4dea3f09d5fb38b93e024d4f3c4', 1505575913267, 1505575913267, NULL, '2olr1l7htb1g1r.mp3', 311),
(5, 'e70ec532c5a4da739965216bfb733730', 1505575913742, 1505575913742, NULL, 'lvwtof2nbyacvw.mp3', 441),
(6, '6f858db36c21fecbd2d540b332cd7446', 1505575914383, 1505575914383, NULL, '2nztowcirm8vqxsae.mp3', 208),
(7, '50d82e8b9ae037f3a1eaec414070556c', 1505575914998, 1505575914998, NULL, '44khpns6dc.mp3', 148),
(8, 'e46fd49a69ec9514184b644c4c85b611', 1505575917633, 1505575917633, NULL, 'xvxlzi1z49i.mp3', 538),
(9, 'bc2e08e1c401c2a63c5bdd7494faa54f', 1505575918477, 1505575918477, NULL, '5f4vhavdwi9p2w44.mp3', 470),
(10, 'c74bd099e57cf664d8152c2b1a2e6967', 1505575919169, 1505575919169, NULL, 'g757u9mf3feuad.mp3', 247),
(11, '01780f3925a7701a2feff7db4f4f6ab7', 1505575919816, 1505575919816, NULL, 'luuk4p.mp3', 294),
(12, 'dd5fb1146598e9a55daff86ee84ca70a', 1505575920407, 1505575920407, NULL, '23senqrqe44.mp3', 468),
(13, 'a0054f6ca0d0b93a0c91d81ff4e8002d', 1505575921017, 1505575921017, NULL, 'oz9q4w2gsogzs8iy2.mp3', 69),
(14, '6805f92718b4d107fabfab6d99d9a4f7', 1505575921601, 1505575921601, NULL, 'nx434jjjjukd1ky6.mp3', 410),
(15, '3ff507bbf229360c7d7f0300e6d8e10c', 1505575922213, 1505575922213, NULL, 'r6xs7o2mavsemh8glgr.mp3', 369),
(16, '280e0fdb4847176e091a90b6efbc32b9', 1505575922793, 1505575922793, NULL, '8vbzsijd3bcjcsd2.mp3', 311),
(17, 'e3d3465cf79c8741ff6f43ece08a39d7', 1505575923354, 1505575923354, NULL, 'ihfgdtqlwudlcflve.mp3', 524),
(18, 'd0fb2db39a24aec201cda05cd852d00f', 1505575923932, 1505575923932, NULL, 'a4jmhz1ytl.mp3', 258),
(19, 'd11f4b6c6cf40a549ef34da5bf5a7191', 1505575924534, 1505575924534, NULL, 'ujfrj4y86wqf.mp3', 207),
(20, '33639064674981b78b951b3bd789aaea', 1505575925113, 1505575925113, NULL, 'aktzpd74hmu8ruhsa.mp3', 431),
(21, 'eecd39896d8382fb98379398e27683c9', 1505575925693, 1505575925693, NULL, '68zckhfhdcue8phwk.mp3', 508),
(22, '05f0a462a84c918a7a95095722e8b929', 1505575926284, 1505575926284, NULL, '72y2ifhi399.mp3', 153),
(23, 'dffcd0d29d86fff0410354a4eb1a0a57', 1505575926875, 1505575926875, NULL, '9p1pbt6pcej6p.mp3', 72),
(24, '02f0c32cf79ace8ce652a5db597f5a5a', 1505575927499, 1505575927499, NULL, 'yfp8o886bamw.mp3', 210),
(25, '894b7c25e1c367d7e348596a74e07017', 1505575928200, 1505575928200, NULL, '985x5cbj8byr5x76ml.mp3', 581),
(26, '23c3033e2091e7df4b5ef331feb56684', 1505575928817, 1505575928817, NULL, 'zg4869e4g72vg.mp3', 271),
(27, 'e8b19ecd4ccf8dca9bbd4f8b598cd04e', 1505575929462, 1505575929462, NULL, 'qcdrrxvj.mp3', 550),
(28, 'd9cbd1f9bf5b4cf2677b9a2c022553d9', 1505575930109, 1505575930109, NULL, 'k8v352l3d3yb.mp3', 352),
(29, '436457fe6a307216b4a144dbd558a343', 1505575930766, 1505575930766, NULL, 'cktbs3ykx51ymur.mp3', 255),
(30, '21ff6569c2fb9fcc678249d1f2c63084', 1505575931398, 1505575931398, NULL, 'sfvcqn6j.mp3', 89),
(31, '2a2afb1d83ada9cf56e4230895e82256', 1505575931980, 1505575931980, NULL, 'jqsvgi.mp3', 539),
(32, '7735989c057884ecc993f3643fc1923e', 1505575932574, 1505575932574, NULL, 'ilvzu2e71m7q9v.mp3', 455),
(33, '86c3bc463f023812d6e514627f68b95a', 1505575933258, 1505575933258, NULL, 'wbjkzjdc.mp3', 428),
(34, '705d1dde61b009baccfd54fba87a2cf4', 1505575933895, 1505575933895, NULL, 'o9dvanirz1ybsqu2m.mp3', 363),
(35, '046de8c87f2eb9ef1e6593e922cb134f', 1505575934545, 1505575934545, NULL, 'rzqcwol5nd2.mp3', 196),
(36, 'f2633f2b11539a24097652c879109390', 1505575935161, 1505575935161, NULL, 'f76cx11lirb8q6.mp3', 273),
(37, '1a4ee013a6b0268bc24ae5f26bef6c8a', 1505575935790, 1505575935790, NULL, 'kz7ytrb14azs2832r.mp3', 236),
(38, 'b8f5c6ddfe4f5eb1b1eaeec8b72abb81', 1505575936433, 1505575936433, NULL, '8yhvu5pzs951ahke8ad.mp3', 439),
(39, '6fdc4627041a203d20122a8c8908c7b1', 1505575937562, 1505575937562, NULL, '22naszow311lclleyn8.mp3', 418),
(40, 'b382786094b3244ed811439e45da0633', 1505575938321, 1505575938321, NULL, 'axjtpa5ooa1o.mp3', 168),
(41, 'e9af94ee7536a5a934fea5345b663d09', 1505575938967, 1505575938967, NULL, '4fo91xsfhvohbkr7n6.mp3', 438),
(42, '96efdc79f99f34853094030800e744c5', 1505575939639, 1505575939639, NULL, 'Song to be added/removed .mp3', 503),
(43, '44030800e7c596efdc79f99f34853094', 1505575939640, 1505575939640, NULL, 'c596efdc79f.mp3', 401);

-- --------------------------------------------------------

--
-- Table structure for table `translation`
--

CREATE TABLE `translation` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `en` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `fr` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `translation`
--

INSERT INTO `translation` (`id`, `en`, `fr`) VALUES
(1, 'Sorry, we could not understand the request.', 'Désolé, nous n\'avons pas su interpréter la demande.'),
(2, 'An error has occurred while processing your request, the Deezer team has been notified of the problem.', 'Une erreur est survenue lors du traitement de votre demande, l\'équipe de Deezer a été informée du problème.'),
(3, 'You are not allowed to access the server.', 'Vous n\'êtes pas autorisé à accéder au serveur.'),
(4, 'Operation failed.', 'L\'opération a échoué.'),
(1000, 'Clear', 'Effacer'),
(1001, 'Get a user information (user.id:1)', 'Récupérer les données d\'un utilisateur (user.id:1)'),
(1002, 'Get a song information (song.id:1)', 'Récupérer les données d\'une chanson (song.id:1)'),
(1003, 'Get all songs from a user\'s favorite playlist (user.id:1)', 'Récupérer toutes les chansons de la liste favorite d\'un utilisateur (user.id:1)'),
(1004, 'Add a song into a user\'s playlist (playlist.id:1 [the favorite] / song.id:5)', 'Ajouter une chanson dans une liste d\'un utilisateur (playlist.id:1 [la favorite] / song.id:5)'),
(1005, 'Remove a song from a user\'s playlist (playlist.id:1 [the favorite] / song.id:5)', 'Supprimer une chanson d\'une liste d\'un utilisateur (playlist.id:1 [la favorite] / song.id:5)');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `md5` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'md5 (used to secure CRUD)',
  `created` bigint(20) UNSIGNED NOT NULL COMMENT 'Timestamp in Milliseconds',
  `updated` bigint(20) UNSIGNED NOT NULL COMMENT 'Timestamp in Milliseconds',
  `deleted` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Timestamp in Milliseconds',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'password_hash(''pwd'', PASSWORD_BCRYPT)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `md5`, `created`, `updated`, `deleted`, `name`, `email`, `password`) VALUES
(1, '8f30ddb8d80ccd2b3acc2728bc3848fb', 1505555596491, 1505555596491, NULL, 'привет Martin 先生 é', 'brunoocto@gmail.com', '$2y$10$zrC04Y/xM0M4eE5zsSoCr.9J5k0ulNUfE6dwTZqNEbamwCrnt0gDG'),
(2, '146c5c0bfc75a2452425c163b9a1f715', 1505576060272, 1505576060272, NULL, 'hf7wkmbvknp8bzrloul', 'jbuo84cuhqln8d24herl@deezer.bru', '$2y$10$a5UNhhrA6Za7xvoS9GFfrOI0pLunv6IZVYgx3/F43kzAdHgTNIoP2'),
(3, '33a5813ad62d559e3ecb8ab7902eda81', 1505576061114, 1505576061114, NULL, 'bvygg9m7ep8ub5cjc', 'f67s441w4x7kgan4@deezer.bru', '$2y$10$eoDnDI7Ct4gj5t5eGE7Aoehan7Pp2RtMmVkUFYJFzjTttlQJSgOgS'),
(4, 'a96c9e975bb85810c1f982f6028389f2', 1505576061813, 1505576061813, NULL, 'lqu5b5', '26t1xdr7kd46549wlm@deezer.bru', '$2y$10$wbRHPDhRMJV48auYzpvm0.jL1NkdmEQbTxvp7jD6XZM8YThtwGqm2'),
(5, '05ccf69928e5f56a1334391a6998c26e', 1505576062515, 1505576062515, NULL, '9cyl3m', 'e7gz9vwizbkmjhe@deezer.bru', '$2y$10$/WeUhOG6vV5osPGGD49wPO.UEmx2X9yAvk7KiOBOG77W4ntT2BS/q'),
(6, '9221ba4f7d21b7963b023221a5177bce', 1505576063230, 1505576063230, NULL, '2xav2fst5zyrxoxdkqxd', 'mprzu6nj82ssrxplk9r3@deezer.bru', '$2y$10$VhqjXAwleVdYhzMAxoJL7.6GdNB0O6vgvXsVS6/O3oHMvVNV3flhq'),
(7, 'b654347b5fc686d7f701b2668b17aa85', 1505576063873, 1505576063873, NULL, '3s5jgsb7v78z53ea', 'm7m5xdzai@deezer.bru', '$2y$10$iNzRZ2Z97XVEXCnrIHHxUue3Zhkvm/VUsrmRQG7cHdH0GZIJljtDy');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `playlist`
--
ALTER TABLE `playlist`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `playlist_x_song`
--
ALTER TABLE `playlist_x_song`
  ADD PRIMARY KEY (`playlist_id`,`song_id`);

--
-- Indexes for table `song`
--
ALTER TABLE `song`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `translation`
--
ALTER TABLE `translation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `playlist`
--
ALTER TABLE `playlist`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `song`
--
ALTER TABLE `song`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;
--
-- AUTO_INCREMENT for table `translation`
--
ALTER TABLE `translation`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1007;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


GRANT USAGE ON *.* TO 'demo_deezer'@'192.168.1.%' IDENTIFIED BY PASSWORD '*BEEE119615AF49C9E32E89D5EC51152312F1309E';

GRANT SELECT, INSERT, UPDATE ON `demo\_deezer`.* TO 'demo_deezer'@'192.168.1.%';
