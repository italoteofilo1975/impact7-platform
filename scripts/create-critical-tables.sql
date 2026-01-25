-- Tabela users (já criada, mas incluída para referência)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `openId` VARCHAR(64) UNIQUE,
  `name` TEXT,
  `email` VARCHAR(320) UNIQUE,
  `passwordHash` VARCHAR(255),
  `loginMethod` VARCHAR(64),
  `role` VARCHAR(20) NOT NULL DEFAULT 'user',
  `stripeCustomerId` VARCHAR(255),
  `stripeSubscriptionId` VARCHAR(255),
  `subscriptionStatus` VARCHAR(20) DEFAULT 'none',
  `planType` VARCHAR(20) DEFAULT 'free',
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  `lastSignedIn` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela leads
CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255),
  `email` VARCHAR(320) NOT NULL,
  `organization` VARCHAR(255),
  `phone` VARCHAR(20),
  `message` TEXT,
  `source` VARCHAR(50) NOT NULL DEFAULT 'contact_form',
  `createdAt` BIGINT NOT NULL,
  `welcomeEmailSent` INT NOT NULL DEFAULT 0,
  `nurturingStep` INT NOT NULL DEFAULT 0,
  `lastEmailSentAt` BIGINT,
  `unsubscribed` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela newsletterSubscribers
CREATE TABLE IF NOT EXISTS `newsletterSubscribers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(320) NOT NULL UNIQUE,
  `name` VARCHAR(255),
  `segment` VARCHAR(50) NOT NULL DEFAULT 'general',
  `interests` TEXT,
  `isActive` INT NOT NULL DEFAULT 1,
  `confirmedAt` BIGINT,
  `unsubscribedAt` BIGINT,
  `createdAt` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela calculations
CREATE TABLE IF NOT EXISTS `calculations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sessionId` VARCHAR(64),
  `userId` INT,
  `projectName` VARCHAR(255),
  `investment` INT NOT NULL,
  `contextScore` INT NOT NULL,
  `resistanceScore` INT NOT NULL,
  `beneficiaries` INT NOT NULL,
  `duration` INT NOT NULL,
  `impactScore` INT NOT NULL,
  `sRoi` INT NOT NULL,
  `sector` VARCHAR(100),
  `createdAt` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela ebookDownloads
CREATE TABLE IF NOT EXISTS `ebookDownloads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(320) NOT NULL,
  `organization` VARCHAR(255),
  `role` VARCHAR(100),
  `phone` VARCHAR(20),
  `source` VARCHAR(100) DEFAULT 'website',
  `downloadedAt` BIGINT NOT NULL,
  `emailSent` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela whitepaperDownloads
CREATE TABLE IF NOT EXISTS `whitepaperDownloads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(320) NOT NULL,
  `organization` VARCHAR(255),
  `downloadedAt` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela contacts
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(320) NOT NULL,
  `phone` VARCHAR(20),
  `subject` VARCHAR(255),
  `message` TEXT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'new',
  `createdAt` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela jarvisSessions
CREATE TABLE IF NOT EXISTS `jarvisSessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sessionId` VARCHAR(64) NOT NULL UNIQUE,
  `userId` INT,
  `context` TEXT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela jarvisMessages
CREATE TABLE IF NOT EXISTS `jarvisMessages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sessionId` VARCHAR(64) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `content` TEXT NOT NULL,
  `metadata` TEXT,
  `createdAt` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela knowledgeDocuments
CREATE TABLE IF NOT EXISTS `knowledgeDocuments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `tags` TEXT,
  `embedding` TEXT,
  `isActive` INT NOT NULL DEFAULT 1,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela siteMetrics
CREATE TABLE IF NOT EXISTS `siteMetrics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `metricType` VARCHAR(50) NOT NULL,
  `metricValue` INT NOT NULL,
  `metricDate` BIGINT NOT NULL,
  `metadata` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
