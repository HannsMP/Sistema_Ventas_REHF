-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-12-2024 a las 03:09:23
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `rehf`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_acceso`
--

CREATE TABLE `tb_acceso` (
  `id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `permiso_id` int(11) NOT NULL DEFAULT 0,
  `disabled_id` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_acceso`
--

INSERT INTO `tb_acceso` (`id`, `menu_id`, `rol_id`, `permiso_id`, `disabled_id`) VALUES
(1, 17, 1, 63, 0),
(2, 17, 2, 51, 0),
(3, 17, 3, 0, 62),
(4, 17, 4, 0, 62),
(5, 17, 5, 0, 62),
(6, 18, 1, 63, 0),
(7, 18, 2, 16, 47),
(8, 18, 3, 0, 47),
(9, 18, 4, 0, 47),
(10, 18, 5, 0, 47),
(11, 19, 1, 63, 0),
(12, 19, 2, 2, 61),
(13, 19, 3, 0, 61),
(14, 19, 4, 0, 61),
(15, 19, 5, 0, 61),
(16, 20, 1, 63, 0),
(17, 20, 2, 1, 62),
(18, 20, 3, 0, 62),
(19, 20, 4, 0, 62),
(20, 20, 5, 0, 62),
(21, 21, 1, 63, 0),
(22, 21, 2, 0, 59),
(23, 21, 3, 0, 59),
(24, 21, 4, 0, 59),
(25, 21, 5, 0, 59),
(26, 22, 1, 63, 0),
(27, 22, 2, 0, 55),
(28, 22, 3, 0, 55),
(29, 22, 4, 0, 55),
(30, 22, 5, 0, 55),
(81, 1, 1, 63, 0),
(82, 1, 2, 1, 62),
(83, 1, 3, 1, 62),
(84, 1, 4, 1, 62),
(85, 1, 5, 1, 62),
(86, 2, 1, 63, 0),
(87, 2, 2, 1, 62),
(88, 2, 3, 1, 62),
(89, 2, 4, 1, 62),
(90, 2, 5, 1, 62),
(91, 3, 1, 63, 0),
(92, 3, 2, 1, 62),
(93, 3, 3, 1, 62),
(94, 3, 4, 1, 62),
(95, 3, 5, 1, 62),
(96, 4, 1, 63, 0),
(97, 4, 2, 1, 62),
(98, 4, 3, 1, 62),
(99, 4, 4, 0, 62),
(100, 4, 5, 0, 63),
(101, 5, 1, 63, 0),
(102, 5, 2, 63, 0),
(103, 5, 3, 23, 40),
(104, 5, 4, 0, 60),
(105, 5, 5, 0, 63),
(106, 6, 1, 63, 0),
(107, 6, 2, 63, 0),
(108, 6, 3, 23, 40),
(109, 6, 4, 0, 60),
(110, 6, 5, 0, 63),
(111, 7, 1, 63, 0),
(112, 7, 2, 63, 0),
(113, 7, 3, 23, 40),
(114, 7, 4, 0, 60),
(115, 7, 5, 0, 63),
(116, 8, 1, 63, 0),
(117, 8, 2, 1, 62),
(118, 8, 3, 1, 62),
(119, 8, 4, 1, 62),
(120, 8, 5, 0, 63),
(121, 9, 1, 63, 0),
(122, 9, 2, 33, 0),
(123, 9, 3, 1, 0),
(124, 9, 4, 0, 0),
(125, 9, 5, 0, 63),
(126, 10, 1, 63, 0),
(127, 10, 2, 1, 62),
(128, 10, 3, 1, 62),
(129, 10, 4, 0, 62),
(130, 10, 5, 0, 63),
(131, 11, 1, 63, 0),
(132, 11, 2, 3, 0),
(133, 11, 3, 3, 0),
(134, 11, 4, 3, 0),
(135, 11, 5, 0, 63),
(136, 12, 1, 63, 0),
(137, 12, 2, 0, 0),
(138, 12, 3, 0, 0),
(139, 12, 4, 0, 0),
(140, 12, 5, 0, 63),
(141, 13, 1, 63, 0),
(142, 13, 2, 1, 62),
(143, 13, 3, 0, 63),
(144, 13, 4, 0, 63),
(145, 13, 5, 0, 63),
(146, 14, 1, 63, 0),
(147, 14, 2, 13, 18),
(148, 14, 3, 1, 18),
(149, 14, 4, 0, 18),
(150, 14, 5, 0, 63),
(151, 15, 1, 63, 0),
(152, 15, 2, 51, 0),
(153, 15, 3, 0, 63),
(154, 15, 4, 0, 63),
(155, 15, 5, 0, 63),
(156, 16, 1, 63, 0),
(157, 16, 2, 1, 62),
(158, 16, 3, 0, 63),
(159, 16, 4, 0, 63),
(160, 16, 5, 0, 63),
(161, 23, 1, 63, 0),
(162, 23, 2, 1, 62),
(163, 23, 3, 0, 62),
(164, 23, 4, 0, 62),
(165, 23, 5, 0, 62),
(166, 24, 1, 63, 0),
(167, 24, 2, 0, 59),
(168, 24, 3, 0, 59),
(169, 24, 4, 0, 59),
(170, 24, 5, 0, 59),
(171, 25, 1, 63, 0),
(172, 25, 2, 0, 61),
(173, 25, 3, 0, 61),
(174, 25, 4, 0, 61),
(175, 25, 5, 0, 61),
(181, 26, 1, 63, 0),
(182, 26, 2, 1, 62),
(183, 26, 3, 1, 62),
(184, 26, 4, 1, 62),
(185, 26, 5, 0, 62),
(186, 27, 1, 63, 0),
(187, 27, 2, 63, 0),
(188, 27, 3, 23, 0),
(189, 27, 4, 3, 0),
(190, 27, 5, 0, 62),
(191, 28, 1, 63, 0),
(192, 28, 2, 2, 61),
(193, 28, 3, 2, 61),
(194, 28, 4, 2, 61),
(195, 28, 5, 0, 61),
(196, 29, 1, 63, 0),
(197, 29, 2, 8, 55),
(198, 29, 3, 0, 55),
(199, 29, 4, 0, 55),
(200, 29, 5, 0, 55),
(206, 31, 1, 63, 0),
(207, 31, 2, 0, 62),
(208, 31, 3, 0, 62),
(209, 31, 4, 0, 62),
(210, 31, 5, 0, 62),
(211, 32, 1, 63, 0),
(212, 32, 2, 2, 61),
(213, 32, 3, 2, 61),
(214, 32, 4, 2, 61),
(215, 32, 5, 0, 61),
(216, 33, 1, 63, 0),
(217, 33, 2, 1, 62),
(218, 33, 3, 0, 62),
(219, 33, 4, 0, 62),
(220, 33, 5, 0, 62),
(226, 35, 1, 63, 0),
(227, 35, 2, 16, 47),
(228, 35, 3, 16, 47),
(229, 35, 4, 16, 47),
(230, 35, 5, 0, 47),
(231, 36, 1, 63, 0),
(232, 36, 2, 4, 59),
(233, 36, 3, 4, 59),
(234, 36, 4, 4, 59),
(235, 36, 5, 0, 59),
(236, 37, 1, 63, 0),
(237, 37, 2, 4, 59),
(238, 37, 3, 4, 59),
(239, 37, 4, 4, 59),
(240, 37, 5, 0, 59),
(241, 38, 1, 63, 0),
(242, 38, 2, 4, 59),
(243, 38, 3, 4, 59),
(244, 38, 4, 4, 59),
(245, 38, 5, 0, 59),
(246, 39, 1, 63, 0),
(247, 39, 2, 1, 62),
(248, 39, 3, 1, 62),
(249, 39, 4, 1, 62),
(250, 39, 5, 0, 62),
(251, 40, 1, 63, 0),
(252, 40, 2, 63, 0),
(253, 40, 3, 23, 0),
(254, 40, 4, 3, 0),
(255, 40, 5, 0, 62),
(256, 41, 1, 63, 0),
(257, 41, 2, 2, 61),
(258, 41, 3, 2, 61),
(259, 41, 4, 2, 61),
(260, 41, 5, 0, 61),
(261, 42, 1, 63, 0),
(262, 42, 2, 8, 55),
(263, 42, 3, 8, 55),
(264, 42, 4, 8, 55),
(265, 42, 5, 0, 55),
(271, 44, 1, 63, 0),
(272, 44, 2, 16, 47),
(273, 44, 3, 16, 47),
(274, 44, 4, 0, 47),
(275, 44, 5, 0, 47),
(276, 45, 1, 63, 0),
(277, 45, 2, 4, 59),
(278, 45, 3, 4, 59),
(279, 45, 4, 0, 59),
(280, 45, 5, 0, 59),
(281, 46, 1, 63, 0),
(282, 46, 4, 1, 62),
(283, 46, 2, 1, 62),
(284, 46, 3, 1, 62),
(285, 46, 5, 1, 62),
(286, 47, 1, 63, 0),
(287, 47, 4, 1, 62),
(288, 47, 2, 1, 62),
(289, 47, 3, 1, 62),
(290, 47, 5, 1, 62),
(291, 54, 1, 63, 0),
(292, 54, 2, 1, 62),
(293, 54, 3, 0, 62),
(294, 54, 4, 0, 62),
(295, 54, 5, 0, 62),
(296, 55, 1, 63, 0),
(297, 55, 2, 0, 55),
(298, 55, 3, 0, 55),
(299, 55, 4, 0, 55),
(300, 55, 5, 0, 55),
(301, 56, 1, 63, 0),
(302, 56, 2, 0, 62),
(303, 56, 3, 0, 62),
(304, 56, 4, 0, 62),
(305, 56, 5, 0, 62),
(306, 57, 1, 63, 0),
(307, 57, 2, 0, 59),
(308, 57, 3, 0, 59),
(309, 57, 4, 0, 59),
(310, 57, 5, 0, 59),
(321, 60, 1, 63, 0),
(322, 60, 2, 8, 55),
(323, 60, 3, 8, 55),
(324, 60, 4, 8, 55),
(325, 60, 5, 0, 55),
(326, 61, 1, 63, 0),
(327, 61, 2, 2, 61),
(328, 61, 3, 2, 61),
(329, 61, 4, 2, 61),
(330, 61, 5, 0, 61),
(331, 62, 1, 63, 0),
(332, 62, 2, 1, 62),
(333, 62, 3, 1, 62),
(334, 62, 4, 1, 62),
(335, 62, 5, 0, 62),
(336, 63, 1, 63, 0),
(337, 63, 2, 1, 62),
(338, 63, 3, 1, 62),
(339, 63, 4, 1, 62),
(340, 63, 5, 0, 62),
(341, 64, 1, 63, 0),
(342, 64, 2, 4, 59),
(343, 64, 3, 4, 59),
(344, 64, 4, 4, 59),
(345, 64, 5, 0, 59),
(346, 65, 1, 63, 0),
(347, 65, 2, 16, 47),
(348, 65, 3, 16, 47),
(349, 65, 4, 16, 47),
(350, 65, 5, 0, 47),
(351, 66, 1, 63, 0),
(352, 66, 2, 63, 0),
(353, 66, 3, 0, 0),
(354, 66, 4, 0, 0),
(355, 66, 5, 0, 63),
(356, 67, 1, 63, 0),
(357, 67, 2, 1, 62),
(358, 67, 3, 1, 62),
(359, 67, 4, 0, 62),
(360, 67, 5, 0, 62),
(361, 68, 1, 63, 0),
(362, 68, 2, 1, 62),
(363, 68, 3, 1, 62),
(364, 68, 4, 0, 62),
(365, 68, 5, 0, 62),
(366, 69, 1, 63, 0),
(367, 69, 2, 1, 62),
(368, 69, 3, 1, 62),
(369, 69, 4, 0, 62),
(370, 69, 5, 0, 62),
(371, 70, 1, 63, 0),
(372, 70, 2, 1, 62),
(373, 70, 3, 0, 62),
(374, 70, 4, 0, 63),
(375, 70, 5, 0, 63),
(376, 71, 1, 63, 0),
(377, 71, 2, 1, 62),
(378, 71, 3, 0, 62),
(379, 71, 4, 0, 63),
(380, 71, 5, 0, 63),
(381, 72, 1, 63, 0),
(382, 72, 2, 1, 62),
(383, 72, 3, 0, 62),
(384, 72, 4, 0, 63),
(385, 72, 5, 0, 63),
(386, 75, 1, 63, 0),
(387, 75, 2, 4, 59),
(388, 75, 3, 4, 59),
(389, 75, 4, 4, 59),
(390, 75, 5, 4, 59),
(391, 76, 1, 63, 0),
(392, 76, 2, 1, 62),
(393, 76, 3, 0, 63),
(394, 76, 4, 0, 63),
(395, 76, 5, 0, 63),
(396, 77, 1, 63, 0),
(397, 77, 2, 1, 62),
(398, 77, 3, 0, 63),
(399, 77, 4, 0, 63),
(400, 77, 5, 0, 63),
(401, 78, 1, 63, 0),
(402, 78, 2, 1, 62),
(403, 78, 3, 0, 63),
(404, 78, 4, 0, 63),
(405, 78, 5, 0, 63),
(406, 79, 1, 63, 0),
(407, 79, 2, 1, 62),
(408, 79, 3, 0, 63),
(409, 79, 4, 0, 63),
(410, 79, 5, 0, 63),
(411, 80, 1, 63, 0),
(412, 80, 2, 8, 55),
(413, 80, 3, 0, 63),
(414, 80, 4, 0, 63),
(415, 80, 5, 0, 63),
(416, 81, 1, 63, 0),
(417, 81, 2, 16, 47),
(418, 81, 3, 0, 63),
(419, 81, 4, 0, 63),
(420, 81, 5, 0, 63),
(436, 85, 1, 63, 0),
(437, 85, 2, 1, 62),
(438, 85, 3, 1, 62),
(439, 85, 4, 1, 62),
(440, 85, 5, 1, 62),
(441, 86, 1, 63, 0),
(442, 86, 2, 2, 61),
(443, 86, 3, 2, 61),
(444, 86, 4, 0, 61),
(445, 86, 5, 0, 63),
(446, 87, 1, 63, 0),
(447, 87, 2, 1, 62),
(448, 87, 3, 1, 62),
(449, 87, 4, 1, 62),
(450, 87, 5, 0, 62),
(451, 88, 1, 63, 0),
(452, 88, 2, 0, 62),
(453, 88, 3, 0, 63),
(454, 88, 4, 0, 63),
(455, 88, 5, 0, 63),
(456, 89, 1, 63, 0),
(457, 89, 2, 0, 62),
(458, 89, 3, 0, 63),
(459, 89, 4, 0, 63),
(460, 89, 5, 0, 63),
(466, 91, 1, 63, 0),
(467, 91, 2, 0, 62),
(468, 91, 3, 0, 63),
(469, 91, 4, 0, 63),
(470, 91, 5, 0, 63),
(471, 92, 1, 63, 0),
(472, 92, 2, 0, 62),
(473, 92, 3, 0, 63),
(474, 92, 4, 0, 63),
(475, 92, 5, 0, 63),
(476, 93, 1, 63, 0),
(477, 93, 2, 0, 62),
(478, 93, 3, 0, 63),
(479, 93, 4, 0, 63),
(480, 93, 5, 0, 63),
(481, 94, 1, 63, 0),
(482, 94, 2, 0, 62),
(483, 94, 3, 0, 63),
(484, 94, 4, 0, 63),
(485, 94, 5, 0, 63),
(486, 95, 1, 63, 0),
(487, 95, 2, 0, 62),
(488, 95, 3, 0, 63),
(489, 95, 4, 0, 63),
(490, 95, 5, 0, 63),
(491, 96, 1, 63, 0),
(492, 96, 2, 0, 62),
(493, 96, 3, 0, 63),
(494, 96, 4, 0, 63),
(495, 96, 5, 0, 63),
(496, 97, 1, 63, 0),
(497, 97, 2, 0, 62),
(498, 97, 3, 0, 63),
(499, 97, 4, 0, 63),
(500, 97, 5, 0, 63),
(501, 98, 1, 63, 0),
(502, 98, 2, 0, 62),
(503, 98, 3, 0, 63),
(504, 98, 4, 0, 63),
(505, 98, 5, 0, 63),
(506, 99, 1, 63, 0),
(507, 99, 2, 0, 62),
(508, 99, 3, 0, 63),
(509, 99, 4, 0, 63),
(510, 99, 5, 0, 63),
(511, 100, 1, 63, 0),
(512, 100, 2, 0, 62),
(513, 100, 3, 0, 63),
(514, 100, 4, 0, 63),
(515, 100, 5, 0, 63),
(516, 101, 1, 63, 0),
(517, 101, 2, 0, 62),
(518, 101, 3, 0, 63),
(519, 101, 4, 0, 63),
(520, 101, 5, 0, 63),
(541, 106, 1, 63, 0),
(542, 106, 2, 1, 62),
(543, 106, 3, 1, 62),
(544, 106, 4, 0, 63),
(545, 106, 5, 0, 63),
(546, 107, 1, 63, 0),
(547, 107, 2, 1, 62),
(548, 107, 3, 0, 62),
(549, 107, 4, 0, 62),
(550, 107, 5, 0, 62),
(551, 108, 1, 63, 0),
(552, 108, 2, 1, 62),
(553, 108, 3, 1, 62),
(554, 108, 4, 0, 62),
(555, 108, 5, 0, 63),
(556, 109, 1, 63, 0),
(557, 109, 2, 1, 62),
(558, 109, 3, 0, 62),
(559, 109, 4, 0, 62),
(560, 109, 5, 0, 63),
(566, 111, 1, 63, 0),
(567, 111, 2, 8, 55),
(568, 111, 3, 8, 55),
(569, 111, 4, 0, 55),
(570, 111, 5, 0, 63),
(571, 112, 1, 63, 0),
(572, 112, 2, 8, 55),
(573, 112, 3, 0, 55),
(574, 112, 4, 0, 55),
(575, 112, 5, 0, 63),
(576, 113, 1, 63, 0),
(577, 113, 2, 4, 59),
(578, 113, 3, 4, 59),
(579, 113, 4, 0, 59),
(580, 113, 5, 0, 63),
(581, 114, 1, 63, 0),
(582, 114, 2, 4, 59),
(583, 114, 3, 0, 59),
(584, 114, 4, 0, 59),
(585, 114, 5, 0, 63),
(586, 115, 1, 63, 0),
(587, 115, 2, 2, 61),
(588, 115, 3, 0, 61),
(589, 115, 4, 0, 61),
(590, 115, 5, 0, 63),
(591, 116, 1, 63, 0),
(592, 116, 2, 1, 62),
(593, 116, 3, 1, 62),
(594, 116, 4, 1, 62),
(595, 116, 5, 0, 63),
(596, 117, 1, 63, 0),
(597, 117, 2, 8, 55),
(598, 117, 3, 0, 55),
(599, 117, 4, 0, 55),
(600, 117, 5, 0, 63),
(601, 118, 1, 63, 0),
(602, 118, 2, 8, 55),
(603, 118, 3, 0, 55),
(604, 118, 4, 0, 55),
(605, 118, 5, 0, 63),
(606, 119, 1, 63, 0),
(607, 119, 2, 8, 55),
(608, 119, 3, 0, 55),
(609, 119, 4, 0, 55),
(610, 119, 5, 0, 63),
(611, 120, 1, 63, 0),
(612, 120, 2, 1, 62),
(613, 120, 3, 1, 62),
(614, 120, 4, 1, 62),
(615, 120, 5, 1, 62),
(616, 121, 1, 63, 0),
(617, 121, 2, 0, 63),
(618, 121, 3, 0, 63),
(619, 121, 4, 0, 63),
(620, 121, 5, 0, 63),
(621, 122, 1, 63, 0),
(622, 122, 2, 7, 56),
(623, 122, 3, 7, 56),
(624, 122, 4, 7, 56),
(625, 122, 5, 5, 56),
(651, 129, 1, 63, 0),
(652, 129, 2, 0, 63),
(653, 129, 3, 0, 63),
(654, 129, 4, 0, 63),
(655, 129, 5, 0, 63),
(661, 132, 1, 63, 0),
(662, 132, 2, 0, 63),
(663, 132, 3, 0, 63),
(664, 132, 4, 0, 63),
(665, 132, 5, 0, 63),
(666, 133, 1, 63, 0),
(667, 133, 2, 0, 63),
(668, 133, 3, 0, 63),
(669, 133, 4, 0, 63),
(670, 133, 5, 0, 63),
(671, 134, 1, 63, 0),
(672, 134, 2, 0, 63),
(673, 134, 3, 0, 63),
(674, 134, 4, 0, 63),
(675, 134, 5, 0, 63),
(676, 135, 1, 63, 0),
(677, 135, 2, 0, 63),
(678, 135, 3, 0, 63),
(679, 135, 4, 0, 63),
(680, 135, 5, 0, 63),
(681, 136, 1, 63, 0),
(682, 136, 2, 0, 63),
(683, 136, 3, 0, 63),
(684, 136, 4, 0, 63),
(685, 136, 5, 0, 63),
(686, 137, 1, 63, 0),
(687, 137, 2, 0, 63),
(688, 137, 3, 0, 63),
(689, 137, 4, 0, 63),
(690, 137, 5, 0, 63),
(691, 138, 1, 63, 0),
(692, 138, 2, 1, 62),
(693, 138, 3, 1, 62),
(694, 138, 4, 0, 62),
(695, 138, 5, 0, 63),
(696, 139, 1, 63, 0),
(697, 139, 2, 0, 62),
(698, 139, 3, 0, 63),
(699, 139, 4, 0, 63),
(700, 139, 5, 0, 63),
(701, 140, 1, 63, 0),
(702, 140, 2, 1, 62),
(703, 140, 3, 1, 62),
(704, 140, 4, 0, 62),
(705, 140, 5, 0, 63),
(706, 141, 1, 63, 0),
(707, 141, 2, 1, 62),
(708, 141, 3, 1, 62),
(709, 141, 4, 0, 63),
(710, 141, 5, 0, 63),
(711, 142, 1, 63, 0),
(712, 142, 2, 1, 62),
(713, 142, 3, 0, 62),
(714, 142, 4, 0, 63),
(715, 142, 5, 0, 63),
(716, 143, 1, 63, 0),
(717, 143, 2, 8, 55),
(718, 143, 3, 0, 55),
(719, 143, 4, 0, 55),
(720, 143, 5, 0, 63),
(721, 144, 1, 63, 0),
(722, 144, 2, 63, 0),
(723, 144, 3, 23, 40),
(724, 144, 4, 0, 60),
(725, 144, 5, 0, 63),
(726, 145, 1, 63, 0),
(727, 145, 2, 13, 18),
(728, 145, 3, 1, 18),
(729, 145, 4, 0, 18),
(730, 145, 5, 0, 63),
(731, 146, 1, 63, 0),
(732, 146, 2, 1, 62),
(733, 146, 3, 0, 63),
(734, 146, 4, 0, 63),
(735, 146, 5, 0, 63),
(736, 147, 1, 63, 0),
(737, 147, 2, 16, 47),
(738, 147, 3, 16, 47),
(739, 147, 4, 16, 47),
(740, 147, 5, 0, 63),
(741, 148, 1, 63, 0),
(742, 148, 2, 4, 59),
(743, 148, 3, 4, 59),
(744, 148, 4, 4, 59),
(745, 148, 5, 0, 59),
(746, 149, 1, 63, 0),
(747, 149, 2, 1, 62),
(748, 149, 3, 1, 62),
(749, 149, 4, 1, 62),
(750, 149, 5, 0, 62),
(751, 150, 1, 63, 0),
(752, 150, 2, 1, 62),
(753, 150, 3, 1, 62),
(754, 150, 4, 1, 62),
(755, 150, 5, 0, 62),
(756, 151, 1, 63, 0),
(757, 151, 2, 2, 61),
(758, 151, 3, 2, 61),
(759, 151, 4, 2, 61),
(760, 151, 5, 0, 61),
(761, 153, 1, 63, 0),
(762, 153, 2, 8, 55),
(763, 153, 3, 8, 55),
(764, 153, 4, 8, 55),
(765, 153, 5, 0, 55);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_asistencias`
--

