-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.13.0.7147
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for furniture_db
CREATE DATABASE IF NOT EXISTS `furniture_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `furniture_db`;

-- Dumping structure for table furniture_db._prisma_migrations
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db._prisma_migrations: ~3 rows (approximately)
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
	('2ecd9c7b-efbd-4229-8148-418dfae76acb', '6082da71dc2d32b5fe803922bea2a63b60033c3eac7b2ec4c39d918bb1ab4bf4', '2025-11-23 07:58:10.893', '20251123075810_remove_updated_at', NULL, NULL, '2025-11-23 07:58:10.863', 1),
	('437cd56d-2537-4a7b-9167-b14a00690e0b', 'c38cd77983c917c23064fe746d9273e96f6de77db85c9aa43c19699c92c0976d', '2025-11-23 07:58:09.349', '20251122155430_init', NULL, NULL, '2025-11-23 07:58:09.334', 1),
	('d6e6b540-a17c-4baa-9385-f5123849c612', '67f1442d1ede800f5836672dbf03f94f660594899cdcd19a8369e3b729c5a6e3', '2025-11-23 07:58:09.333', '20251122130746_init', NULL, NULL, '2025-11-23 07:58:08.742', 1);

-- Dumping structure for table furniture_db.audit_logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) DEFAULT NULL,
  `oldValue` text DEFAULT NULL,
  `newValue` text DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_userId_idx` (`userId`),
  KEY `audit_logs_entity_idx` (`entity`),
  KEY `audit_logs_createdAt_idx` (`createdAt`),
  CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db.audit_logs: ~23 rows (approximately)
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `entity`, `entityId`, `oldValue`, `newValue`, `ipAddress`, `userAgent`, `createdAt`) VALUES
	('014e1a02-6f25-44fc-8442-993d3bff2736', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '6834794a-317e-42c6-a4a2-a4ed4b037f22', 'null', '{"id":"6834794a-317e-42c6-a4a2-a4ed4b037f22","orderNumber":"ORD17640426652911669","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"CANCELLED","paymentMethod":"COD","paymentStatus":"UNPAID","subtotal":"10000","discount":"0","shippingFee":"30000","total":"40000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hà Nội","notes":"","cancelReason":null,"completedAt":"2025-11-25T03:52:15.664Z","cancelledAt":"2025-11-25T07:24:13.241Z","createdAt":"2025-11-25T03:51:05.295Z","updatedAt":"2025-11-25T07:24:13.257Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-25 07:24:13.271'),
	('0a29d0d4-60cf-4ea5-b0df-a0710aa2ae5d', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '6834794a-317e-42c6-a4a2-a4ed4b037f22', 'null', '{"id":"6834794a-317e-42c6-a4a2-a4ed4b037f22","orderNumber":"ORD17640426652911669","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"COD","paymentStatus":"UNPAID","subtotal":"10000","discount":"0","shippingFee":"30000","total":"40000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hà Nội","notes":"","cancelReason":null,"completedAt":"2025-11-25T03:52:15.664Z","cancelledAt":null,"createdAt":"2025-11-25T03:51:05.295Z","updatedAt":"2025-11-25T03:52:15.665Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-25 03:52:15.675'),
	('0d915117-7fd7-438e-b333-dedccdbbddda', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '23163141-863f-432c-b332-83a61431dca8', 'null', '{"id":"23163141-863f-432c-b332-83a61431dca8","orderNumber":"ORD17639845168844783","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"UNPAID","subtotal":"400000","discount":"0","shippingFee":"30000","total":"430000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Thành, Quận 2, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-24T14:33:55.318Z","cancelledAt":null,"createdAt":"2025-11-24T11:41:56.888Z","updatedAt":"2025-11-24T14:33:55.321Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-24 14:33:55.367'),
	('1636a419-2b84-4c91-bf50-efe46d060032', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'ae0b1b73-3fa4-4a37-8361-4804d014a848', 'null', '{"id":"ae0b1b73-3fa4-4a37-8361-4804d014a848","orderNumber":"ORD17645074997708240","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"600000","discount":"600000","shippingFee":"30000","total":"30000","voucherCode":"flash-sale","voucherId":"7dd2fb42-7a50-4fd7-a5ac-bd8bfbbacf3c","customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"61 đường số 5 ,Tân tạo,Tp.HCM","notes":"","cancelReason":null,"completedAt":"2025-11-30T13:07:26.338Z","cancelledAt":null,"createdAt":"2025-11-30T12:58:19.773Z","updatedAt":"2025-11-30T13:07:26.339Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-30 13:07:26.349'),
	('1eb15ce1-b320-4cf8-9a1e-cfa880b77d48', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'c8c126be-6e67-44f9-aea4-385ebf87eef8', 'null', '{"id":"c8c126be-6e67-44f9-aea4-385ebf87eef8","orderNumber":"ORD17644095399780501","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"SHIPPING","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"0","discount":"0","shippingFee":"30000","total":"30000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 2, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":null,"cancelledAt":null,"createdAt":"2025-11-29T09:45:39.979Z","updatedAt":"2025-11-29T15:09:36.808Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-29 15:09:36.818'),
	('3cb8605d-df3f-4c35-9168-a9957f0008f6', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'c28f22dc-882f-4a24-8265-d31e68b4870a', 'null', '{"id":"c28f22dc-882f-4a24-8265-d31e68b4870a","orderNumber":"ORD17640594103970917","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"6000000","discount":"6000000","shippingFee":"0","total":"0","voucherCode":"flash-sale","voucherId":"7dd2fb42-7a50-4fd7-a5ac-bd8bfbbacf3c","customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 2, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-30T13:07:39.742Z","cancelledAt":null,"createdAt":"2025-11-25T08:30:10.403Z","updatedAt":"2025-11-30T13:07:39.744Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-30 13:07:39.749'),
	('4585ccd5-8a51-4657-b31c-6c424a5e49ec', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '749f97de-f8a8-41eb-92b5-77d2da8000a7', 'null', '{"id":"749f97de-f8a8-41eb-92b5-77d2da8000a7","orderNumber":"ORD17645944185603291","userId":"ae829e12-26dd-4797-9060-e92a22e1d171","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"600000","discount":"600000","shippingFee":"30000","total":"30000","voucherCode":"flash-sale","voucherId":"7dd2fb42-7a50-4fd7-a5ac-bd8bfbbacf3c","customerName":"Thanh Vương","customerEmail":"thanhvuong0419@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu","notes":"","cancelReason":null,"completedAt":"2025-12-01T13:20:55.851Z","cancelledAt":null,"createdAt":"2025-12-01T13:06:58.565Z","updatedAt":"2025-12-01T13:20:55.853Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-12-01 13:20:58.355'),
	('46a56e3d-0789-44ff-af66-daf137daa1ff', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '1b2b96d6-de6e-4c18-bc75-9e8dde7188e2', 'null', '{"id":"1b2b96d6-de6e-4c18-bc75-9e8dde7188e2","orderNumber":"ORD17639995859788184","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"UNPAID","subtotal":"600000","discount":"0","shippingFee":"30000","total":"630000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-25T03:52:28.742Z","cancelledAt":null,"createdAt":"2025-11-24T15:53:05.980Z","updatedAt":"2025-11-25T03:52:28.743Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-25 03:52:28.753'),
	('4cfb212d-f23d-4ec3-b10e-8ff638c36462', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '6adafdff-c011-4193-8598-63cbe229cb6d', 'null', '{"id":"6adafdff-c011-4193-8598-63cbe229cb6d","orderNumber":"ORD17640417074121230","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"COD","paymentStatus":"UNPAID","subtotal":"10000","discount":"0","shippingFee":"30000","total":"40000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-25T03:52:19.917Z","cancelledAt":null,"createdAt":"2025-11-25T03:35:07.416Z","updatedAt":"2025-11-25T03:52:19.918Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-25 03:52:19.929'),
	('65f8f293-788d-4bec-b46b-f4a9b648a588', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '7f34309c-fa01-4d27-9175-dcf7438ef4f0', 'null', '{"id":"7f34309c-fa01-4d27-9175-dcf7438ef4f0","orderNumber":"ORD17644272586983281","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"SHIPPING","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"0","discount":"0","shippingFee":"30000","total":"30000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"61 đường số 5,Tân tạo","notes":"","cancelReason":null,"completedAt":null,"cancelledAt":null,"createdAt":"2025-11-29T14:40:58.701Z","updatedAt":"2025-11-29T15:09:32.014Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-29 15:09:32.023'),
	('7d6f4987-9db9-441d-bf7a-2f93e9a8bda0', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '0fd2f2ab-5776-4c91-80e6-78c4dcf07621', 'null', '{"id":"0fd2f2ab-5776-4c91-80e6-78c4dcf07621","orderNumber":"ORD17639977913838775","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"600000","discount":"0","shippingFee":"30000","total":"630000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"5 nguyễn thị minh khai, Phường Bến Thành, Quận 3, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-24T16:26:34.952Z","cancelledAt":null,"createdAt":"2025-11-24T15:23:11.386Z","updatedAt":"2025-11-24T16:26:34.954Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-24 16:26:34.962'),
	('7ece57f2-4d55-4595-859f-b9023701421e', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'f6d122a2-8397-469f-a920-5c2ecb6acc7e', 'null', '{"id":"f6d122a2-8397-469f-a920-5c2ecb6acc7e","orderNumber":"ORD17639971262196563","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"10000","discount":"0","shippingFee":"30000","total":"40000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-24T16:26:38.526Z","cancelledAt":null,"createdAt":"2025-11-24T15:12:06.222Z","updatedAt":"2025-11-24T16:26:38.528Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-24 16:26:38.535'),
	('7fc6badd-6f22-4a85-bbdd-9168ae1ec18e', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'bef65735-d447-48a0-9e7f-1e5e8e895517', 'null', '{"id":"bef65735-d447-48a0-9e7f-1e5e8e895517","orderNumber":"ORD17644303368079517","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"SHIPPING","paymentMethod":"COD","paymentStatus":"UNPAID","subtotal":"5500000","discount":"150000","shippingFee":"0","total":"5350000","voucherCode":"Sunday","voucherId":"1236679f-c13f-492e-9d49-e65bb8173e1c","customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"273 An Dương Vương,phường Chợ Quán,Tp.HCM","notes":"","cancelReason":null,"completedAt":null,"cancelledAt":null,"createdAt":"2025-11-29T15:32:16.810Z","updatedAt":"2025-11-30T13:07:33.596Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-30 13:07:33.602'),
	('873436a8-13ba-49c2-8097-7b99a8b8e0ce', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '973de7a9-5b88-476a-a230-f229f7d0304b', 'null', '{"id":"973de7a9-5b88-476a-a230-f229f7d0304b","orderNumber":"ORD17644054444660073","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"360000","discount":"0","shippingFee":"30000","total":"390000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 2, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-30T13:07:43.363Z","cancelledAt":null,"createdAt":"2025-11-29T08:37:24.469Z","updatedAt":"2025-11-30T13:07:43.364Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-30 13:07:43.370'),
	('96fc3af4-8e61-45df-bc9b-681d9e581c01', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'b6c69e21-ab6c-43a1-801e-0f85b666e546', 'null', '{"id":"b6c69e21-ab6c-43a1-801e-0f85b666e546","orderNumber":"ORD17639998348611778","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"650000","discount":"0","shippingFee":"30000","total":"680000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-24T16:26:19.946Z","cancelledAt":null,"createdAt":"2025-11-24T15:57:14.863Z","updatedAt":"2025-11-24T16:26:19.947Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-24 16:26:19.954'),
	('9f096da8-29cf-49e4-90fe-3693c4087bae', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'c9330fc8-5095-475e-a069-e6eae58d9d22', 'null', '{"id":"c9330fc8-5095-475e-a069-e6eae58d9d22","orderNumber":"ORD17639830059627943","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"COD","paymentStatus":"UNPAID","subtotal":"6000000","discount":"0","shippingFee":"0","total":"6000000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"61 võ thị sáu, Phường Bến Nghé, Quận 1, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-24T14:34:22.145Z","cancelledAt":null,"createdAt":"2025-11-24T11:16:45.964Z","updatedAt":"2025-11-24T14:34:22.147Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-24 14:34:22.154'),
	('d090668d-ecb3-42a8-9bb6-3ebf4d4bfff5', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'c9330fc8-5095-475e-a069-e6eae58d9d22', 'null', '{"id":"c9330fc8-5095-475e-a069-e6eae58d9d22","orderNumber":"ORD17639830059627943","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"SHIPPING","paymentMethod":"COD","paymentStatus":"UNPAID","subtotal":"6000000","discount":"0","shippingFee":"0","total":"6000000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"61 võ thị sáu, Phường Bến Nghé, Quận 1, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":null,"cancelledAt":null,"createdAt":"2025-11-24T11:16:45.964Z","updatedAt":"2025-11-24T14:34:17.269Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-24 14:34:17.277'),
	('d6be6cb9-3461-4b8b-94b8-b66a6cd72c7e', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '973de7a9-5b88-476a-a230-f229f7d0304b', 'null', '{"id":"973de7a9-5b88-476a-a230-f229f7d0304b","orderNumber":"ORD17644054444660073","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"SHIPPING","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"360000","discount":"0","shippingFee":"30000","total":"390000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 2, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":null,"cancelledAt":null,"createdAt":"2025-11-29T08:37:24.469Z","updatedAt":"2025-11-29T15:09:40.702Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-29 15:09:40.709'),
	('d73238c9-1d20-4b9a-9ed6-648acc1a4a8f', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '4da23cb4-db8f-4c15-8b93-837a9bdb8d5b', 'null', '{"id":"4da23cb4-db8f-4c15-8b93-837a9bdb8d5b","orderNumber":"ORD17640374975343356","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"8010000","discount":"150000","shippingFee":"0","total":"7860000","voucherCode":"Sunday","voucherId":"1236679f-c13f-492e-9d49-e65bb8173e1c","customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-25T03:52:24.602Z","cancelledAt":null,"createdAt":"2025-11-25T02:24:57.541Z","updatedAt":"2025-11-25T03:52:24.603Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-25 03:52:24.607'),
	('d8c95383-1255-4106-b847-c89a096c678b', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '7b3b56fe-33c2-4e8c-9ba8-eff1fe9e0261', 'null', '{"id":"7b3b56fe-33c2-4e8c-9ba8-eff1fe9e0261","orderNumber":"ORD17640010459238461","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"8360000","discount":"100000","shippingFee":"0","total":"8260000","voucherCode":"Black-Friday","voucherId":"77a9cc38-fd6d-472d-817f-7f51e3af10c8","customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-24T16:26:09.245Z","cancelledAt":null,"createdAt":"2025-11-24T16:17:25.926Z","updatedAt":"2025-11-24T16:26:09.247Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-24 16:26:09.263'),
	('dcf48a6d-bbd4-4743-8a6b-13705be2818f', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'c28f22dc-882f-4a24-8265-d31e68b4870a', 'null', '{"id":"c28f22dc-882f-4a24-8265-d31e68b4870a","orderNumber":"ORD17640594103970917","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"SHIPPING","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"6000000","discount":"6000000","shippingFee":"0","total":"0","voucherCode":"flash-sale","voucherId":"7dd2fb42-7a50-4fd7-a5ac-bd8bfbbacf3c","customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 2, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":null,"cancelledAt":null,"createdAt":"2025-11-25T08:30:10.403Z","updatedAt":"2025-11-29T15:09:44.144Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-29 15:09:44.149'),
	('e329971f-7f36-4813-a209-513e47ad6839', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'bef65735-d447-48a0-9e7f-1e5e8e895517', 'null', '{"id":"bef65735-d447-48a0-9e7f-1e5e8e895517","orderNumber":"ORD17644303368079517","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"COD","paymentStatus":"UNPAID","subtotal":"5500000","discount":"150000","shippingFee":"0","total":"5350000","voucherCode":"Sunday","voucherId":"1236679f-c13f-492e-9d49-e65bb8173e1c","customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"273 An Dương Vương,phường Chợ Quán,Tp.HCM","notes":"","cancelReason":null,"completedAt":"2025-12-01T13:20:32.786Z","cancelledAt":null,"createdAt":"2025-11-29T15:32:16.810Z","updatedAt":"2025-12-01T13:20:32.787Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-12-01 13:20:35.462'),
	('e3517ed7-4933-4a8c-810c-83393916cc1d', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '84ff98d2-4bb6-4322-bdf4-c38b3f0ab68c', 'null', '{"id":"84ff98d2-4bb6-4322-bdf4-c38b3f0ab68c","orderNumber":"ORD17639991916785266","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"MOMO","paymentStatus":"PAID","subtotal":"5500000","discount":"0","shippingFee":"0","total":"5500000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":"2025-11-24T16:26:24.663Z","cancelledAt":null,"createdAt":"2025-11-24T15:46:31.680Z","updatedAt":"2025-11-24T16:26:24.664Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-24 16:26:24.675'),
	('e51c9549-a2db-45c5-b55f-9548f82c4264', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'b4fc0ca7-f67d-460f-9a97-ae457bd87c49', 'null', '{"id":"b4fc0ca7-f67d-460f-9a97-ae457bd87c49","orderNumber":"ORD17646633116068117","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"CANCELLED","paymentMethod":"MOMO","paymentStatus":"UNPAID","subtotal":"9700000","discount":"0","shippingFee":"0","total":"9700000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"61 đường số 5 ,Tân tạo,Tp.HCM","notes":"","cancelReason":null,"completedAt":null,"cancelledAt":"2025-12-02T08:17:47.768Z","createdAt":"2025-12-02T08:15:11.610Z","updatedAt":"2025-12-02T08:17:47.803Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-12-02 08:17:50.753'),
	('eb76aa75-cf8f-4bb1-8cc6-5e6dac889387', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', 'c9330fc8-5095-475e-a069-e6eae58d9d22', 'null', '{"id":"c9330fc8-5095-475e-a069-e6eae58d9d22","orderNumber":"ORD17639830059627943","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"PROCESSING","paymentMethod":"COD","paymentStatus":"UNPAID","subtotal":"6000000","discount":"0","shippingFee":"0","total":"6000000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"61 võ thị sáu, Phường Bến Nghé, Quận 1, Hồ Chí Minh","notes":"","cancelReason":null,"completedAt":null,"cancelledAt":null,"createdAt":"2025-11-24T11:16:45.964Z","updatedAt":"2025-11-24T14:34:15.243Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-24 14:34:15.250'),
	('f3554ef8-b05a-42ea-b665-7b82f44e7da8', 'b159035d-53aa-46b8-84f9-4f777eaa0233', 'UPDATE_ORDER_STATUS', 'Order', '6834794a-317e-42c6-a4a2-a4ed4b037f22', 'null', '{"id":"6834794a-317e-42c6-a4a2-a4ed4b037f22","orderNumber":"ORD17640426652911669","userId":"309bc28d-8ebd-4fbc-b838-21c0fa973713","status":"COMPLETED","paymentMethod":"COD","paymentStatus":"UNPAID","subtotal":"10000","discount":"0","shippingFee":"30000","total":"40000","voucherCode":null,"voucherId":null,"customerName":"Thịnh Thới","customerEmail":"user1@gmail.com","customerPhone":"0336618557","shippingAddress":"7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hà Nội","notes":"","cancelReason":null,"completedAt":"2025-11-25T07:24:15.714Z","cancelledAt":"2025-11-25T07:24:13.241Z","createdAt":"2025-11-25T03:51:05.295Z","updatedAt":"2025-11-25T07:24:15.716Z"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', '2025-11-25 07:24:15.723');

-- Dumping structure for table furniture_db.cart_items
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` varchar(191) NOT NULL,
  `cartId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_cartId_productId_key` (`cartId`,`productId`),
  KEY `cart_items_cartId_idx` (`cartId`),
  KEY `cart_items_productId_idx` (`productId`),
  CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db.cart_items: ~1 rows (approximately)
INSERT INTO `cart_items` (`id`, `cartId`, `productId`, `quantity`, `createdAt`) VALUES
	('3c4aba6a-1286-4f65-ba27-6464bbf46d68', 'f5c77f55-1dc7-47b7-b773-397a886f4f6d', 'f85782b1-c843-11f0-bae8-00fffe46637b', 2, '2025-12-02 08:13:01.336'),
	('defac661-931a-4aed-8f2b-ec543bb4d9e8', '7a0ef114-7e2f-4bff-b6e5-08a1545727c7', 'f85782b1-c843-11f0-bae8-00fffe46637b', 2, '2025-12-02 08:17:10.494');

-- Dumping structure for table furniture_db.carts
CREATE TABLE IF NOT EXISTS `carts` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `carts_userId_idx` (`userId`),
  CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db.carts: ~2 rows (approximately)
INSERT INTO `carts` (`id`, `userId`, `createdAt`) VALUES
	('34536440-bf2f-49af-8bda-f1386a5502b3', 'ae829e12-26dd-4797-9060-e92a22e1d171', '2025-12-01 13:05:12.528'),
	('7a0ef114-7e2f-4bff-b6e5-08a1545727c7', 'b159035d-53aa-46b8-84f9-4f777eaa0233', '2025-11-25 03:51:50.983'),
	('f5c77f55-1dc7-47b7-b773-397a886f4f6d', '309bc28d-8ebd-4fbc-b838-21c0fa973713', '2025-11-25 02:56:08.561');

-- Dumping structure for table furniture_db.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_key` (`name`),
  UNIQUE KEY `categories_slug_key` (`slug`),
  KEY `categories_parentId_fkey` (`parentId`),
  CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db.categories: ~4 rows (approximately)
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image`, `parentId`, `isActive`, `createdAt`) VALUES
	('d0a77ae6-c842-11f0-bae8-00fffe46637b', 'Nội thất phòng khách', 'noi-that-phong-khach', 'Sản phẩm nội thất cho phòng khách', '/images/noi-that-phong-khach.jfif', NULL, 1, '2025-11-23 15:02:54.251'),
	('d0a78516-c842-11f0-bae8-00fffe46637b', 'Nội thất phòng ngủ', 'noi-that-phong-ngu', 'Sản phẩm nội thất cho phòng ngủ', '/images/noi-that-phong-ngu.jfif', NULL, 1, '2025-11-23 15:02:54.251'),
	('d0a7861c-c842-11f0-bae8-00fffe46637b', 'Nội thất văn phòng', 'noi-that-van-phong', 'Nội thất cho không gian làm việc', '/images/noi-that-phong-lam-viec.jfif', NULL, 1, '2025-11-23 15:02:54.251'),
	('d0a78690-c842-11f0-bae8-00fffe46637b', 'Nội thất phòng ăn', 'noi-that-phong-an', 'Nội thất cho không gian nhà bếp', '/images/noi-that-phong-an.jfif', NULL, 1, '2025-11-23 15:02:54.251');

-- Dumping structure for table furniture_db.contacts
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `subject` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `isReplied` tinyint(1) NOT NULL DEFAULT 0,
  `reply` text DEFAULT NULL,
  `repliedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `contacts_isRead_idx` (`isRead`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db.contacts: ~2 rows (approximately)
INSERT INTO `contacts` (`id`, `name`, `email`, `phone`, `subject`, `message`, `isRead`, `isReplied`, `reply`, `repliedAt`, `createdAt`) VALUES
	('5d4ed1a9-9322-4b12-9d39-76f23ab1b74d', 'Thịnh Thới', 'user1@gmail.com', '0336618557', 'Tư vấn sản phẩm', 'Tôi muốn bạn tư vấn sản phẩm test', 1, 1, 'bên mình muốn tư vấn sản phẩm nào ạ', '2025-11-27 14:35:49.214', '2025-11-25 07:22:05.680'),
	('924462d9-93a7-4b78-89f2-9cf274f9439d', 'Thịnh Thới', 'user1@gmail.com', '0336618557', 'Tư vấn sản phẩm', 'tôi muốn tư vấn sản phẩm A', 1, 1, 'bạn muốn tư vấn sản phẩm nào', '2025-11-30 13:06:31.277', '2025-11-30 13:05:54.359');

-- Dumping structure for table furniture_db.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `productName` varchar(191) NOT NULL,
  `productSku` varchar(191) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `order_items_orderId_idx` (`orderId`),
  KEY `order_items_productId_idx` (`productId`),
  CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db.order_items: ~30 rows (approximately)
INSERT INTO `order_items` (`id`, `orderId`, `productId`, `productName`, `productSku`, `price`, `quantity`, `subtotal`, `createdAt`) VALUES
	('0f84c6a0-bdc8-4c01-811f-624792ca09f4', 'bef65735-d447-48a0-9e7f-1e5e8e895517', 'f857857b-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ Cao Su Tự Nhiên HOBRO 301 (Màu nâu)', 'TABLE004', 5500000.00, 1, 5500000.00, '2025-11-29 15:32:16.810'),
	('153310db-7360-4718-b2ff-6a0423011ac1', '1698caf8-4dc9-4012-8acc-e48f214e5613', 'f857ea33-c843-11f0-bae8-00fffe46637b', 'Ghế Ăn Bọc Đệm FINGAL', 'CHAIR002', 700000.00, 1, 700000.00, '2025-12-02 08:14:38.354'),
	('18b2f70b-eddd-4a1c-9412-24bd7f1c83ee', '764ecfb7-fe42-4671-bc4a-819d1f6371ec', 'f857ea33-c843-11f0-bae8-00fffe46637b', 'Ghế Ăn Bọc Đệm FINGAL', 'CHAIR002', 700000.00, 1, 700000.00, '2025-12-02 08:14:45.592'),
	('25427e4e-89e8-42d9-9d5d-c5182067262e', '973de7a9-5b88-476a-a230-f229f7d0304b', 'f857efb5-c843-11f0-bae8-00fffe46637b', 'Ghế Sofa AURORA - MOHO Signature', 'CHA-SOF-002', 360000.00, 1, 360000.00, '2025-11-29 08:37:24.469'),
	('28e5849f-7e04-4f8e-8a59-6b3689d50e3d', 'c9330fc8-5095-475e-a069-e6eae58d9d22', 'f85782b1-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ 1m6 SERENA', 'TABLE002', 6000000.00, 1, 6000000.00, '2025-11-24 11:16:45.964'),
	('32a07c86-304d-48b2-b86c-2dd3c6e01421', '8400b9a1-e443-4367-99fd-09afd8933be6', 'f857857b-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ Cao Su Tự Nhiên HOBRO 301 (Màu nâu)', 'TABLE004', 5500000.00, 1, 5500000.00, '2025-11-24 15:36:55.101'),
	('3af283a5-6875-4c84-9d1b-e238e24a3499', '6adafdff-c011-4193-8598-63cbe229cb6d', '25883df4-babf-4d74-830f-cba57799b01d', 'product test', 'PRO-001', 10000.00, 1, 10000.00, '2025-11-25 03:35:07.416'),
	('56476abe-e77c-43c7-b0a1-5fcb8f485dfa', 'fe6f9d64-6a0d-4d4b-8f79-7ebb9b27e3d1', '25883df4-babf-4d74-830f-cba57799b01d', 'product test', 'PRO-001', 0.00, 1, 0.00, '2025-11-29 09:09:39.333'),
	('57f5d66a-07a1-4dc0-b2e8-f81711df8cb2', 'c632119b-1025-4bfa-9fc0-a18c2bc41fd6', 'f8572a3d-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ Tự Nhiên PLANK | Veneer Gỗ Sồi', 'TABLE001', 8000000.00, 1, 8000000.00, '2025-11-29 09:27:43.078'),
	('5834dd4c-dc1b-49f9-8154-ca11023ebd25', 'c28f22dc-882f-4a24-8265-d31e68b4870a', 'f85782b1-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ 1m6 SERENA', 'TABLE002', 6000000.00, 1, 6000000.00, '2025-11-25 08:30:10.403'),
	('616a8418-6af9-4698-bf70-4eb3a80b747d', 'b6c69e21-ab6c-43a1-801e-0f85b666e546', 'f857eb73-c843-11f0-bae8-00fffe46637b', 'Ghế Ăn Gỗ Cao Su Tự Nhiên SERENA', 'CHAIR003', 650000.00, 1, 650000.00, '2025-11-24 15:57:14.863'),
	('6c457b1e-c1fa-415b-a31e-e25c7b7d83fe', '4da23cb4-db8f-4c15-8b93-837a9bdb8d5b', '25883df4-babf-4d74-830f-cba57799b01d', 'product test', 'PRO-001', 10000.00, 1, 10000.00, '2025-11-25 02:24:57.541'),
	('72dd851d-8288-482c-bf46-ea4cf4586519', '764ecfb7-fe42-4671-bc4a-819d1f6371ec', 'f857edad-c843-11f0-bae8-00fffe46637b', 'Bộ Bàn Ghế Ăn 4 - 6 Ghế Gỗ Tự Nhiên SERENA', 'SET-DIN-001', 9000000.00, 1, 9000000.00, '2025-12-02 08:14:45.592'),
	('72e36385-9a04-48e0-a6e3-c22c3e4cfb22', 'c8c126be-6e67-44f9-aea4-385ebf87eef8', '25883df4-babf-4d74-830f-cba57799b01d', 'product test', 'PRO-001', 0.00, 1, 0.00, '2025-11-29 09:45:39.979'),
	('7813224c-ed10-4ec7-b941-edc4fec7e44f', '749f97de-f8a8-41eb-92b5-77d2da8000a7', 'f857861f-c843-11f0-bae8-00fffe46637b', 'GHẾ ĂN SOLUNA (Màu Nâu/ Đen)', 'CHAIR001', 600000.00, 1, 600000.00, '2025-12-01 13:06:58.565'),
	('7af14328-deae-4fc9-916e-12c612929074', '7b3b56fe-33c2-4e8c-9ba8-eff1fe9e0261', 'f8572a3d-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ Tự Nhiên PLANK | Veneer Gỗ Sồi', 'TABLE001', 8000000.00, 1, 8000000.00, '2025-11-24 16:17:25.926'),
	('84f94ee1-e81b-4261-93d8-050830adb611', '7f34309c-fa01-4d27-9175-dcf7438ef4f0', '25883df4-babf-4d74-830f-cba57799b01d', 'product test', 'PRO-001', 0.00, 1, 0.00, '2025-11-29 14:40:58.701'),
	('8e6ac0e9-3286-4163-ae73-9eb69b361be4', '0fd2f2ab-5776-4c91-80e6-78c4dcf07621', 'f857861f-c843-11f0-bae8-00fffe46637b', 'GHẾ ĂN SOLUNA (Màu Nâu/ Đen)', 'CHAIR001', 600000.00, 1, 600000.00, '2025-11-24 15:23:11.386'),
	('8ec8d881-7423-4401-bad9-0fd001313ad1', 'cb58ec0b-418f-451f-b5f9-3c6711bf177d', 'f857eb73-c843-11f0-bae8-00fffe46637b', 'Ghế Ăn Gỗ Cao Su Tự Nhiên SERENA', 'CHAIR003', 650000.00, 1, 650000.00, '2025-12-01 13:19:40.727'),
	('99ee1f90-dce9-48dd-a86d-ebe4f2440a39', '6834794a-317e-42c6-a4a2-a4ed4b037f22', '25883df4-babf-4d74-830f-cba57799b01d', 'product test', 'PRO-001', 10000.00, 1, 10000.00, '2025-11-25 03:51:05.295'),
	('9d743017-d7f5-4931-ab38-bf7880160b4f', '0368a474-6dc0-46dd-aae6-71eacefb5b2a', '25883df4-babf-4d74-830f-cba57799b01d', 'product test', 'PRO-001', 0.00, 5, 0.00, '2025-12-01 13:35:39.151'),
	('a68636c4-97a9-4b95-b5ae-a76c5b02078d', 'f6d122a2-8397-469f-a920-5c2ecb6acc7e', '25883df4-babf-4d74-830f-cba57799b01d', 'product test', 'PRO-001', 10000.00, 1, 10000.00, '2025-11-24 15:12:06.222'),
	('a784df62-485f-4baa-8e69-c328290d7a91', '4da23cb4-db8f-4c15-8b93-837a9bdb8d5b', 'f8572a3d-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ Tự Nhiên PLANK | Veneer Gỗ Sồi', 'TABLE001', 8000000.00, 1, 8000000.00, '2025-11-25 02:24:57.541'),
	('a816f622-8241-41bd-bdce-ed38dfae195f', '1b2b96d6-de6e-4c18-bc75-9e8dde7188e2', 'f857861f-c843-11f0-bae8-00fffe46637b', 'GHẾ ĂN SOLUNA (Màu Nâu/ Đen)', 'CHAIR001', 600000.00, 1, 600000.00, '2025-11-24 15:53:05.980'),
	('c34dede8-3da1-4e3a-94c5-86d539ef41be', 'ae0b1b73-3fa4-4a37-8361-4804d014a848', 'f857861f-c843-11f0-bae8-00fffe46637b', 'GHẾ ĂN SOLUNA (Màu Nâu/ Đen)', 'CHAIR001', 600000.00, 1, 600000.00, '2025-11-30 12:58:19.773'),
	('d33201eb-c57b-4716-807e-d187d680d950', '23163141-863f-432c-b332-83a61431dca8', 'f857ecbc-c843-11f0-bae8-00fffe46637b', 'Ghế Gỗ LYH - Đệm Lưng Tháo Rời', 'CHAIR004', 400000.00, 1, 400000.00, '2025-11-24 11:41:56.888'),
	('dec9f0b7-960e-49e7-99ef-0c637f09c33c', '7b3b56fe-33c2-4e8c-9ba8-eff1fe9e0261', 'f857efb5-c843-11f0-bae8-00fffe46637b', 'Ghế Sofa AURORA - MOHO Signature', 'CHA-SOF-002', 360000.00, 1, 360000.00, '2025-11-24 16:17:25.926'),
	('e1e38003-e1b3-4fd8-bd1d-ad4a664bde2c', '84ff98d2-4bb6-4322-bdf4-c38b3f0ab68c', 'f857857b-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ Cao Su Tự Nhiên HOBRO 301 (Màu nâu)', 'TABLE004', 5500000.00, 1, 5500000.00, '2025-11-24 15:46:31.680'),
	('ec357d95-515b-441c-8760-476bd5643e17', 'b4fc0ca7-f67d-460f-9a97-ae457bd87c49', 'f857edad-c843-11f0-bae8-00fffe46637b', 'Bộ Bàn Ghế Ăn 4 - 6 Ghế Gỗ Tự Nhiên SERENA', 'SET-DIN-001', 9000000.00, 1, 9000000.00, '2025-12-02 08:15:11.610'),
	('ed75c0d6-d8a5-488b-b02d-635afeecd1fb', '50b3570d-203b-45e6-ac84-3d7832f116b0', 'f8578410-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ Tự Nhiên SCANIA (Màu Nâu, Mặt Vân Đá, 140)', 'TABLE003', 7000000.00, 1, 7000000.00, '2025-11-24 14:53:27.703'),
	('f5310db7-258b-478a-b0ed-5d062c9874dc', 'b4fc0ca7-f67d-460f-9a97-ae457bd87c49', 'f857ea33-c843-11f0-bae8-00fffe46637b', 'Ghế Ăn Bọc Đệm FINGAL', 'CHAIR002', 700000.00, 1, 700000.00, '2025-12-02 08:15:11.610'),
	('fcdf8cd3-edf8-4358-ac97-f9b1ef3814c9', '1698caf8-4dc9-4012-8acc-e48f214e5613', 'f857edad-c843-11f0-bae8-00fffe46637b', 'Bộ Bàn Ghế Ăn 4 - 6 Ghế Gỗ Tự Nhiên SERENA', 'SET-DIN-001', 9000000.00, 1, 9000000.00, '2025-12-02 08:14:38.354');

-- Dumping structure for table furniture_db.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(191) NOT NULL,
  `orderNumber` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `status` enum('PENDING','PROCESSING','SHIPPING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `paymentMethod` enum('COD','BANK_TRANSFER','MOMO') NOT NULL,
  `paymentStatus` enum('UNPAID','PAID','REFUNDED') NOT NULL DEFAULT 'UNPAID',
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `shippingFee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `voucherCode` varchar(191) DEFAULT NULL,
  `voucherId` varchar(191) DEFAULT NULL,
  `customerName` varchar(191) NOT NULL,
  `customerEmail` varchar(191) NOT NULL,
  `customerPhone` varchar(191) NOT NULL,
  `shippingAddress` text NOT NULL,
  `notes` text DEFAULT NULL,
  `cancelReason` text DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_orderNumber_key` (`orderNumber`),
  KEY `orders_userId_idx` (`userId`),
  KEY `orders_orderNumber_idx` (`orderNumber`),
  KEY `orders_status_idx` (`status`),
  KEY `orders_createdAt_idx` (`createdAt`),
  KEY `orders_voucherId_fkey` (`voucherId`),
  CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `vouchers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db.orders: ~27 rows (approximately)
INSERT INTO `orders` (`id`, `orderNumber`, `userId`, `status`, `paymentMethod`, `paymentStatus`, `subtotal`, `discount`, `shippingFee`, `total`, `voucherCode`, `voucherId`, `customerName`, `customerEmail`, `customerPhone`, `shippingAddress`, `notes`, `cancelReason`, `completedAt`, `cancelledAt`, `createdAt`, `updatedAt`) VALUES
	('0368a474-6dc0-46dd-aae6-71eacefb5b2a', 'ORD17645961391397932', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'PENDING', 'COD', 'UNPAID', 0.00, 0.00, 30000.00, 30000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '61 đường số 5 ,Tân tạo,Tp.HCM', '', NULL, NULL, NULL, '2025-12-01 13:35:39.151', '2025-12-01 13:35:39.151'),
	('0fd2f2ab-5776-4c91-80e6-78c4dcf07621', 'ORD17639977913838775', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'PAID', 600000.00, 0.00, 30000.00, 630000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '5 nguyễn thị minh khai, Phường Bến Thành, Quận 3, Hồ Chí Minh', '', NULL, '2025-11-24 16:26:34.952', NULL, '2025-11-24 15:23:11.386', '2025-11-24 16:26:34.954'),
	('1698caf8-4dc9-4012-8acc-e48f214e5613', 'ORD17646632783465695', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'PENDING', 'MOMO', 'UNPAID', 9700000.00, 9700000.00, 0.00, 0.00, 'flash-sale', '7dd2fb42-7a50-4fd7-a5ac-bd8bfbbacf3c', 'Thịnh Thới', 'user1@gmail.com', '0336618557', '61 đường số 5 ,Tân tạo,Tp.HCM', '', NULL, NULL, NULL, '2025-12-02 08:14:38.354', '2025-12-02 08:14:38.354'),
	('1b2b96d6-de6e-4c18-bc75-9e8dde7188e2', 'ORD17639995859788184', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'UNPAID', 600000.00, 0.00, 30000.00, 630000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, '2025-11-25 03:52:28.742', NULL, '2025-11-24 15:53:05.980', '2025-11-25 03:52:28.743'),
	('23163141-863f-432c-b332-83a61431dca8', 'ORD17639845168844783', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'UNPAID', 400000.00, 0.00, 30000.00, 430000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Thành, Quận 2, Hồ Chí Minh', '', NULL, '2025-11-24 14:33:55.318', NULL, '2025-11-24 11:41:56.888', '2025-11-24 14:33:55.321'),
	('4da23cb4-db8f-4c15-8b93-837a9bdb8d5b', 'ORD17640374975343356', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'PAID', 8010000.00, 150000.00, 0.00, 7860000.00, 'Sunday', '1236679f-c13f-492e-9d49-e65bb8173e1c', 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, '2025-11-25 03:52:24.602', NULL, '2025-11-25 02:24:57.541', '2025-11-25 03:52:24.603'),
	('50b3570d-203b-45e6-ac84-3d7832f116b0', 'ORD17639960077010625', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'CANCELLED', 'COD', 'UNPAID', 7000000.00, 0.00, 0.00, 7000000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, NULL, '2025-11-24 15:19:19.180', '2025-11-24 14:53:27.703', '2025-11-24 15:19:19.198'),
	('6834794a-317e-42c6-a4a2-a4ed4b037f22', 'ORD17640426652911669', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'COD', 'UNPAID', 10000.00, 0.00, 30000.00, 40000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hà Nội', '', NULL, '2025-11-25 07:24:15.714', '2025-11-25 07:24:13.241', '2025-11-25 03:51:05.295', '2025-11-25 07:24:15.716'),
	('6adafdff-c011-4193-8598-63cbe229cb6d', 'ORD17640417074121230', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'COD', 'UNPAID', 10000.00, 0.00, 30000.00, 40000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, '2025-11-25 03:52:19.917', NULL, '2025-11-25 03:35:07.416', '2025-11-25 03:52:19.918'),
	('749f97de-f8a8-41eb-92b5-77d2da8000a7', 'ORD17645944185603291', 'ae829e12-26dd-4797-9060-e92a22e1d171', 'COMPLETED', 'MOMO', 'PAID', 600000.00, 600000.00, 30000.00, 30000.00, 'flash-sale', '7dd2fb42-7a50-4fd7-a5ac-bd8bfbbacf3c', 'Thanh Vương', 'thanhvuong0419@gmail.com', '0336618557', '7a Phan đăng Lưu', '', NULL, '2025-12-01 13:20:55.851', NULL, '2025-12-01 13:06:58.565', '2025-12-01 13:20:55.853'),
	('764ecfb7-fe42-4671-bc4a-819d1f6371ec', 'ORD17646632855876336', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'PENDING', 'MOMO', 'UNPAID', 9700000.00, 9700000.00, 0.00, 0.00, 'flash-sale', '7dd2fb42-7a50-4fd7-a5ac-bd8bfbbacf3c', 'Thịnh Thới', 'user1@gmail.com', '0336618557', '61 đường số 5 ,Tân tạo,Tp.HCM', '', NULL, NULL, NULL, '2025-12-02 08:14:45.592', '2025-12-02 08:14:45.592'),
	('7b3b56fe-33c2-4e8c-9ba8-eff1fe9e0261', 'ORD17640010459238461', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'PAID', 8360000.00, 100000.00, 0.00, 8260000.00, 'Black-Friday', '77a9cc38-fd6d-472d-817f-7f51e3af10c8', 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, '2025-11-24 16:26:09.245', NULL, '2025-11-24 16:17:25.926', '2025-11-24 16:26:09.247'),
	('7f34309c-fa01-4d27-9175-dcf7438ef4f0', 'ORD17644272586983281', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'SHIPPING', 'MOMO', 'PAID', 0.00, 0.00, 30000.00, 30000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '61 đường số 5,Tân tạo', '', NULL, NULL, NULL, '2025-11-29 14:40:58.701', '2025-11-29 15:09:32.014'),
	('8400b9a1-e443-4367-99fd-09afd8933be6', 'ORD17639986151008205', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'CANCELLED', 'MOMO', 'UNPAID', 5500000.00, 0.00, 0.00, 5500000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 2, Hồ Chí Minh', '', NULL, NULL, '2025-11-24 15:44:46.271', '2025-11-24 15:36:55.101', '2025-11-24 15:44:46.282'),
	('84ff98d2-4bb6-4322-bdf4-c38b3f0ab68c', 'ORD17639991916785266', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'PAID', 5500000.00, 0.00, 0.00, 5500000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, '2025-11-24 16:26:24.663', NULL, '2025-11-24 15:46:31.680', '2025-11-24 16:26:24.664'),
	('973de7a9-5b88-476a-a230-f229f7d0304b', 'ORD17644054444660073', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'PAID', 360000.00, 0.00, 30000.00, 390000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 2, Hồ Chí Minh', '', NULL, '2025-11-30 13:07:43.363', NULL, '2025-11-29 08:37:24.469', '2025-11-30 13:07:43.364'),
	('ae0b1b73-3fa4-4a37-8361-4804d014a848', 'ORD17645074997708240', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'PAID', 600000.00, 600000.00, 30000.00, 30000.00, 'flash-sale', '7dd2fb42-7a50-4fd7-a5ac-bd8bfbbacf3c', 'Thịnh Thới', 'user1@gmail.com', '0336618557', '61 đường số 5 ,Tân tạo,Tp.HCM', '', NULL, '2025-11-30 13:07:26.338', NULL, '2025-11-30 12:58:19.773', '2025-11-30 13:07:26.339'),
	('b4fc0ca7-f67d-460f-9a97-ae457bd87c49', 'ORD17646633116068117', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'CANCELLED', 'MOMO', 'UNPAID', 9700000.00, 0.00, 0.00, 9700000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '61 đường số 5 ,Tân tạo,Tp.HCM', '', NULL, NULL, '2025-12-02 08:17:47.768', '2025-12-02 08:15:11.610', '2025-12-02 08:17:47.803'),
	('b6c69e21-ab6c-43a1-801e-0f85b666e546', 'ORD17639998348611778', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'PAID', 650000.00, 0.00, 30000.00, 680000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, '2025-11-24 16:26:19.946', NULL, '2025-11-24 15:57:14.863', '2025-11-24 16:26:19.947'),
	('bef65735-d447-48a0-9e7f-1e5e8e895517', 'ORD17644303368079517', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'COD', 'UNPAID', 5500000.00, 150000.00, 0.00, 5350000.00, 'Sunday', '1236679f-c13f-492e-9d49-e65bb8173e1c', 'Thịnh Thới', 'user1@gmail.com', '0336618557', '273 An Dương Vương,phường Chợ Quán,Tp.HCM', '', NULL, '2025-12-01 13:20:32.786', NULL, '2025-11-29 15:32:16.810', '2025-12-01 13:20:32.787'),
	('c28f22dc-882f-4a24-8265-d31e68b4870a', 'ORD17640594103970917', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'PAID', 6000000.00, 6000000.00, 0.00, 0.00, 'flash-sale', '7dd2fb42-7a50-4fd7-a5ac-bd8bfbbacf3c', 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 2, Hồ Chí Minh', '', NULL, '2025-11-30 13:07:39.742', NULL, '2025-11-25 08:30:10.403', '2025-11-30 13:07:39.744'),
	('c632119b-1025-4bfa-9fc0-a18c2bc41fd6', 'ORD17644084630756107', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'CANCELLED', 'MOMO', 'UNPAID', 8000000.00, 0.00, 0.00, 8000000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, NULL, '2025-11-29 13:32:43.135', '2025-11-29 09:27:43.078', '2025-11-29 13:32:43.163'),
	('c8c126be-6e67-44f9-aea4-385ebf87eef8', 'ORD17644095399780501', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'SHIPPING', 'MOMO', 'PAID', 0.00, 0.00, 30000.00, 30000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 2, Hồ Chí Minh', '', NULL, NULL, NULL, '2025-11-29 09:45:39.979', '2025-11-29 15:09:36.808'),
	('c9330fc8-5095-475e-a069-e6eae58d9d22', 'ORD17639830059627943', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'COD', 'UNPAID', 6000000.00, 0.00, 0.00, 6000000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '61 võ thị sáu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, '2025-11-24 14:34:22.145', NULL, '2025-11-24 11:16:45.964', '2025-11-24 14:34:22.147'),
	('cb58ec0b-418f-451f-b5f9-3c6711bf177d', 'ORD17645951807250660', 'ae829e12-26dd-4797-9060-e92a22e1d171', 'CANCELLED', 'COD', 'UNPAID', 650000.00, 0.00, 30000.00, 680000.00, NULL, NULL, 'Thanh Vương', 'thanhvuong0419@gmail.com', '0336618557', '7a Phan đăng Lưu', '', 'User cancelled order', NULL, '2025-12-01 13:19:49.565', '2025-12-01 13:19:40.727', '2025-12-01 13:19:49.576'),
	('f6d122a2-8397-469f-a920-5c2ecb6acc7e', 'ORD17639971262196563', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'COMPLETED', 'MOMO', 'PAID', 10000.00, 0.00, 30000.00, 40000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, '2025-11-24 16:26:38.526', NULL, '2025-11-24 15:12:06.222', '2025-11-24 16:26:38.528'),
	('fe6f9d64-6a0d-4d4b-8f79-7ebb9b27e3d1', 'ORD17644073793322144', '309bc28d-8ebd-4fbc-b838-21c0fa973713', 'CANCELLED', 'MOMO', 'UNPAID', 0.00, 0.00, 30000.00, 30000.00, NULL, NULL, 'Thịnh Thới', 'user1@gmail.com', '0336618557', '7a Phan đăng Lưu, Phường Bến Nghé, Quận 1, Hồ Chí Minh', '', NULL, NULL, '2025-11-29 09:41:41.955', '2025-11-29 09:09:39.333', '2025-11-29 09:41:41.968');

-- Dumping structure for table furniture_db.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `salePrice` decimal(10,2) DEFAULT NULL,
  `sku` varchar(191) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `categoryId` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `views` int(11) NOT NULL DEFAULT 0,
  `sales` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `image` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_key` (`slug`),
  UNIQUE KEY `products_sku_key` (`sku`),
  KEY `products_categoryId_idx` (`categoryId`),
  KEY `products_slug_idx` (`slug`),
  CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db.products: ~29 rows (approximately)
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `salePrice`, `sku`, `stock`, `categoryId`, `isActive`, `isFeatured`, `views`, `sales`, `createdAt`, `image`) VALUES
	('25883df4-babf-4d74-830f-cba57799b01d', 'product test', 'product-test', 'sản phẩm test', 10000.00, 6000.00, 'PRO-001', 10, 'd0a7861c-c842-11f0-bae8-00fffe46637b', 1, 0, 28, 10, '2025-11-24 13:26:30.371', '/images/test.jfif'),
	('4255ce81-d13c-4d20-93bc-966fc39308c3', 'Set Bàn Sofa - Bàn Trà - Bàn Cafe Gỗ KLINE', 'ban-sofa-kline', 'Kích thước:Bàn Oval - Thấp: Dài 75cm x Rộng 40cm x Cao 38cm Bàn Tròn Cao:  Rộng 50cm x Cao 48 cm;Mặt bàn: Gỗ công nghiệp MFC chuẩn CARB, Sơn phủ UV;Chân bàn: Gỗ cao su tự nhiên', 3200000.00, 0.00, 'TABLE-SOF-003', 12, 'd0a77ae6-c842-11f0-bae8-00fffe46637b', 1, 1, 0, 0, '2025-11-23 08:20:08.615', '/images/ban2.png'),
	('f8572a3d-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ Tự Nhiên PLANK | Veneer Gỗ Sồi', 'Veneer-go-soi', 'Kích thước: 160 x 85 x 75 cm;Mặt bàn: Gỗ cao su + MDF veneer gỗ sồi chuẩn CARB P2 (*),Chân bàn: Gỗ cao su,Thanh giằng: Sắt sơn tĩnh điện', 8000000.00, NULL, 'TABLE001', 8, 'd0a78690-c842-11f0-bae8-00fffe46637b', 1, 1, 20, 2, '2025-11-23 15:11:10.330', '/images/BanAn1.png'),
	('f85782b1-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ 1m6 SERENA', 'ban-an-go-serena', 'Kích thước: Dài 160 cm x Rộng 80 cm x Cao 75 cm;Chất liệu mặt bàn: MDF chuẩn CARB-P2 phủ veneer gỗ sồi ;Chất liệu khung & chân bàn: Gỗ cao su tự nhiên;Thanh giằng: Sắt sơn tĩnh điện', 7000000.00, 6000000.00, 'TABLE002', 10, 'd0a78690-c842-11f0-bae8-00fffe46637b', 1, 1, 10, 2, '2025-11-23 15:11:10.330', '/images/BanAn2.png'),
	('f8578410-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ Tự Nhiên SCANIA (Màu Nâu, Mặt Vân Đá, 140)', 'ban-an-scania', 'Kích thước: Chiều dài 140cm x Chiều rộng 70cm x Chiều cao 75cm ;Mặt bàn: Gỗ công nghiệp phủ Melamine vân đá;Chân bàn: Gỗ cao su tự nhiên', 7000000.00, NULL, 'TABLE003', 10, 'd0a78690-c842-11f0-bae8-00fffe46637b', 1, 1, 0, 0, '2025-11-23 15:11:10.330', '/images/BanAn3.png'),
	('f857857b-c843-11f0-bae8-00fffe46637b', 'Bàn Ăn Gỗ Cao Su Tự Nhiên HOBRO 301 (Màu nâu)', 'ban-an-hobro', 'Kích thước: Rộng 800 x Dài 1400/ 1600 x Cao 752;Mặt bàn: Gỗ công nghiệp MDF chuẩn CARB-P2 (*), Veneer gỗ cao su tự nhiên;Chân bàn: Gỗ cao su tự nhiên', 6000000.00, 5500000.00, 'TABLE004', 8, 'd0a78690-c842-11f0-bae8-00fffe46637b', 1, 0, 12, 2, '2025-11-23 15:11:10.330', '/images/BanAn4.png'),
	('f857861f-c843-11f0-bae8-00fffe46637b', 'GHẾ ĂN SOLUNA (Màu Nâu/ Đen)', 'ghe-an-soluna', 'Kích thước (Dài x Rộng x Cao): 500 x 500 x 450/800 (mm);Chất liệu đệm ngồi: Mousse bọc Simili cao cấp, chống bám bụi, trượt nước', 650000.00, 600000.00, 'CHAIR001', 12, 'd0a78690-c842-11f0-bae8-00fffe46637b', 1, 0, 8, 4, '2025-11-23 15:11:10.330', '/images/GheAn1.png'),
	('f857ea33-c843-11f0-bae8-00fffe46637b', 'Ghế Ăn Bọc Đệm FINGAL', 'ghe-an-fingal', 'Kích thước: Ngang 47 x Sâu 44 x Cao 83/47 cm;Chân ghế: Gỗ cao su tự nhiên;Đệm & tựa: Foam đàn hồi, bọc vải polyester', 700000.00, NULL, 'CHAIR002', 10, 'd0a78690-c842-11f0-bae8-00fffe46637b', 1, 0, 6, 2, '2025-11-23 15:11:10.330', '/images/GheAn2.png'),
	('f857eb73-c843-11f0-bae8-00fffe46637b', 'Ghế Ăn Gỗ Cao Su Tự Nhiên SERENA', 'ghe-an-serena', 'Kích thước (Dài x Rộng x Cao): 460 x 520 x 820 (mm);Chất liệu khung/chân: Gỗ cao su tự nhiên; Chất liệu tựa lưng: Gỗ Plywood chuẩn CARB-P2 (*);Chất liệu đệm ngồi: Mousse bọc vải (Fabric) cao cấp, chống bám bụi, trượt nước', 700000.00, 650000.00, 'CHAIR003', 11, 'd0a78690-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 1, '2025-11-23 15:11:10.330', '/images/GheAn3.png'),
	('f857ecbc-c843-11f0-bae8-00fffe46637b', 'Ghế Gỗ LYH - Đệm Lưng Tháo Rời', 'ghe-go-lyh', 'Kích thước: R50 x D51 x C84 cm;Vật liệu: Chân ghế gỗ cao su ,Vải polyester, trượt nước nhẹ ,Tựa lưng plywood chuẩn CARB', 400000.00, NULL, 'CHAIR004', 19, 'd0a78690-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 1, '2025-11-23 15:11:10.330', '/images/GheAn4.png'),
	('f857edad-c843-11f0-bae8-00fffe46637b', 'Bộ Bàn Ghế Ăn 4 - 6 Ghế Gỗ Tự Nhiên SERENA', 'bo-ban-ghe-an-serena', 'Kích thước:Bàn ăn: Dài 160 x Rộng 80 x Cao 75 cm;Chất liệu Mặt bàn MDF veneer gỗ sồi chuẩn CARB,Khung/chân gỗ cao su,Vải bọc đệm trượt nước nhẹ, chống ẩm mốc và kháng khuẩn', 10000000.00, 9000000.00, 'SET-DIN-001', 4, 'd0a78690-c842-11f0-bae8-00fffe46637b', 1, 0, 2, 2, '2025-11-23 15:11:10.330', '/images/BoBanAn1.png'),
	('f857ee65-c843-11f0-bae8-00fffe46637b', 'Bộ Bàn Ghế Ăn 4 Ghế Gỗ Tự Nhiên PLANK', 'bo-ban-ghe-an-plank', 'Kích thước bàn: Dài 160 x Rộng 80 x Cao 75 cm;Sức chứa: 4 người (mở rộng được thành 6 nếu kết hợp thêm ghế)', 8000000.00, NULL, 'SET-DIN-002', 6, 'd0a78690-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/BoBanAn2.png'),
	('f857ef14-c843-11f0-bae8-00fffe46637b', 'Ghế Sofa Vải MOHO GIORGIO - MOHO Signature', 'ghe-sofa-moho-giorgio', 'Vải: 100% polyester; Trượt nước 90/100; Hạn chế cháy lan từ tàn thuốc, que diêm ;Chân gỗ tần bì (ash);Khung gỗ tự nhiên', 300000.00, 0.00, 'CHA-SOF-001', 10, 'd0a77ae6-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/ghe1.png'),
	('f857efb5-c843-11f0-bae8-00fffe46637b', 'Ghế Sofa AURORA - MOHO Signature', 'ghe-sofa-aurora', 'Foam: 30kgs/m3 HA pur foam ( HA30) + 25kgs/m3 SO pur foam ( SO25) + Fiber;Vải: 100% polyester;Chân inox đánh bóng;Khung gỗ tự nhiên', 400000.00, 0.00, 'CHA-SOF-002', 8, 'd0a77ae6-c842-11f0-bae8-00fffe46637b', 1, 0, 4, 2, '2025-11-23 15:11:10.330', '/images/ghe2.png'),
	('f857f08a-c843-11f0-bae8-00fffe46637b', 'Bàn Sofa – Bàn Cafe – Bàn Trà Dalumd (Màu Nâu Hạnh Nhân, 80)', 'ban-sofa-dalumd', 'Kích thước: Dài 80cm x  Rộng 60cm x Cao 40cm;Mặt bàn: Gỗ công nghiệp MFC phủ Melamine chuẩn CARB;Chân: gỗ cao su tự nhiên', 5000000.00, 0.00, 'TABLE-SOF-001', 4, 'd0a77ae6-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/ban1.png'),
	('f857f12d-c843-11f0-bae8-00fffe46637b', 'Bàn Sofa - Bàn Cafe - Bàn Trà Gỗ MOHO VLINE 501', 'ban-sofa-vline', 'Kích thước: Dài 100cm x Rộng 50cm x Cao 40cm;Mặt bàn: Gỗ tự nhiên + gỗ công nghiệp MDF chuẩn CARB, Veneer gỗ sồi tự nhiên;Chân và khung bàn: gỗ cao su tự nhiên', 3000000.00, 0.00, 'TABLE-SOF-002', 4, 'd0a77ae6-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/ban3.jpg'),
	('f857f1c7-c843-11f0-bae8-00fffe46637b', 'Tủ Tivi Dalumd (Màu Nâu Hạnh Nhân, 160)', 'tu-tivi-dalumd', 'Kích thước: Dài 160cm x Rộng 40cm x Cao 50cm;Chân tủ: Gỗ cao su tự nhiên;Thân tủ: Gỗ công nghiệp MFC/ MDF phủ Melamine chuẩn CARB', 1000000.00, 0.00, 'TELEV-001', 10, 'd0a77ae6-c842-11f0-bae8-00fffe46637b', 1, 0, 2, 0, '2025-11-23 15:11:10.330', '/images/tutivi1.jpg'),
	('f857f240-c843-11f0-bae8-00fffe46637b', 'Tủ Kệ Tivi Gỗ MOHO OSLO 201', 'tu-tivi-oslo', 'Kích thước: Dài 140/160/180 cm x Rộng 40 cm x Cao 60 cm;Thân tủ: Gỗ công nghiệp MFC phủ Melamine chuẩn CARB P2 (*), Sơn phủ Melamine vân gỗ sồi tự nhiên;Chân tủ: Gỗ cao su tự nhiên', 800000.00, 0.00, 'TELEV-002', 10, 'd0a77ae6-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/tutivi3.jpg'),
	('f857f2ab-c843-11f0-bae8-00fffe46637b', 'Bàn Làm Việc Gỗ MOHO VLINE 601 Màu Nâu', 'ban-lam-viec-vline', 'Kích thước: Dài 110cm x Rộng 55cm x Cao 74c;Mặt bàn: Gỗ công nghiệp MDF chuẩn CARB-P2 (*), Veneer gỗ tràm tự nhiên;Chân bàn: Gỗ tràm tự nhiên', 2000000.00, NULL, 'TABLE005', 10, 'd0a7861c-c842-11f0-bae8-00fffe46637b', 1, 0, 2, 0, '2025-11-23 15:11:10.330', '/images/BanLamViec1.png'),
	('f857f314-c843-11f0-bae8-00fffe46637b', 'Bàn Làm Việc Gỗ MOHO FYN 601 Màu Nâu', 'ban-lam-viec-fyn', 'Kích thước bàn: Dài 120cm x Rộng 60cm x Cao 74cm;Kích thước hộc kéo: Dài 23cm x Rộng 40cm x Cao 7cm;Mặt bàn: Gỗ công nghiệp PB chuẩn CARB', 3000000.00, NULL, 'TABLE006', 7, 'd0a7861c-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/BanLamViec3.png'),
	('f857f396-c843-11f0-bae8-00fffe46637b', 'Ghế xoay Quinto', 'ghe-xoay-quinto', 'Ghế xoay văn phòng Quinto có kích thước 43x43x45/75 cm (cao tới mặt ngồi là 45cm và có thể nâng hạ +/-5cm, phù hợp với các loại bàn làm việc thông dụng).', 300000.00, NULL, 'CHAIR005', 10, 'd0a7861c-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/Ghexoay1.png'),
	('f857f3f2-c843-11f0-bae8-00fffe46637b', 'Ghế lưới ID115 chân quỳ', 'ghe-xoay-id115', 'Ghế văn phòng ID115 khung inox 201 bọc lưới, tay inox 201, chân quỳ inox 201 Ø 25 dày 1.5 ly.;Kích thước: W50-57 x D45 x H108 (cm);Màu sắc: Đen (có thể thay đổi theo yêu cầu)', 500000.00, NULL, 'CHAIR006', 10, 'd0a7861c-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/Ghexoay3.png'),
	('f857f460-c843-11f0-bae8-00fffe46637b', 'Ghế da ID512 chân xoay', 'ghe-da-id512', 'Ghế văn phòng ID512 nệm bọc simili có tay, mâm cố định, chận xoay nhựa.;Kích thước: W47-57 x D43 x H85-95 (Cm);Màu sắc: Đen (có thể thay đổi theo yêu cầu)', 400000.00, NULL, 'CHAIR007', 10, 'd0a7861c-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/Ghexoay4.png'),
	('f857f4bb-c843-11f0-bae8-00fffe46637b', 'Tủ sách thấp 3 tầng Casa gỗ sồi', 'ke-tu-thap-casa', 'Kích thước 80 x 33 x 190 cm .Tủ sách thấp Casa thích hợp dùng để lưu trữ những cuốn sách và đồ đạc trong phòng làm việc hoặc phòng khách của gia đình trở nên thật phong cách;Thiết kế với chiều cao hoàn hảo, có thể đặt chiếc đèn bàn hoặc vật dụng trang trí trên đầu tủ.', 600000.00, NULL, 'BKS-001', 10, 'd0a7861c-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/KeTu1.png'),
	('f857f52c-c843-11f0-bae8-00fffe46637b', 'Tủ sách cao Casa gỗ sồi', 'ke-tu-cao-casa', 'Kích thước 80 x 33 x 192 cm . Tủ sách Casa được làm từ gỗ sồi trắng Mỹ nhập khẩu, kết hợp hài hòa giữa những tầng kệ và ngăn kéo tiện dụng trong một thiết kế đầy sáng tạo.;Nằm giữa tủ sách là 2 ngăn kéo được chế tác thủ công bởi những thợ mộc lành ', 700000.00, NULL, 'BKS-002', 10, 'd0a7861c-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/KeTu2.png'),
	('f857f5a2-c843-11f0-bae8-00fffe46637b', 'Giường Ngủ Gỗ Tràm MOHO VLINE 601 Nhiều Kích Thước', 'giong-ngu-vline', 'Kích thước phủ bì: Dài 212cm x Rộng 136/156/176/196cm x Cao đến đầu giường 92cm;Thân giường: Gỗ tràm tự nhiên, Veneer gỗ tràm tự nhiên;Chân giường: Gỗ cao su tự nhiên;Tấm phản: Gỗ plywood chuẩn CARB', 8000000.00, 7000000.00, 'BED-001', 4, 'd0a78516-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/giuong2.png'),
	('f857f61f-c843-11f0-bae8-00fffe46637b', 'Giường Ngủ Gỗ Tự Nhiên MOHO HOBRO 301', 'giuong-ngu-hobro', 'Kích thước phủ bì:Dài 210cm x Rộng 171/191cm ,Cao đến đầu giường 90 cm,Gầm giường cao 16cm;Thân giường: Gỗ tràm tự nhiên/ MDF veneer tràm;Tấm phản: Gỗ plywood chuẩn CARB', 9000000.00, NULL, 'BED-002', 4, 'd0a78516-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/giuong4.jpg'),
	('f857f69f-c843-11f0-bae8-00fffe46637b', 'Tủ Đầu Giường Gỗ MOHO VLINE 801 Màu Tự Nhiên', 'tu-dau-giuong-vline', 'Kích thước: Dài 55cm x Rộng 41cm x Cao 51,5cm;Thân tủ: Gỗ công nghiệp MDF chuẩn CARB, Veneer gỗ sồi tự nhiên;Chân tủ: Gỗ cao su tự nhiên', 2000000.00, NULL, 'BST-001', 5, 'd0a78516-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/tudaugiuong2.jpg'),
	('f857f6fe-c843-11f0-bae8-00fffe46637b', 'Tủ Đầu Giường Gỗ MOHO HOBRO 301', 'tu-dau-giuong-hobro', 'Kích thước: Dài 60cm x Rộng 40cm x Cao 50cm;Thân tủ: MDF veneer gỗ tràm/ gỗ sồi', 1500000.00, 1200000.00, 'BST-002', 4, 'd0a78516-c842-11f0-bae8-00fffe46637b', 1, 0, 0, 0, '2025-11-23 15:11:10.330', '/images/tudaugiuong4.jpg');

-- Dumping structure for table furniture_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `loginAttempts` int(11) NOT NULL DEFAULT 0,
  `lockUntil` datetime(3) DEFAULT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `resetPasswordToken` varchar(191) DEFAULT NULL,
  `resetPasswordExpires` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  UNIQUE KEY `users_resetPasswordToken_key` (`resetPasswordToken`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db.users: ~3 rows (approximately)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `phone`, `address`, `role`, `isActive`, `loginAttempts`, `lockUntil`, `emailVerified`, `resetPasswordToken`, `resetPasswordExpires`, `createdAt`) VALUES
	('309bc28d-8ebd-4fbc-b838-21c0fa973713', 'user1@gmail.com', '$2b$12$BiurhQQBuwvmS/uxFqViue8FC6uwmjTj99./nVaM6i3LbHidXIXZi', 'Thịnh Thới', '0336618557', '61 đường số 5 ,Tân tạo,Tp.HCM', 'USER', 1, 0, NULL, 0, NULL, NULL, '2025-11-23 14:09:37.346'),
	('ae829e12-26dd-4797-9060-e92a22e1d171', 'thanhvuong0419@gmail.com', '$2b$12$cLhhyKDc6x/6o5OswayebOQDfU2Y0yb0LLBFkctpMFAf6r2fdWcpO', 'Thanh Vương', '0336618557', NULL, 'USER', 1, 0, NULL, 0, 'a4ff81a4-4527-41be-89f4-7c58a8101062', '2025-11-29 16:29:58.159', '2025-11-29 16:14:42.722'),
	('b159035d-53aa-46b8-84f9-4f777eaa0233', 'admin@furniture.com', '$2b$12$bNgxNKbtkujbG8IBjE9hxufsFzDXrI4K0yRLZMJaiTU8QSYf.ioBm', 'admin', '0377658957', '273 An Dương Vương,phường Chợ Quán,Tp.HCM', 'ADMIN', 1, 0, NULL, 0, NULL, NULL, '2025-11-23 14:50:27.018');

-- Dumping structure for table furniture_db.vouchers
CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `discountType` varchar(191) NOT NULL,
  `discountValue` decimal(10,2) NOT NULL,
  `minOrderValue` decimal(10,2) DEFAULT NULL,
  `maxDiscount` decimal(10,2) DEFAULT NULL,
  `usageLimit` int(11) DEFAULT NULL,
  `usedCount` int(11) NOT NULL DEFAULT 0,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vouchers_code_key` (`code`),
  KEY `vouchers_code_idx` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table furniture_db.vouchers: ~0 rows (approximately)
INSERT INTO `vouchers` (`id`, `code`, `description`, `discountType`, `discountValue`, `minOrderValue`, `maxDiscount`, `usageLimit`, `usedCount`, `startDate`, `endDate`, `isActive`, `createdAt`, `updatedAt`) VALUES
	('1236679f-c13f-492e-9d49-e65bb8173e1c', 'Sunday', 'mã giảm giá cho ngày chủ nhật', 'PERCENTAGE', 15.00, 1500000.00, 150000.00, 100, 2, '2025-11-24 00:00:00.000', '2025-12-24 00:00:00.000', 1, '2025-11-24 14:03:30.332', '2025-11-29 15:32:16.850'),
	('77a9cc38-fd6d-472d-817f-7f51e3af10c8', 'Black-Friday', 'mã giảm giá cho ngày black friday', 'PERCENTAGE', 10.00, 1000000.00, 100000.00, 100, 1, '2025-11-24 00:00:00.000', '2025-12-24 00:00:00.000', 1, '2025-11-24 01:36:15.924', '2025-11-24 16:17:25.967'),
	('7dd2fb42-7a50-4fd7-a5ac-bd8bfbbacf3c', 'flash-sale', NULL, 'PERCENTAGE', 100.00, 0.00, NULL, 100, 5, '2025-11-25 00:00:00.000', '2025-12-25 00:00:00.000', 1, '2025-11-25 08:26:58.119', '2025-12-02 08:14:45.635');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
