-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2024 a las 09:28:36
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
-- Estructura de tabla para la tabla `schema_db`
--

CREATE TABLE `schema_db` (
  `id` int(11) NOT NULL,
  `version` varchar(20) NOT NULL,
  `descripcion` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `schema_db`
--

INSERT INTO `schema_db` (`id`, `version`, `descripcion`) VALUES
(1, '1.0.0', '');

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
(81, 1, 1, 63, 0),
(82, 1, 2, 1, 62),
(83, 1, 3, 1, 62),
(84, 1, 4, 1, 62),
(85, 1, 5, 1, 62),
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
(351, 66, 1, 63, 0),
(352, 66, 2, 63, 0),
(353, 66, 3, 0, 0),
(354, 66, 4, 0, 0),
(355, 66, 5, 0, 63),
(366, 69, 1, 63, 0),
(367, 69, 2, 2, 62),
(368, 69, 3, 2, 62),
(369, 69, 4, 0, 62),
(370, 69, 5, 0, 62),
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
(771, 155, 1, 62, 0),
(772, 155, 2, 0, 63),
(773, 155, 3, 0, 63),
(774, 155, 4, 0, 63),
(775, 155, 5, 0, 63),
(781, 157, 1, 63, 0),
(782, 157, 2, 0, 63),
(783, 157, 3, 0, 63),
(784, 157, 4, 0, 63),
(785, 157, 5, 0, 63),
(786, 158, 1, 63, 0),
(787, 158, 2, 0, 63),
(788, 158, 3, 0, 63),
(789, 158, 4, 0, 63),
(790, 158, 5, 0, 63),
(791, 159, 1, 63, 0),
(792, 159, 2, 0, 63),
(793, 159, 3, 0, 63),
(794, 159, 4, 0, 63),
(795, 159, 5, 0, 63),
(796, 160, 1, 63, 0),
(797, 160, 2, 0, 63),
(798, 160, 3, 0, 63),
(799, 160, 4, 0, 63),
(800, 160, 5, 0, 63);

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
(71, 1, '2024-11-30 01:38:50', '2024-11-30 03:17:29'),
(72, 1, '2024-12-01 03:33:20', '2024-12-01 17:47:55'),
(73, 2, '2024-12-01 17:47:40', '2024-12-01 17:48:39'),
(74, 1, '2024-12-02 00:54:24', '2024-12-02 20:40:45'),
(75, 1, '2024-12-03 00:01:08', '2024-12-03 03:10:28');

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
(31, ':api', '/api/acceso/chart/read'),
(32, ':api', '/api/usuarios/profile/updateFoto'),
(33, ':api', '/api/usuarios/chart/read'),
(46, ':bot', 'url'),
(47, ':bot', 'recuperar'),
(54, ':bot', 'ventas'),
(66, ':control', '/control/movimientos/compras'),
(69, ':api', '/api/productos/table/insert'),
(75, ':api', '/api/usuarios/profile/updatePassword'),
(76, ':control', '/control/administracion/bot'),
(88, ':control', '/control/servidor'),
(89, ':control', '/control/servidor/cpu'),
(106, ':api', '/api/asistencia/table/readAll'),
(107, ':bot', 'asistencia'),
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
(144, ':control', '/control/mantenimiento/proveedores'),
(145, ':control', '/control/reportes/compras'),
(146, ':control', '/control/administracion/tipos'),
(155, ':test', 'gaaa'),
(157, ':test', 'reer'),
(158, ':test', 'poda'),
(159, ':api', '/api/productos/table/updateId'),
(160, ':control', '/control/servidor/terminal');

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
(52, 'IBZADISRJ', 'Ula Ula Cintado', 'Cintas escarchada de colores', 16.00, 0, 0, 40, 2, '2024-09-27 00:12:55', 1),
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
(2, 'Faviana Kimberly', 'Maza Pareja', 'FavianaMP', '$2a$04$kUCmPa.wl68Et0b5qEmvZ.hLG7PBCOtgttWqeHS2/fBipXDreVOwq', '926242334', 'favainaMP@gmail.com', 2, 1, '2024-06-27 02:07:44', 1, 'purple'),
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
-- Indices de la tabla `schema_db`
--
ALTER TABLE `schema_db`
  ADD PRIMARY KEY (`id`);

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
  ADD KEY `fk_tb_usuarios_tb_fotos` (`foto_id`) USING BTREE,
  ADD KEY `fk_tb_usuarios_tipo_rol` (`rol_id`) USING BTREE;

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
-- AUTO_INCREMENT de la tabla `schema_db`
--
ALTER TABLE `schema_db`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `tb_acceso`
--
ALTER TABLE `tb_acceso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=801;

--
-- AUTO_INCREMENT de la tabla `tb_asistencias`
--
ALTER TABLE `tb_asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