CREATE TABLE `tb_asistencias` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `creacion` varchar(25) NOT NULL DEFAULT current_timestamp(),
  `desconeccion` varchar(25) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_asistencias`
--

INSERT INTO `tb_asistencias` (`id`, `usuario_id`, `creacion`, `desconeccion`) VALUES
(15, 1, '2024-09-20 00:46:28', '2024-09-20 23:49:56'),
(17, 1, '2024-09-21 12:05:44', '2024-09-21 23:57:56'),
(20, 1, '2024-09-22 16:09:29', '2024-09-22 23:27:21'),
(29, 1, '2024-09-23 14:14:51', '2024-09-23 22:49:43'),
(30, 1, '2024-09-24 02:07:35', '2024-09-24 19:07:12'),
(31, 1, '2024-09-25 01:08:21', '2024-09-25 23:10:06'),
(32, 1, '2024-09-26 01:46:44', '2024-09-26 23:58:16'),
(33, 1, '2024-09-27 00:51:51', '2024-09-27 23:26:29'),
(34, 1, '2024-09-28 01:02:25', '2024-09-28 23:48:35'),
(35, 1, '2024-09-29 08:59:32', '2024-09-29 23:51:39'),
(36, 2, '2024-09-29 14:10:05', '2024-09-29 19:14:50'),
(37, 7, '2024-09-29 22:47:37', '2024-09-29 23:46:43'),
(38, 1, '2024-09-30 02:41:53', '2024-09-30 23:58:23'),
(39, 7, '2024-10-01 00:29:34', '2024-10-01 01:16:35'),
(40, 1, '2024-10-02 14:59:30', '2024-10-02 23:21:22'),
(41, 1, '2024-10-03 18:51:01', '2024-10-03 18:55:12'),
(42, 1, '2024-10-04 15:18:11', '2024-10-04 21:51:14'),
(43, 1, '2024-10-05 19:18:05', '2024-10-05 21:26:54'),
(44, 1, '2024-10-06 00:28:22', '2024-10-06 20:29:32'),
(45, 1, '2024-10-07 01:46:45', '2024-10-07 21:21:43'),
(46, 7, '2024-10-07 14:45:05', '2024-10-07 18:09:29'),
(47, 1, '2024-10-08 01:18:14', '2024-10-08 17:29:55'),
(48, 1, '2024-10-09 02:32:53', '2024-10-09 02:32:59'),
(49, 1, '2024-10-10 09:57:39', '2024-10-10 10:27:01'),
(50, 1, '2024-11-08 12:30:32', '2024-11-08 15:05:00'),
(51, 1, '2024-11-10 05:10:21', '2024-11-10 17:50:04'),
(52, 1, '2024-11-11 15:46:48', '2024-11-11 20:19:01'),
(53, 1, '2024-11-12 09:40:21', '2024-11-12 16:05:51'),
(54, 1, '2024-11-13 10:01:23', '2024-11-13 23:54:02'),
(55, 1, '2024-11-14 00:25:06', '2024-11-14 23:48:39'),
(56, 1, '2024-11-15 00:26:33', '2024-11-15 18:18:32'),
(57, 1, '2024-11-16 00:14:21', '2024-11-16 23:59:41'),
(58, 1, '2024-11-17 13:40:21', '2024-11-17 19:39:31'),
(59, 1, '2024-11-18 00:19:49', '2024-11-18 23:19:30'),
(60, 1, '2024-11-19 15:51:51', '2024-11-19 19:24:03'),
(61, 1, '2024-11-20 23:54:08', '2024-11-20 23:54:35'),
(62, 1, '2024-11-21 00:09:43', '2024-11-21 18:24:50'),
(63, 1, '2024-11-22 00:02:06', '2024-11-22 23:53:06'),
(64, 1, '2024-11-23 00:09:36', '2024-11-23 21:33:57'),
(65, 1, '2024-11-24 00:16:11', '2024-11-24 23:55:44'),
(66, 1, '2024-11-25 00:18:38', '2024-11-25 21:19:50'),
(67, 1, '2024-11-26 02:08:57', '2024-11-26 19:40:13'),
(68, 1, '2024-11-27 01:18:54', '2024-11-27 21:41:54'),
(69, 1, '2024-11-28 01:55:51', '2024-11-28 23:40:33'),
(70, 1, '2024-11-29 00:08:43', '2024-11-29 03:27:20'),
(71, 1, '2024-11-30 01:38:50', '2024-11-30 03:17:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_categorias`
--

