-- Criar tabelas específicas do SET7 que faltam

CREATE TABLE IF NOT EXISTS `set7Tasklog` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `sessionId` VARCHAR(255),
  `agentId` INT,
  `taskName` VARCHAR(500) NOT NULL,
  `taskDescription` TEXT,
  `phaseId` VARCHAR(255),
  `phaseName` VARCHAR(500),
  `status` VARCHAR(50) DEFAULT 'pending',
  `priority` VARCHAR(50) DEFAULT 'medium',
  `startedAt` BIGINT,
  `completedAt` BIGINT,
  `duration` INT,
  `tokensUsed` INT DEFAULT 0,
  `cost` DECIMAL(10,4) DEFAULT 0,
  `errorMessage` TEXT,
  `metadata` TEXT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `set7Agents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `agentName` VARCHAR(255) NOT NULL,
  `agentType` VARCHAR(100),
  `description` TEXT,
  `capabilities` TEXT,
  `configuration` TEXT,
  `status` VARCHAR(50) DEFAULT 'active',
  `lastActiveAt` BIGINT,
  `totalTasksCompleted` INT DEFAULT 0,
  `totalTokensUsed` INT DEFAULT 0,
  `averageResponseTime` INT,
  `successRate` DECIMAL(5,2),
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `set7Integrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `integrationName` VARCHAR(255) NOT NULL,
  `integrationType` VARCHAR(100),
  `provider` VARCHAR(255),
  `apiKey` VARCHAR(500),
  `apiSecret` VARCHAR(500),
  `webhookUrl` VARCHAR(1000),
  `configuration` TEXT,
  `status` VARCHAR(50) DEFAULT 'inactive',
  `lastSyncAt` BIGINT,
  `syncFrequency` VARCHAR(100),
  `errorCount` INT DEFAULT 0,
  `lastErrorMessage` TEXT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `set7TokenBudgets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `budgetName` VARCHAR(255) NOT NULL,
  `budgetType` VARCHAR(100) DEFAULT 'monthly',
  `totalTokens` INT NOT NULL,
  `usedTokens` INT DEFAULT 0,
  `remainingTokens` INT,
  `resetDate` BIGINT,
  `alertThreshold` INT,
  `status` VARCHAR(50) DEFAULT 'active',
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `set7Gates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `gateName` VARCHAR(255) NOT NULL,
  `gateType` VARCHAR(100),
  `description` TEXT,
  `conditions` TEXT NOT NULL,
  `actions` TEXT,
  `isActive` BOOLEAN DEFAULT TRUE,
  `priority` INT DEFAULT 0,
  `triggerCount` INT DEFAULT 0,
  `lastTriggeredAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `set7RoiTracking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `projectName` VARCHAR(255) NOT NULL,
  `projectType` VARCHAR(100),
  `initialInvestment` DECIMAL(15,2),
  `currentValue` DECIMAL(15,2),
  `roi` DECIMAL(10,2),
  `impactScore` DECIMAL(10,2),
  `socialReturn` DECIMAL(15,2),
  `environmentalImpact` TEXT,
  `beneficiariesReached` INT,
  `startDate` BIGINT,
  `endDate` BIGINT,
  `status` VARCHAR(50) DEFAULT 'active',
  `metadata` TEXT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `set7RuntimeConfig` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `configKey` VARCHAR(255) NOT NULL,
  `configValue` TEXT,
  `configType` VARCHAR(100),
  `description` TEXT,
  `isEditable` BOOLEAN DEFAULT TRUE,
  `validationRules` TEXT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_config_unique` (`userId`, `configKey`)
);

CREATE TABLE IF NOT EXISTS `set7AuditLog` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT,
  `agentId` INT,
  `action` VARCHAR(255) NOT NULL,
  `entityType` VARCHAR(100),
  `entityId` INT,
  `changes` TEXT,
  `ipAddress` VARCHAR(100),
  `userAgent` TEXT,
  `severity` VARCHAR(50) DEFAULT 'info',
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `set7Nfrs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `nfrName` VARCHAR(255) NOT NULL,
  `nfrType` VARCHAR(100),
  `description` TEXT,
  `targetValue` VARCHAR(255),
  `currentValue` VARCHAR(255),
  `unit` VARCHAR(100),
  `priority` VARCHAR(50) DEFAULT 'medium',
  `status` VARCHAR(50) DEFAULT 'pending',
  `verificationMethod` TEXT,
  `lastMeasuredAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
