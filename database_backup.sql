-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: e_inventory
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nama kategori barang',
  `deskripsi` text COLLATE utf8mb4_general_ci COMMENT 'Deskripsi kategori',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `nama_kategori` (`nama_kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Elektronik','Perangkat elektronik seperti komputer, laptop, dan aksesoris','2026-07-02 03:18:13','2026-07-02 03:18:13'),(2,'Furniture','Perabotan kantor seperti kursi, meja, dan lemari','2026-07-02 03:18:13','2026-07-02 03:18:13'),(3,'Alat Tulis Kantor','Perlengkapan tulis menulis dan administrasi','2026-07-02 03:18:13','2026-07-05 07:04:46'),(4,'Peralatan Jaringan','Perangkat jaringan seperti router, switch, dan kabel','2026-07-02 03:18:13','2026-07-02 03:18:13'),(5,'Kendaraan','Kendaraan operasional perusahaan','2026-07-02 03:18:13','2026-07-02 03:18:13'),(6,'Mesin & Peralatan','Mesin industri dan peralatan berat','2026-07-02 03:18:13','2026-07-02 03:18:13'),(7,'Keamanan','Perangkat keamanan seperti CCTV dan alarm','2026-07-02 03:18:13','2026-07-02 03:18:13'),(8,'Konsumabel','Barang habis pakai seperti tinta, kertas, dan baterai','2026-07-02 03:18:13','2026-07-02 03:18:13');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `kode_barang` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Kode unik barang, misal: ITM-001',
  `nama_barang` varchar(150) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nama lengkap barang',
  `kategori_id` int unsigned NOT NULL COMMENT 'FK ke tabel categories',
  `supplier_id` int unsigned NOT NULL COMMENT 'FK ke tabel suppliers',
  `stok` int NOT NULL DEFAULT '0' COMMENT 'Jumlah stok saat ini',
  `stok_minimum` int NOT NULL DEFAULT '0' COMMENT 'Batas minimum stok untuk alert',
  `harga_beli` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Harga pembelian barang',
  `harga_jual` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Harga penjualan barang',
  `lokasi` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Lokasi penyimpanan barang',
  `kondisi` enum('Baik','Rusak Ringan','Rusak Berat') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Baik' COMMENT 'Kondisi fisik barang',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_barang` (`kode_barang`),
  KEY `kategori_id` (`kategori_id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `fk_items_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_items_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,'ITM-001','Laptop Dell Inspiron 15',1,1,25,5,8500000.00,10500000.00,'Gudang A - Rak 1','Baik','2026-07-02 03:18:13','2026-07-06 01:12:41'),(2,'ITM-002','Monitor LG 24 inch',1,1,10,5,1800000.00,2500000.00,'Gudang A - Rak 2','Baik','2026-07-02 03:18:13','2026-07-05 18:48:28'),(3,'ITM-003','Keyboard Logitech MK270',1,3,20,10,250000.00,380000.00,'Gudang A - Rak 3','Baik','2026-07-02 03:18:13','2026-07-02 03:18:13'),(4,'ITM-004','Printer Epson L3210',1,1,8,3,1600000.00,2200000.00,'Gudang B - Rak 1','Baik','2026-07-02 03:18:13','2026-07-02 03:18:13'),(5,'ITM-005','Kursi Ergonomis Executive',2,4,25,5,850000.00,1200000.00,'Gudang C - Area 1','Baik','2026-07-02 03:18:13','2026-07-02 03:18:13'),(6,'ITM-006','Meja Kerja Kantor 120cm',2,4,5,5,1200000.00,1800000.00,'Gudang C - Area 2','Baik','2026-07-02 03:18:13','2026-07-05 07:29:58'),(7,'ITM-007','Lemari Arsip Besi 4 Laci',2,4,10,3,2500000.00,3500000.00,'Gudang C - Area 3','Rusak Ringan','2026-07-02 03:18:13','2026-07-02 03:18:13'),(8,'ITM-008','Kertas HVS A4 70gr (Rim)',3,5,50,20,45000.00,55000.00,'Gudang D - Rak 1','Baik','2026-07-02 03:18:13','2026-07-02 03:18:13'),(9,'ITM-009','Pulpen Ballpoint Blue (Box)',3,5,30,10,25000.00,35000.00,'Gudang D - Rak 2','Baik','2026-07-02 03:18:13','2026-07-02 03:18:13'),(10,'ITM-010','Router WiFi TP-Link AC1200',4,1,0,3,380000.00,550000.00,'Gudang A - Rak 4','Baik','2026-07-02 03:18:13','2026-07-02 03:18:13'),(11,'ITM-011','Switch Unmanaged 8 Port',4,1,7,5,280000.00,420000.00,'Gudang A - Rak 5','Baik','2026-07-02 03:18:13','2026-07-02 03:18:13'),(12,'ITM-012','Kamera CCTV Hikvision 4MP',7,2,12,4,750000.00,1100000.00,'Gudang B - Rak 3','Baik','2026-07-02 03:18:13','2026-07-02 03:18:13'),(13,'ITM-013','UPS APC 650VA',1,3,5,3,900000.00,1300000.00,'Gudang A - Rak 6','Rusak Berat','2026-07-02 03:18:13','2026-07-02 03:18:13');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `version` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `class` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `group` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `namespace` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `time` int NOT NULL,
  `batch` int unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2024-01-01-000001','App\\Database\\Migrations\\CreateUsersTable','default','App',1782986096,1),(2,'2024-01-01-000002','App\\Database\\Migrations\\CreateCategoriesTable','default','App',1782986096,1),(3,'2024-01-01-000003','App\\Database\\Migrations\\CreateSuppliersTable','default','App',1782986096,1),(4,'2024-01-01-000004','App\\Database\\Migrations\\CreateItemsTable','default','App',1782986096,1),(5,'2024-01-01-000005','App\\Database\\Migrations\\CreateStockHistoriesTable','default','App',1782986096,1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_histories`
--

DROP TABLE IF EXISTS `stock_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_histories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `barang_id` int unsigned NOT NULL COMMENT 'FK ke tabel items',
  `jenis` enum('Masuk','Keluar') COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Jenis pergerakan stok',
  `jumlah` int NOT NULL COMMENT 'Jumlah barang yang masuk/keluar',
  `keterangan` text COLLATE utf8mb4_general_ci COMMENT 'Catatan atau keterangan tambahan',
  `tanggal` date NOT NULL COMMENT 'Tanggal transaksi stok',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `barang_id` (`barang_id`),
  KEY `jenis` (`jenis`),
  KEY `tanggal` (`tanggal`),
  CONSTRAINT `fk_stock_histories_barang` FOREIGN KEY (`barang_id`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_histories`
--

LOCK TABLES `stock_histories` WRITE;
/*!40000 ALTER TABLE `stock_histories` DISABLE KEYS */;
INSERT INTO `stock_histories` VALUES (1,1,'Masuk',20,'Pembelian awal laptop','2026-07-01','2026-07-02 03:18:13','2026-07-02 03:18:13'),(3,2,'Masuk',10,'Restock monitor','2026-07-03','2026-07-02 03:18:13','2026-07-02 03:18:13'),(4,2,'Keluar',7,'Distribusi ke ruang rapat','2026-07-10','2026-07-02 03:18:13','2026-07-02 03:18:13'),(5,3,'Masuk',30,'Pembelian keyboard bulk','2026-07-02','2026-07-02 03:18:13','2026-07-02 03:18:13'),(6,5,'Masuk',30,'Pembelian kursi baru','2026-07-04','2026-07-02 03:18:13','2026-07-02 03:18:13'),(7,5,'Keluar',5,'Penggunaan ruang meeting','2026-07-15','2026-07-02 03:18:13','2026-07-02 03:18:13'),(8,8,'Masuk',100,'Pembelian kertas bulanan','2026-07-01','2026-07-02 03:18:13','2026-07-02 03:18:13'),(9,8,'Keluar',50,'Distribusi semua divisi','2026-07-20','2026-07-02 03:18:13','2026-07-02 03:18:13'),(10,12,'Masuk',15,'Pemasangan CCTV gedung','2026-07-08','2026-07-02 03:18:13','2026-07-02 03:18:13'),(11,12,'Keluar',3,'Penggantian CCTV rusak','2026-07-12','2026-07-02 03:18:13','2026-07-02 03:18:13');
/*!40000 ALTER TABLE `stock_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nama_supplier` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nama perusahaan supplier',
  `alamat` text COLLATE utf8mb4_general_ci COMMENT 'Alamat lengkap supplier',
  `telepon` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Nomor telepon supplier',
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Alamat email supplier',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `nama_supplier` (`nama_supplier`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'CV. Maju Bersama','Test Update','021-87654321','sales@majubersama.com','2026-07-02 03:18:13','2026-07-05 07:12:50'),(2,'CV. Maju Bersama','Jl. Raya Bogor Km 25, Cibinong, Bogor, Jawa Barat 16916','021-87654321','sales@majubersama.com','2026-07-02 03:18:13','2026-07-05 06:59:48'),(3,'Toko Elektronik Sejahtera','Jl. Pahlawan No. 12, Glodok, Jakarta Barat 11140','021-62534567','eleksejahtera@gmail.com','2026-07-02 03:18:13','2026-07-02 03:18:13'),(4,'PT. Global Furniture Indonesia','Kawasan Industri Cikarang Barat, Bekasi, Jawa Barat 17520','021-89101112','order@globalfurniture.id','2026-07-02 03:18:13','2026-07-02 03:18:13'),(5,'UD. Sarana Kantor','Jl. Gatot Subroto No. 7, Bandung, Jawa Barat 40262','022-78901234','saranakantor@yahoo.com','2026-07-02 03:18:13','2026-07-02 03:18:13');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Username unik untuk login',
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Password terenkripsi (bcrypt)',
  `nama` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nama lengkap pengguna',
  `role` enum('Administrator','Staff') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Administrator',
  `token` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Bearer Token untuk autentikasi API',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `token` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2y$10$np.hzjUgF/p0cUQz.5Z60eGOfDfQda1aytxDjulbLMVK6TKAxhmwG','Administrator','Administrator','dc605e81be51f996feab4da5eedaf6e5d61574856964168d7ce83ae13f9931cb','2026-07-02 03:18:13','2026-07-06 01:11:49'),(2,'superadmin','$2y$10$iPBqrJfMpxbAUb5i2eoO5um4KpqK/Z7hXrDZa2Iy9uLXaxHbZecue','Super Administrator','Administrator',NULL,'2026-07-02 03:18:13','2026-07-02 03:18:13'),(5,'fauzi','$2y$10$WabVgaprcB0OkLQfYfrjdu0CwH7HZlJiXUWUCqSgygRNFnMqd7KGq','Fauzi Aditya','Staff',NULL,'2026-07-05 19:03:23','2026-07-06 01:11:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-10  9:54:03