CREATE TABLE `tb_categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `creacion` varchar(25) NOT NULL DEFAULT current_timestamp(),
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_categorias`
--

INSERT INTO `tb_categorias` (`id`, `nombre`, `codigo`, `descripcion`, `creacion`, `estado`) VALUES
(35, 'Juegos De Mesa', 'TDZSZ', 'Fomentan el pensamiento crítico y la resolución de problemas.', '2024-09-26 00:13:57', 1),
(36, 'Puzzles Y Rompecabezas', 'TINPC', 'Ayudan a desarrollar habilidades cognitivas y de concentración.', '2024-09-26 00:14:19', 1),
(37, 'Juguetes De Construcción', 'TOUWY', 'Estimulan la creatividad y la coordinación mano-ojo.', '2024-09-26 00:14:41', 1),
(38, 'Peluches Con Sonidos', 'TMCMS', 'Proporcionan estímulos auditivos y táctiles.', '2024-09-26 00:16:35', 1),
(39, 'Móviles De Colores', 'TNLWM', 'Ayudan a desarrollar la percepción visual.', '2024-09-26 00:18:42', 1),
(40, 'Aros Y Cuerdas', 'TCGAN', 'Mejoran la coordinación y el equilibrio.', '2024-09-26 00:18:57', 1),
(41, 'Pelotas', 'TNCSB', 'Fomentan la actividad física y la motricidad gruesa.', '2024-09-26 00:19:14', 1),
(42, 'Plasticina', 'TNWIL', 'Desarrolla la motricidad fina y la creatividad.', '2024-09-26 00:19:25', 1),
(43, 'Cocinitas Y Accesorios De Profesiones', 'TKDDY', 'Fomentan el juego de roles y la imaginación.', '2024-09-26 00:19:41', 1),
(44, 'Muñecas', 'TTHHC', 'Ayudan en el desarrollo emocional y social.', '2024-09-26 00:20:16', 1),
(45, 'Carritos', 'TECCU', 'Ayudan en el desarrollo emocional y social.', '2024-09-26 00:20:23', 1),
(46, 'Kits De Pintura Y Dibujo', 'TDDQH', 'Estimulan la creatividad y la expresión artística.', '2024-09-26 00:20:54', 1),
(47, 'Materiales Para Hacer Manualidades', 'TDTJO', 'Fomentan la creatividad y la habilidad manual.', '2024-09-26 00:21:13', 1),
(48, 'Juegos De Modelado', 'TSDNK', 'Desarrollan la motricidad fina y la imaginación.', '2024-09-26 00:21:37', 1),
(49, 'Instrumentos Musicales De Juguete', 'TNLOM', 'Introducen a los niños en el mundo de la música.', '2024-09-26 00:21:55', 1),
(50, 'Juegos De Ritmo Y Sonido', 'TMCXD', 'Mejoran la coordinación y el sentido del ritmo.', '2024-09-26 00:22:05', 1),
(51, 'Canciones Y Melodías Interactivas', 'TFVKV', 'Fomentan el desarrollo auditivo y el lenguaje.', '2024-09-26 00:22:24', 1),
(52, 'Herramientas De Juguete', 'TTNRS', 'Fomentan el juego de roles y la creatividad.', '2024-09-26 00:22:46', 1),
(53, 'Juegos De Agua', 'TFZNW', 'Proporcionan diversión y estimulación sensorial.', '2024-09-26 00:23:10', 1),
(54, 'Equipos De Deporte', 'TLDRL', 'Mejoran las habilidades motoras y la coordinación.', '2024-09-26 00:23:23', 1),
(55, 'Bicicletas Y Triciclos', 'TMRVP', 'Fomentan la actividad física y la coordinación.', '2024-09-26 00:23:37', 1),
(56, 'Juegos De Zoológico', 'TCZNE', 'Fomentan el juego imaginativo y el aprendizaje sobre la naturaleza.', '2024-09-26 00:24:39', 1),
(57, 'Peluches De Animales', 'TTXHB', 'Proporcionan confort y estimulación sensorial.', '2024-09-26 00:24:50', 1),
(58, 'Figuras De Animales', 'TJXJR', 'Ayudan a los niños a aprender sobre diferentes especies.', '2024-09-26 00:25:09', 1),
(59, 'Juegos De Programación', 'TISUF', 'Desarrollan habilidades lógicas y de resolución de problemas.', '2024-09-26 00:26:00', 1),
(60, 'Dispositivos Educativos', 'TOPEW', 'Fomentan el aprendizaje interactivo.', '2024-09-26 00:26:19', 1),
(61, 'Robots', 'TTXKA', 'Introducen a los niños en la tecnología y la programación.', '2024-09-26 00:26:37', 1),
(62, 'Drones', 'TBMKP', 'Introducen a los niños en la tecnología y la programación.', '2024-09-26 00:26:46', 1),
(63, 'Bloques De Construcción', 'TEQFH', 'Ayudan a desarrollar habilidades motoras finas y la creatividad.', '2024-09-26 00:29:18', 1),
(64, 'Sets De Lego', 'TKAHB', 'Fomentan la imaginación y la capacidad de seguir instrucciones.', '2024-09-26 00:29:41', 1),
(65, 'Juguetes De Ensamblaje', 'TUVPH', 'Desarrollan habilidades de resolución de problemas y coordinación mano-ojo.', '2024-09-26 00:29:53', 1),
(66, 'Aviones Y Helicópteros', 'TXGXB', 'Estimulan la imaginación y el interés por la aviación.', '2024-09-26 00:30:10', 1),
(67, 'Juegos De Cartas', 'TREXX', 'Desarrollan habilidades de pensamiento crítico y planificación.', '2024-09-26 00:30:26', 1),
(68, 'Juegos De Tablero', 'TZZGY', 'Fomentan la cooperación y la competencia saludable.', '2024-09-26 00:30:33', 1),
(69, 'Juegos De Lógica', 'TUGLU', 'Ayudan a mejorar el razonamiento lógico y la resolución de problemas.', '2024-09-26 00:30:46', 1),
(70, 'Equipos De Mini-golf', 'TBUYZ', 'Introducen a los niños en el deporte de una manera divertida.', '2024-09-26 00:31:14', 1),
(71, 'Sets De Fútbol Y Baloncesto', 'TNHIQ', 'Fomentan la actividad física y el trabajo en equipo.', '2024-09-26 00:31:26', 1),
(72, 'Juegos De Bolos', 'TEZNG', 'Ayudan a desarrollar la coordinación y la precisión.', '2024-09-26 00:31:41', 1),
(73, 'Sets De Exploración', 'TMLDN', 'Incluyen brújulas, binoculares y mapas para fomentar la exploración y la aventura.', '2024-09-26 00:31:59', 1),
(74, 'Juegos De Supervivencia', 'TEPOE', 'Enseñan habilidades básicas de supervivencia y orientación.', '2024-09-26 00:32:21', 1),
(75, 'Sets De Arqueología', 'TUAID', 'Permiten a los niños excavar y descubrir artefactos históricos.', '2024-09-26 00:33:05', 1),
(76, 'Juegos De Civilizaciones', 'TXYBY', 'Enseñan sobre diferentes culturas y épocas históricas.', '2024-09-26 00:34:01', 1),
(77, 'Kits De Jardinería', 'TKFDV', 'Fomentan el amor por la naturaleza y la responsabilidad.', '2024-09-26 00:34:22', 1),
(78, 'Sets De Insectos', 'TXRTA', 'Permiten a los niños observar y aprender sobre insectos y su hábitat.', '2024-09-26 00:34:38', 1),
(79, 'Sets De Dinosaurios', 'TEDZM', 'Permiten a los niños observar y aprender sobre dinosaurios y su hábitat.', '2024-09-26 00:35:10', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_clientes`
--

CREATE TABLE `tb_clientes` (
  `id` int(11) NOT NULL,
  `nombres` varchar(50) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(50) DEFAULT NULL,
  `tipo_cliente_id` int(11) NOT NULL,
  `tipo_documento_id` int(11) NOT NULL,
  `num_documento` varchar(20) NOT NULL,
  `creacion` varchar(25) NOT NULL DEFAULT current_timestamp(),
  `estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_clientes`
--

INSERT INTO `tb_clientes` (`id`, `nombres`, `telefono`, `direccion`, `tipo_cliente_id`, `tipo_documento_id`, `num_documento`, `creacion`, `estado`) VALUES
(1, 'Desconocido', 'Desconocido', 'Desconocido', 1, 1, 'Desconocido', '2024-08-23 18:22:36', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_compras`
--

CREATE TABLE `tb_compras` (
  `id` int(11) NOT NULL,
  `transaccion_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(10) NOT NULL DEFAULT 0,
  `compra` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_compras`
--

INSERT INTO `tb_compras` (`id`, `transaccion_id`, `producto_id`, `cantidad`, `compra`) VALUES
(1, 11, 54, 10, 10.00),
(2, 12, 53, 20, 8.00),
(6, 13, 61, 5, 89.00),
(7, 13, 59, 8, 38.00),
(9, 14, 57, 7, 20.00),
(10, 14, 56, 9, 75.00),
(11, 15, 58, 10, 11.00),
(12, 16, 59, 1, 34.00),
(13, 17, 61, 1, 98.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_fotos`
--

CREATE TABLE `tb_fotos` (
  `id` int(11) NOT NULL,
  `hash` varchar(64) NOT NULL,
  `src` varchar(250) NOT NULL,
  `src_small` varchar(250) NOT NULL,
  `tipo` varchar(10) NOT NULL,
  `tabla` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `creacion` varchar(25) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_fotos`
--

INSERT INTO `tb_fotos` (`id`, `hash`, `src`, `src_small`, `tipo`, `tabla`, `nombre`, `creacion`) VALUES
(1, 'bb50b9e7bbd91026c82ad5b483e7925020f871179a3aaaede289bfeeb013d243', '/src/resource/default/normal/1727219265427.jpg', '/src/resource/default/small/1727219265427.jpg', '.jpg', 'tb_usuarios', 'default', '2024-09-24 18:07:45'),
(2, 'f0e3d9014c9361b437d72c80f67cfe1ed9cf75dc905cdc7b875d274fe9f6cfc4', '/src/resource/default/normal/1727219498616.jpg', '/src/resource/default/small/1727219498616.jpg', '.jpg', 'tb_productos', 'default', '2024-09-24 18:11:38'),
(64, 'f4c09757f2ad335a4394a8270bc8d0a51de4a7e94378d5eae4951362cad7fe20', '/src/resource/usuarios/normal/1725669968044_normal.jpg.jpg', '/src/resource/usuarios/small/1725669968044_normal.jpg.jpg', '.jpg', 'tb_usuarios', '1725669968044_normal.jpg', '2024-09-24 17:41:57'),
(68, 'ae0f846a2d3325e2bef41c1dcdceaf4170c8bccd3432c3402e3d8397282b2049', '/src/resource/usuarios/normal/1727221592116.jpg.jpg', '/src/resource/usuarios/small/1727221592116.jpg.jpg', '.jpg', 'tb_usuarios', 'Imagen de WhatsApp 2024-08-03 a las 08.15.50_772c5761.jpg', '2024-09-24 18:46:32'),
(69, '5a22c0d99ef9a31050e61a9b37c564260f4a26be184c8f2b013904d0c3b11500', '/src/resource/usuarios/normal/1727651868692.jpg.jpg', '/src/resource/usuarios/small/1727651868692.jpg.jpg', '.jpg', 'tb_usuarios', 'Imagen de WhatsApp 2024-08-03 a las 08.15.50_92a3f256.jpg', '2024-09-29 18:17:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_menus`
--

CREATE TABLE `tb_menus` (
  `id` int(11) NOT NULL,
  `principal` varchar(20) NOT NULL,
  `ruta` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_menus`
--

INSERT INTO `tb_menus` (`id`, `principal`, `ruta`) VALUES
(1, ':control', '/control'),
(2, ':control', '/control/inicio'),
(3, ':control', '/control/productos'),
(4, ':control', '/control/mantenimiento'),
(5, ':control', '/control/mantenimiento/categorias'),
(6, ':control', '/control/mantenimiento/clientes'),
(7, ':control', '/control/mantenimiento/inventario'),
(8, ':control', '/control/movimientos'),
(9, ':control', '/control/reportes/asistencia'),
(10, ':control', '/control/reportes'),
(11, ':control', '/control/movimientos/ventas'),
(12, ':control', '/control/reportes/registros'),
(13, ':control', '/control/administracion'),
(14, ':control', '/control/reportes/ventas'),
(15, ':control', '/control/administracion/usuarios'),
(16, ':control', '/control/administracion/acceso'),
(17, ':api', '/api/usuarios/table/readAll'),
(18, ':api', '/api/usuarios/table/updateIdState'),
(19, ':api', '/api/usuarios/table/insert'),
(20, ':api', '/api/usuarios/table/readId'),
(21, ':api', '/api/usuarios/table/updateId'),
(22, ':api', '/api/usuarios/table/deleteId'),
(23, ':api', '/api/acceso/table/readAll'),
(24, ':api', '/api/acceso/table/updatePermisoId'),
(25, ':api', '/api/acceso/table/insert'),
(26, ':api', '/api/categorias/table/readId'),
(27, ':api', '/api/categorias/table/readAll'),
(28, ':api', '/api/categorias/table/insert'),
(29, ':api', '/api/categorias/table/deleteId'),
(31, ':api', '/api/acceso/chart/read'),
(32, ':api', '/api/usuarios/profile/updateFoto'),
(33, ':api', '/api/usuarios/chart/read'),
(35, ':api', '/api/productos/table/updateIdState'),
(36, ':api', '/api/productos/table/updateIdCode'),
(37, ':api', '/api/productos/table/updateId'),
(38, ':api', '/api/productos/table/updateIdFoto'),
(39, ':api', '/api/productos/table/readId'),
(40, ':api', '/api/productos/table/readAll'),
(41, ':api', '/api/productos/table/insert'),
(42, ':api', '/api/productos/table/deleteId'),
(44, ':api', '/api/categorias/table/updateIdState'),
(45, ':api', '/api/categorias/table/updateId'),
(46, ':bot', 'url'),
(47, ':bot', 'recuperar'),
(54, ':bot', 'ventas'),
(55, ':api', '/api/acceso/table/deleteId'),
(56, ':api', '/api/acceso/table/readId'),
(57, ':api', '/api/acceso/table/updateId'),
(60, ':api', '/api/clientes/table/deleteId'),
(61, ':api', '/api/clientes/table/insert'),
(62, ':api', '/api/clientes/table/readAll'),
(63, ':api', '/api/clientes/table/readId'),
(64, ':api', '/api/clientes/table/updateId'),
(65, ':api', '/api/clientes/table/updateIdState'),
(66, ':control', '/control/movimientos/compras'),
(67, ':api', '/api/categorias/chart/read'),
(68, ':api', '/api/clientes/chart/read'),
(69, ':api', '/api/productos/chart/read'),
(70, ':api', '/api/logguer/error/read'),
(71, ':api', '/api/logguer/success/read'),
(72, ':api', '/api/logguer/warning/read'),
(75, ':api', '/api/usuarios/profile/updatePassword'),
(76, ':control', '/control/administracion/bot'),
(77, ':api', '/api/bot/profile/info'),
(78, ':api', '/api/bot/chart/mainPath'),
(79, ':api', '/api/bot/profile/avatar'),
(80, ':api', '/api/bot/profile/logout'),
(81, ':api', '/api/bot/profile/state'),
(85, ':api', '/api/tipo_metodo_pago/code/read'),
(86, ':api', '/api/transacciones_ventas/profile/insert'),
(87, ':api', '/api/productos/table/readPriceId'),
(88, ':control', '/control/servidor'),
(89, ':control', '/control/servidor/cpu'),
(91, ':control', '/control/servidor/terminal'),
(92, ':api', '/api/cpu/readCore'),
(93, ':api', '/api/cpu/readCpu'),
(94, ':api', '/api/cpu/readRam'),
(95, ':api', '/api/cpu/powerOff'),
(96, ':api', '/api/cpu/reset'),
(97, ':api', '/api/cpu/readDisk'),
(98, ':api', '/api/cpu/readFs'),
(99, ':api', '/api/desktop/screen'),
(100, ':api', '/api/cmd/query'),
(101, ':api', '/api/cpu/readOs'),
(106, ':api', '/api/asistencia/table/readAll'),
(107, ':bot', 'asistencia'),
(108, ':api', '/api/transacciones_ventas/table/readAll'),
(109, ':api', '/api/ventas/table/readBusinessId'),
(111, ':api', '/api/transacciones_ventas/table/deleteId'),
(112, ':api', '/api/ventas/table/deleteId'),
(113, ':api', '/api/transacciones_ventas/table/updateId'),
(114, ':api', '/api/ventas/table/updateId'),
(115, ':api', '/api/ventas/table/insert'),
(116, ':api', '/api/transacciones_ventas/profile/readAll'),
(117, ':api', '/api/logguer/error/clear'),
(118, ':api', '/api/logguer/success/clear'),
(119, ':api', '/api/logguer/warning/clear'),
(120, ':bot', 'ayuda'),
(121, ':bot', 'server'),
(122, ':control', '/control/perfil'),
(129, ':bot', 'db'),
(132, ':bot', 'config'),
(133, ':bot', 'apache'),
(134, ':bot', 'cache'),
(135, ':bot', 'log'),
(136, ':bot', 'pi'),
(137, ':bot', 'update'),
(138, ':control', '/control/reportes/yapes'),
(139, ':control', '/control/servidor/cerebro'),
(140, ':api', '/api/cerebro/precio_venta/readJson'),
(141, ':api', '/api/productos/chart/readPrice'),
(142, ':api', '/api/logguer/system/read'),
(143, ':api', '/api/logguer/system/clear'),
(144, ':control', '/control/mantenimiento/proveedores'),
(145, ':control', '/control/reportes/compras'),
(146, ':control', '/control/administracion/tipos'),
(147, ':api', '/api/proveedor/table/updateIdState'),
(148, ':api', '/api/proveedor/table/updateId'),
(149, ':api', '/api/proveedor/table/readId'),
(150, ':api', '/api/proveedor/table/readAll'),
(151, ':api', '/api/proveedor/table/insert'),
(153, ':api', '/api/proveedor/table/deleteId');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_permisos`
--

CREATE TABLE `tb_permisos` (
  `id` int(11) NOT NULL,
  `ver` tinyint(1) NOT NULL,
  `agregar` tinyint(1) NOT NULL,
  `editar` tinyint(1) NOT NULL,
  `eliminar` tinyint(1) NOT NULL,
  `ocultar` tinyint(1) NOT NULL,
  `exportar` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_permisos`
--

INSERT INTO `tb_permisos` (`id`, `ver`, `agregar`, `editar`, `eliminar`, `ocultar`, `exportar`) VALUES
(0, 0, 0, 0, 0, 0, 0),
(1, 1, 0, 0, 0, 0, 0),
(2, 0, 1, 0, 0, 0, 0),
(3, 1, 1, 0, 0, 0, 0),
(4, 0, 0, 1, 0, 0, 0),
(5, 1, 0, 1, 0, 0, 0),
(6, 0, 1, 1, 0, 0, 0),
(7, 1, 1, 1, 0, 0, 0),
(8, 0, 0, 0, 1, 0, 0),
(9, 1, 0, 0, 1, 0, 0),
(10, 0, 1, 0, 1, 0, 0),
(11, 1, 1, 0, 1, 0, 0),
(12, 0, 0, 1, 1, 0, 0),
(13, 1, 0, 1, 1, 0, 0),
(14, 0, 1, 1, 1, 0, 0),
(15, 1, 1, 1, 1, 0, 0),
(16, 0, 0, 0, 0, 1, 0),
(17, 1, 0, 0, 0, 1, 0),
(18, 0, 1, 0, 0, 1, 0),
(19, 1, 1, 0, 0, 1, 0),
(20, 0, 0, 1, 0, 1, 0),
(21, 1, 0, 1, 0, 1, 0),
(22, 0, 1, 1, 0, 1, 0),
(23, 1, 1, 1, 0, 1, 0),
(24, 0, 0, 0, 1, 1, 0),
(25, 1, 0, 0, 1, 1, 0),
(26, 0, 1, 0, 1, 1, 0),
(27, 1, 1, 0, 1, 1, 0),
(28, 0, 0, 1, 1, 1, 0),
(29, 1, 0, 1, 1, 1, 0),
(30, 0, 1, 1, 1, 1, 0),
(31, 1, 1, 1, 1, 1, 0),
(32, 0, 0, 0, 0, 0, 1),
(33, 1, 0, 0, 0, 0, 1),
(34, 0, 1, 0, 0, 0, 1),
(35, 1, 1, 0, 0, 0, 1),
(36, 0, 0, 1, 0, 0, 1),
(37, 1, 0, 1, 0, 0, 1),
(38, 0, 1, 1, 0, 0, 1),
(39, 1, 1, 1, 0, 0, 1),
(40, 0, 0, 0, 1, 0, 1),
(41, 1, 0, 0, 1, 0, 1),
(42, 0, 1, 0, 1, 0, 1),
(43, 1, 1, 0, 1, 0, 1),
(44, 0, 0, 1, 1, 0, 1),
(45, 1, 0, 1, 1, 0, 1),
(46, 0, 1, 1, 1, 0, 1),
(47, 1, 1, 1, 1, 0, 1),
(48, 0, 0, 0, 0, 1, 1),
(49, 1, 0, 0, 0, 1, 1),
(50, 0, 1, 0, 0, 1, 1),
(51, 1, 1, 0, 0, 1, 1),
(52, 0, 0, 1, 0, 1, 1),
(53, 1, 0, 1, 0, 1, 1),
(54, 0, 1, 1, 0, 1, 1),
(55, 1, 1, 1, 0, 1, 1),
(56, 0, 0, 0, 1, 1, 1),
(57, 1, 0, 0, 1, 1, 1),
(58, 0, 1, 0, 1, 1, 1),
(59, 1, 1, 0, 1, 1, 1),
(60, 0, 0, 1, 1, 1, 1),
(61, 1, 0, 1, 1, 1, 1),
(62, 0, 1, 1, 1, 1, 1),
(63, 1, 1, 1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_productos`
--

CREATE TABLE `tb_productos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `producto` varchar(50) NOT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `venta` decimal(10,2) DEFAULT NULL,
  `stock_disponible` int(10) NOT NULL DEFAULT 0,
  `stock_reservado` int(10) NOT NULL DEFAULT 0,
  `categoria_id` int(11) NOT NULL,
  `foto_id` int(11) DEFAULT 5,
  `creacion` varchar(25) NOT NULL DEFAULT current_timestamp(),
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_productos`
--

INSERT INTO `tb_productos` (`id`, `codigo`, `producto`, `descripcion`, `venta`, `stock_disponible`, `stock_reservado`, `categoria_id`, `foto_id`, `creacion`, `estado`) VALUES
(49, 'INKEFEWLY', 'Salta Sogas Grande', 'Mango de madera', 14.00, 0, 0, 40, 2, '2024-09-26 16:51:24', 1),
(50, 'IMMTPDHCB', 'Salta Sogas Mediano', 'Mango plastico', 12.00, 0, 0, 40, 2, '2024-09-26 17:03:01', 1),
(51, 'IQIPQCGJT', 'Ula Ula Manchado', 'Color blanco con manchas de colores', 15.00, 0, 0, 40, 2, '2024-09-27 00:11:40', 1),
(52, 'IBZADISRJ', 'Ula Ula Cintado', 'Cintas escarchada de colores', 16.00, 0, 0, 40, 2, '2024-09-27 00:12:55', 0),
(53, 'IDUCYYVXV', 'Avion Errante Pequeño', 'Avion con dispositivo errante, pequeño', 17.00, 15, 0, 66, 2, '2024-09-27 00:16:52', 1),
(54, 'ISFSZTEFH', 'Avion Errante Mediano', 'Avion con dispositivo errante, pequeño', 19.80, 10, 0, 66, 2, '2024-09-27 00:18:21', 1),
(55, 'ITPHWSCJF', 'Helicoptero Remoto', 'Pequeño, limite de transmision 20 metros y a bateria recargable', 44.69, 0, 0, 66, 2, '2024-09-27 00:19:40', 1),
(56, 'IGGJVFPRI', 'Triciclo Musical', 'Musica a pilas, ruedas platicas y giador', 95.00, 9, 0, 55, 2, '2024-09-27 00:21:35', 1),
(57, 'IJEDLGFLD', 'Mega Block 30 Pcs', 'Bolsa plastica y de colores', 38.81, 7, 0, 63, 2, '2024-09-27 00:38:09', 1),
(58, 'IIDAZOOBV', 'Hot Whells', 'Un solo carro, vienen diferentes modelos', 22.00, 10, 0, 45, 2, '2024-09-27 00:40:17', 1),
(59, 'IRSXKSDOA', 'Dron Mini', 'Mini dron 4 helices', 55.18, 9, 0, 62, 2, '2024-09-27 00:42:48', 1),
(60, 'IPPPNMJFX', 'Dron Mediano', 'Dron con 6 helices, color negro', 64.00, -1, 0, 62, 2, '2024-09-27 00:43:40', 1),
(61, 'ICXVFADUC', 'Dron Grande', 'Dron con camara, color gris', 125.00, 6, 0, 62, 2, '2024-09-27 00:44:36', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_proveedores`
--

CREATE TABLE `tb_proveedores` (
  `id` int(11) NOT NULL,
  `titular` varchar(50) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `direccion` varchar(50) NOT NULL,
  `tipo_proveedor_id` int(11) NOT NULL,
  `tipo_documento_id` int(11) NOT NULL,
  `num_documento` varchar(20) NOT NULL,
  `creacion` varchar(25) NOT NULL DEFAULT current_timestamp(),
  `estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_proveedores`
--

INSERT INTO `tb_proveedores` (`id`, `titular`, `telefono`, `direccion`, `tipo_proveedor_id`, `tipo_documento_id`, `num_documento`, `creacion`, `estado`) VALUES
(1, 'Desconocido', 'Desconocido', 'Desconocido', 1, 1, 'Desconocido', '2024-07-27 02:07:44', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_transacciones_compras`
--

CREATE TABLE `tb_transacciones_compras` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `importe_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `metodo_pago_id` int(11) NOT NULL,
  `serie` varchar(20) DEFAULT NULL,
  `creacion` varchar(25) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_transacciones_compras`
--

INSERT INTO `tb_transacciones_compras` (`id`, `codigo`, `proveedor_id`, `usuario_id`, `importe_total`, `metodo_pago_id`, `serie`, `creacion`) VALUES
(11, 'Bverbkdgf', 1, 1, 100.00, 1, NULL, '2024-11-25 19:41:48'),
(12, 'Bw9c9JACh', 1, 1, 160.00, 1, NULL, '2024-11-25 19:42:04'),
(13, 'BtzqzNwzV', 1, 1, 749.00, 1, NULL, '2024-11-28 03:42:07'),
(14, 'BS97Xvd8n', 1, 1, 815.00, 1, NULL, '2024-11-28 03:43:01'),
(15, 'BFl8N6mBC', 1, 1, 110.00, 1, NULL, '2024-11-28 03:44:59'),
(16, 'BxwWGNsb3', 1, 1, 34.00, 1, NULL, '2024-11-28 14:19:27'),
(17, 'BVRKoyJio', 1, 1, 98.00, 1, NULL, '2024-11-28 14:42:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_transacciones_ventas`
--

CREATE TABLE `tb_transacciones_ventas` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `importe_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `metodo_pago_id` int(11) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT 0.00,
  `serie` varchar(20) DEFAULT NULL,
  `comentario` varchar(250) DEFAULT NULL,
  `creacion` varchar(25) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_transacciones_ventas`
--

INSERT INTO `tb_transacciones_ventas` (`id`, `codigo`, `cliente_id`, `usuario_id`, `importe_total`, `metodo_pago_id`, `descuento`, `serie`, `comentario`, `creacion`) VALUES
(127, 'SlWpb9EIW', 1, 1, 75.00, 1, 4.20, NULL, NULL, '2024-11-25 19:46:39'),
(128, 'SzBikqxFa', 1, 1, 64.00, 1, 0.00, NULL, NULL, '2024-11-29 01:08:53'),
(129, 'SkBYEyeH6', 1, 1, 17.00, 1, 0.00, NULL, NULL, '2024-11-29 01:09:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_usuarios`
--

CREATE TABLE `tb_usuarios` (
  `id` int(11) NOT NULL,
  `nombres` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `clave` varchar(255) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `rol_id` int(11) NOT NULL DEFAULT 5,
  `foto_id` int(11) DEFAULT 1,
  `creacion` varchar(25) NOT NULL DEFAULT current_timestamp(),
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `tema` varchar(10) NOT NULL DEFAULT 'purple'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_usuarios`
--

INSERT INTO `tb_usuarios` (`id`, `nombres`, `apellidos`, `usuario`, `clave`, `telefono`, `email`, `rol_id`, `foto_id`, `creacion`, `estado`, `tema`) VALUES
(1, 'Hanns Jhorkaeff', 'Maza Pareja', 'HannsMP', '$2a$04$v2knAd3CWaHRZpdQQY7d1uFxEXzvbWyilXTGEm9MHzV7CL7RbKq76', '991343365', 'hannsrps992@gmail.com', 1, 68, '2024-08-05 21:40:38', 1, 'purple'),
(2, 'Faviana Kimberly', 'Maza Pareja', 'FavianaMP', '$2a$04$kUCmPa.wl68Et0b5qEmvZ.hLG7PBCOtgttWqeHS2/fBipXDreVOwq', '926242334', 'favainaMP@gmail.com', 3, 1, '2024-06-27 02:07:44', 1, 'purple'),
(7, 'Fernanda Shery', 'Silva Zevallos', 'FernandaSZ', '$2a$04$klqRyg4RXD2FXnRUVs1R1OrUd/N1DwPl6gKGp9CxXPMMf6bRCh7Aq', '902223815', 'nose@gmail.com', 4, 1, '2024-09-29 22:37:37', 1, 'purple');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_ventas`
--

CREATE TABLE `tb_ventas` (
  `id` int(11) NOT NULL,
  `transaccion_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(10) NOT NULL DEFAULT 0,
  `importe` decimal(10,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tb_ventas`
--

INSERT INTO `tb_ventas` (`id`, `transaccion_id`, `producto_id`, `cantidad`, `importe`, `descuento`) VALUES
(2, 127, 53, 4, 68.00, 4.20),
(3, 128, 60, 1, 64.00, 0.00),
(4, 129, 53, 1, 17.00, 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tb_yapes`
--

CREATE TABLE `tb_yapes` (
  `id` int(11) NOT NULL,
  `hash` varchar(64) NOT NULL,
  `emisor` varchar(50) NOT NULL,
  `receptor` varchar(50) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha` varchar(25) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_cliente`
--

CREATE TABLE `tipo_cliente` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `descripcion` varchar(50) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tipo_cliente`
--

INSERT INTO `tipo_cliente` (`id`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Generica', 'Todos', 1),
(2, 'Cliente', 'Personas registradas', 1),
(3, 'Empresa', 'Para empresas', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_documento`
--

CREATE TABLE `tipo_documento` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `descripcion` varchar(50) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tipo_documento`
--

INSERT INTO `tipo_documento` (`id`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Ninguno', 'No especifico', 1),
(2, 'DNI', 'Documento Nacional de Identificacion', 1),
(3, 'RUC', 'Registro Unico de Contribuyente', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_metodo_pago`
--

CREATE TABLE `tipo_metodo_pago` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `igv` decimal(10,10) NOT NULL DEFAULT 0.0000000000,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tipo_metodo_pago`
--

INSERT INTO `tipo_metodo_pago` (`id`, `nombre`, `igv`, `estado`) VALUES
(1, 'Boleta', 0.0000000000, 1),
(2, 'Factura', 0.1800000000, 1),
(3, 'Yape', 0.1800000000, 1),
(4, 'Plin', 0.1800000000, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_proveedor`
--

CREATE TABLE `tipo_proveedor` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `descripcion` varchar(50) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tipo_proveedor`
--

INSERT INTO `tipo_proveedor` (`id`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Generica', 'Para todos los proveedores', 1),
(2, 'Empresa', 'Para proveedores grandes', 1),
(3, 'MicroEmpresa', 'Para proveedores pequeños', 1),
(4, 'Ambulante', 'para proveedores ambulatorias', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_rol`
--

CREATE TABLE `tipo_rol` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `tipo_rol`
--

INSERT INTO `tipo_rol` (`id`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Administrador', 'Tiene acceso total al sistema. Pueden crear, leer, actualizar y eliminar datos sin restricciones.\r\n', 1),
(2, 'Gerente', 'Tienen permisos para crear, leer y actualizar datos, pero no necesariamente para eliminarlos.', 1),
(3, 'Supervisor', 'Tienen permisos para crear y leer datos, y posiblemente actualizar sus propios datos, pero no los de otros usuarios.', 1),
(4, 'Colaborador', 'Tienen permisos para leer datos y posiblemente crear nuevos datos, pero no para actualizar o elimina datos.', 1),
(5, 'Visualizador', 'Este rol generalmente solo tiene permisos para leer datos.', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tb_acceso`
--
ALTER TABLE `tb_acceso`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tb_acceso_tb_menus` (`menu_id`),
  ADD KEY `fk_tb_acceso_tb_roles` (`rol_id`),
  ADD KEY `fk_tb_acceso_tb_permisos` (`permiso_id`),
  ADD KEY `fk_tb_acceso_tb_permisos_disabled` (`disabled_id`);

--
-- Indices de la tabla `tb_asistencias`
--
ALTER TABLE `tb_asistencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tb_asistencias_tb_usuarios` (`usuario_id`);

--
-- Indices de la tabla `tb_categorias`
--
ALTER TABLE `tb_categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `tb_clientes`
--
ALTER TABLE `tb_clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `num_documento` (`num_documento`),
  ADD UNIQUE KEY `telefono` (`telefono`),
  ADD KEY `fk_tb_clientes_tipo_cliente` (`tipo_cliente_id`) USING BTREE,
  ADD KEY `fk_tb_clientes_tipo_documento` (`tipo_documento_id`) USING BTREE;

--
-- Indices de la tabla `tb_compras`
--
ALTER TABLE `tb_compras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tb_compras_tb_transacciones_compras` (`transaccion_id`),
  ADD KEY `fk_tb_compras_tb_productos` (`producto_id`);

--
-- Indices de la tabla `tb_fotos`
--
ALTER TABLE `tb_fotos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hash` (`hash`);

--
-- Indices de la tabla `tb_menus`
--
ALTER TABLE `tb_menus`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `path` (`ruta`);

--
-- Indices de la tabla `tb_permisos`
--
ALTER TABLE `tb_permisos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tb_productos`
--
ALTER TABLE `tb_productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `fk_tb_productos_tb_categorias` (`categoria_id`),
  ADD KEY `fk_tb_productos_tb_fotos` (`foto_id`);

--
-- Indices de la tabla `tb_proveedores`
--
ALTER TABLE `tb_proveedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `telefono` (`telefono`),
  ADD UNIQUE KEY `num_documento` (`num_documento`),
  ADD KEY `fk_tb_proveedores_tipo_proveedor` (`tipo_proveedor_id`),
  ADD KEY `fk_tb_proveedores_tipo_documento` (`tipo_documento_id`);

--
-- Indices de la tabla `tb_transacciones_compras`
--
ALTER TABLE `tb_transacciones_compras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD UNIQUE KEY `serie` (`serie`),
  ADD KEY `fk_tb_transacciones_compras_tb_proveedores` (`proveedor_id`),
  ADD KEY `fk_tb_transacciones_compras_tb_usuarios` (`usuario_id`),
  ADD KEY `fk_tb_transacciones_compras_tipo_metodo_pago` (`metodo_pago_id`);

--
-- Indices de la tabla `tb_transacciones_ventas`
--
ALTER TABLE `tb_transacciones_ventas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD UNIQUE KEY `serie` (`serie`),
  ADD KEY `fk_tb_transacciones_ventas_tb_clientes` (`cliente_id`),
  ADD KEY `fk_tb_transacciones_ventas_tb_usuarios` (`usuario_id`),
  ADD KEY `fk_tb_transacciones_ventas_tipo_metodo_pago` (`metodo_pago_id`);

--
-- Indices de la tabla `tb_usuarios`
--
ALTER TABLE `tb_usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `telefono` (`telefono`),
  ADD KEY `fk_tb_usuarios_tb_roles` (`rol_id`) USING BTREE,
  ADD KEY `fk_tb_usuarios_tb_fotos` (`foto_id`) USING BTREE;

--
-- Indices de la tabla `tb_ventas`
--
ALTER TABLE `tb_ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tb_ventas_tb_transacciones_ventas` (`transaccion_id`),
  ADD KEY `fk_tb_ventas_tb_productos` (`producto_id`);

--
-- Indices de la tabla `tb_yapes`
--
ALTER TABLE `tb_yapes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipo_cliente`
--
ALTER TABLE `tipo_cliente`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipo_documento`
--
ALTER TABLE `tipo_documento`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipo_metodo_pago`
--
ALTER TABLE `tipo_metodo_pago`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipo_proveedor`
--
ALTER TABLE `tipo_proveedor`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipo_rol`
--
ALTER TABLE `tipo_rol`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tb_acceso`
--
ALTER TABLE `tb_acceso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=771;

--
-- AUTO_INCREMENT de la tabla `tb_asistencias`
--
ALTER TABLE `tb_asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT de la tabla `tb_categorias`
--
ALTER TABLE `tb_categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT de la tabla `tb_clientes`
--
ALTER TABLE `tb_clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `tb_compras`
--
ALTER TABLE `tb_compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `tb_fotos`
--
ALTER TABLE `tb_fotos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT de la tabla `tb_menus`
--
ALTER TABLE `tb_menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=155;

--
-- AUTO_INCREMENT de la tabla `tb_permisos`
--
ALTER TABLE `tb_permisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT de la tabla `tb_productos`
--
ALTER TABLE `tb_productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `tb_proveedores`
--
ALTER TABLE `tb_proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tb_transacciones_compras`
--
ALTER TABLE `tb_transacciones_compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `tb_transacciones_ventas`
--
ALTER TABLE `tb_transacciones_ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT de la tabla `tb_usuarios`
--
ALTER TABLE `tb_usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `tb_ventas`
--
ALTER TABLE `tb_ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tb_yapes`
--
ALTER TABLE `tb_yapes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_cliente`
--
ALTER TABLE `tipo_cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tipo_documento`
--
ALTER TABLE `tipo_documento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipo_proveedor`
--
ALTER TABLE `tipo_proveedor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tb_acceso`
--
ALTER TABLE `tb_acceso`
  ADD CONSTRAINT `fk_tb_acceso_tb_menus` FOREIGN KEY (`menu_id`) REFERENCES `tb_menus` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_acceso_tb_permisos` FOREIGN KEY (`permiso_id`) REFERENCES `tb_permisos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_acceso_tb_permisos_disabled` FOREIGN KEY (`disabled_id`) REFERENCES `tb_permisos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_acceso_tb_roles` FOREIGN KEY (`rol_id`) REFERENCES `tipo_rol` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `tb_asistencias`
--
ALTER TABLE `tb_asistencias`
  ADD CONSTRAINT `fk_tb_asistencias_tb_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `tb_usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `tb_clientes`
--
ALTER TABLE `tb_clientes`
  ADD CONSTRAINT `fk_tb_clientes_tb_tipo_cliente` FOREIGN KEY (`tipo_cliente_id`) REFERENCES `tipo_cliente` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_clientes_tb_tipo_documento` FOREIGN KEY (`tipo_documento_id`) REFERENCES `tipo_documento` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `tb_compras`
--
ALTER TABLE `tb_compras`
  ADD CONSTRAINT `fk_tb_compras_tb_productos` FOREIGN KEY (`producto_id`) REFERENCES `tb_productos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_compras_tb_transacciones_compras` FOREIGN KEY (`transaccion_id`) REFERENCES `tb_transacciones_compras` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `tb_productos`
--
ALTER TABLE `tb_productos`
  ADD CONSTRAINT `fk_tb_productos_tb_categorias` FOREIGN KEY (`categoria_id`) REFERENCES `tb_categorias` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_productos_tb_fotos` FOREIGN KEY (`foto_id`) REFERENCES `tb_fotos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `tb_proveedores`
--
ALTER TABLE `tb_proveedores`
  ADD CONSTRAINT `fk_tb_proveedores_tipo_documento` FOREIGN KEY (`tipo_documento_id`) REFERENCES `tipo_documento` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_proveedores_tipo_proveedor` FOREIGN KEY (`tipo_proveedor_id`) REFERENCES `tipo_proveedor` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `tb_transacciones_compras`
--
ALTER TABLE `tb_transacciones_compras`
  ADD CONSTRAINT `fk_tb_transacciones_compras_tb_proveedores` FOREIGN KEY (`proveedor_id`) REFERENCES `tb_proveedores` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_transacciones_compras_tb_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `tb_usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_transacciones_compras_tipo_metodo_pago` FOREIGN KEY (`metodo_pago_id`) REFERENCES `tipo_metodo_pago` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `tb_transacciones_ventas`
--
ALTER TABLE `tb_transacciones_ventas`
  ADD CONSTRAINT `fk_tb_transacciones_ventas_tb_clientes` FOREIGN KEY (`cliente_id`) REFERENCES `tb_clientes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_transacciones_ventas_tb_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `tb_usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_transacciones_ventas_tipo_metodo_pago` FOREIGN KEY (`metodo_pago_id`) REFERENCES `tipo_metodo_pago` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `tb_usuarios`
--
ALTER TABLE `tb_usuarios`
  ADD CONSTRAINT `fk_tb_foto_tb_usuarios` FOREIGN KEY (`foto_id`) REFERENCES `tb_fotos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_roles_tb_usuarios` FOREIGN KEY (`rol_id`) REFERENCES `tipo_rol` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `tb_ventas`
--
ALTER TABLE `tb_ventas`
  ADD CONSTRAINT `fk_tb_ventas_tb_productos` FOREIGN KEY (`producto_id`) REFERENCES `tb_productos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tb_ventas_tb_transacciones_ventas` FOREIGN KEY (`transaccion_id`) REFERENCES `tb_transacciones_ventas` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
