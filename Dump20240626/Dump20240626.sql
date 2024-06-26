-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: universal_db
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `defects`
--

DROP TABLE IF EXISTS `defects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `defects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product` bigint unsigned NOT NULL,
  `defect` bigint unsigned NOT NULL,
  `count` bigint NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product` (`product`),
  KEY `defect` (`defect`),
  CONSTRAINT `defects_ibfk_1` FOREIGN KEY (`product`) REFERENCES `production` (`id`),
  CONSTRAINT `defects_ibfk_2` FOREIGN KEY (`defect`) REFERENCES `defecttypes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `defects`
--

LOCK TABLES `defects` WRITE;
/*!40000 ALTER TABLE `defects` DISABLE KEYS */;
INSERT INTO `defects` VALUES (1,1,2,1,'2024-06-26 22:21:00'),(2,1,1,3,'2024-06-26 22:23:00'),(3,6,6,2,'2024-06-26 22:23:00'),(4,7,7,1,'2024-06-26 22:23:00'),(5,7,7,1,'2024-06-26 22:23:00');
/*!40000 ALTER TABLE `defects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `defecttypes`
--

DROP TABLE IF EXISTS `defecttypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `defecttypes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `prod_type` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `prod_type` (`prod_type`),
  CONSTRAINT `defecttypes_ibfk_1` FOREIGN KEY (`prod_type`) REFERENCES `productiontypes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `defecttypes`
--

LOCK TABLES `defecttypes` WRITE;
/*!40000 ALTER TABLE `defecttypes` DISABLE KEYS */;
INSERT INTO `defecttypes` VALUES (1,1,'Вылом ушка'),(2,1,'Выломан борт'),(3,1,'Спай'),(4,1,'Заливы'),(5,1,'Коробление'),(6,2,'Трещины'),(7,3,'Трещины');
/*!40000 ALTER TABLE `defecttypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production`
--

DROP TABLE IF EXISTS `production`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  CONSTRAINT `production_ibfk_1` FOREIGN KEY (`type`) REFERENCES `productiontypes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production`
--

LOCK TABLES `production` WRITE;
/*!40000 ALTER TABLE `production` DISABLE KEYS */;
INSERT INTO `production` VALUES (1,'ЛА 15',1),(2,'ЛУ 30',1),(3,'ТС 250',1),(4,'\"Каприз\" 120x70',2),(5,'\"Классик\" 150x70',2),(6,'\"Грация\" 170x70',2),(7,'Раковина \"Яуза\"',3);
/*!40000 ALTER TABLE `production` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productionready`
--

DROP TABLE IF EXISTS `productionready`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productionready` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product` bigint unsigned NOT NULL,
  `count` bigint NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product` (`product`),
  CONSTRAINT `productionready_ibfk_1` FOREIGN KEY (`product`) REFERENCES `production` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productionready`
--

LOCK TABLES `productionready` WRITE;
/*!40000 ALTER TABLE `productionready` DISABLE KEYS */;
INSERT INTO `productionready` VALUES (1,1,1,'2024-06-26 21:47:00'),(2,1,3,'2024-06-26 21:47:00'),(3,1,5,'2024-06-26 21:47:00'),(4,5,3,'2024-06-26 21:48:00');
/*!40000 ALTER TABLE `productionready` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productiontypes`
--

DROP TABLE IF EXISTS `productiontypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productiontypes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productiontypes`
--

LOCK TABLES `productiontypes` WRITE;
/*!40000 ALTER TABLE `productiontypes` DISABLE KEYS */;
INSERT INTO `productiontypes` VALUES (1,'Крышка смотрового колодца'),(2,'Ванна'),(3,'Раковина');
/*!40000 ALTER TABLE `productiontypes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-26 23:05:19
