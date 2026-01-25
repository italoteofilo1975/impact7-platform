-- Criar todas as tabelas restantes do schema IMPACT7
-- Total: 54 tabelas (10 já criadas anteriormente)

-- Tabelas de Conteúdo e Mídia
CREATE TABLE IF NOT EXISTS `blogPosts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL UNIQUE,
  `excerpt` TEXT,
  `content` TEXT NOT NULL,
  `featuredImage` VARCHAR(1000),
  `author` VARCHAR(255),
  `category` VARCHAR(255),
  `tags` TEXT,
  `status` VARCHAR(50) DEFAULT 'draft',
  `publishedAt` BIGINT,
  `viewCount` INT DEFAULT 0,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `caseStudies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL UNIQUE,
  `summary` TEXT,
  `challenge` TEXT,
  `solution` TEXT,
  `results` TEXT,
  `clientName` VARCHAR(255),
  `clientLogo` VARCHAR(1000),
  `industry` VARCHAR(255),
  `impactScore` DECIMAL(10,2),
  `featuredImage` VARCHAR(1000),
  `status` VARCHAR(50) DEFAULT 'draft',
  `publishedAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `authorName` VARCHAR(255) NOT NULL,
  `authorRole` VARCHAR(255),
  `authorCompany` VARCHAR(255),
  `authorImage` VARCHAR(1000),
  `content` TEXT NOT NULL,
  `rating` INT,
  `isFeatured` BOOLEAN DEFAULT FALSE,
  `displayOrder` INT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `whitepapers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL UNIQUE,
  `description` TEXT,
  `fileUrl` VARCHAR(1000) NOT NULL,
  `coverImage` VARCHAR(1000),
  `category` VARCHAR(255),
  `tags` TEXT,
  `downloadCount` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'draft',
  `publishedAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `ebooks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL UNIQUE,
  `description` TEXT,
  `fileUrl` VARCHAR(1000) NOT NULL,
  `coverImage` VARCHAR(1000),
  `category` VARCHAR(255),
  `tags` TEXT,
  `downloadCount` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'draft',
  `publishedAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

-- Tabelas de Leads e Conversões
CREATE TABLE IF NOT EXISTS `whitepaperDownloads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `whitepaperId` INT NOT NULL,
  `userId` INT,
  `email` VARCHAR(255),
  `name` VARCHAR(255),
  `company` VARCHAR(255),
  `downloadedAt` BIGINT NOT NULL,
  FOREIGN KEY (`whitepaperId`) REFERENCES `whitepapers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `ebookDownloads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ebookId` INT NOT NULL,
  `userId` INT,
  `email` VARCHAR(255),
  `name` VARCHAR(255),
  `company` VARCHAR(255),
  `downloadedAt` BIGINT NOT NULL,
  FOREIGN KEY (`ebookId`) REFERENCES `ebooks`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `newsletterSubscribers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255),
  `status` VARCHAR(50) DEFAULT 'active',
  `subscribedAt` BIGINT NOT NULL,
  `unsubscribedAt` BIGINT
);

-- Tabelas de Analytics e Métricas
CREATE TABLE IF NOT EXISTS `siteMetrics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `metricType` VARCHAR(100) NOT NULL,
  `metricValue` DECIMAL(15,2) NOT NULL,
  `metadata` TEXT,
  `recordedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `socialProofMetrics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `metricName` VARCHAR(255) NOT NULL,
  `metricValue` VARCHAR(255) NOT NULL,
  `displayOrder` INT,
  `isVisible` BOOLEAN DEFAULT TRUE,
  `updatedAt` BIGINT NOT NULL
);

-- Tabelas de Configuração e Customização
CREATE TABLE IF NOT EXISTS `siteSettings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `settingKey` VARCHAR(255) NOT NULL UNIQUE,
  `settingValue` TEXT,
  `settingType` VARCHAR(50),
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `navigationMenus` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `menuName` VARCHAR(255) NOT NULL,
  `menuLocation` VARCHAR(100),
  `items` TEXT NOT NULL,
  `isActive` BOOLEAN DEFAULT TRUE,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `footerLinks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `linkText` VARCHAR(255) NOT NULL,
  `linkUrl` VARCHAR(1000) NOT NULL,
  `linkCategory` VARCHAR(100),
  `displayOrder` INT,
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` BIGINT NOT NULL
);

-- Tabelas de Notificações e Comunicação
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(100),
  `isRead` BOOLEAN DEFAULT FALSE,
  `actionUrl` VARCHAR(1000),
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `emailTemplates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `templateName` VARCHAR(255) NOT NULL UNIQUE,
  `subject` VARCHAR(500) NOT NULL,
  `htmlContent` TEXT NOT NULL,
  `textContent` TEXT,
  `variables` TEXT,
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `emailLogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `recipientEmail` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(500),
  `templateId` INT,
  `status` VARCHAR(50),
  `sentAt` BIGINT,
  `errorMessage` TEXT,
  FOREIGN KEY (`templateId`) REFERENCES `emailTemplates`(`id`) ON DELETE SET NULL
);

-- Tabelas de Webhooks e Integrações
CREATE TABLE IF NOT EXISTS `webhooks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `url` VARCHAR(1000) NOT NULL,
  `event` VARCHAR(255) NOT NULL,
  `secret` VARCHAR(500),
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `webhookDeliveries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `webhookId` INT NOT NULL,
  `event` VARCHAR(255) NOT NULL,
  `payload` TEXT,
  `responseStatus` INT,
  `responseBody` TEXT,
  `attempts` INT DEFAULT 1,
  `deliveredAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`webhookId`) REFERENCES `webhooks`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `apiKeys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `keyName` VARCHAR(255) NOT NULL,
  `keyValue` VARCHAR(500) NOT NULL UNIQUE,
  `permissions` TEXT,
  `lastUsedAt` BIGINT,
  `expiresAt` BIGINT,
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Tabelas de Auditoria e Logs
CREATE TABLE IF NOT EXISTS `auditLogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT,
  `action` VARCHAR(255) NOT NULL,
  `entityType` VARCHAR(100),
  `entityId` INT,
  `changes` TEXT,
  `ipAddress` VARCHAR(100),
  `userAgent` TEXT,
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `errorLogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `errorType` VARCHAR(255),
  `errorMessage` TEXT NOT NULL,
  `stackTrace` TEXT,
  `userId` INT,
  `url` VARCHAR(1000),
  `method` VARCHAR(20),
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Tabelas de Gamificação e Engajamento
CREATE TABLE IF NOT EXISTS `badges` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `badgeName` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `iconUrl` VARCHAR(1000),
  `criteria` TEXT,
  `points` INT DEFAULT 0,
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `userBadges` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `badgeId` INT NOT NULL,
  `earnedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`badgeId`) REFERENCES `badges`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_badge_unique` (`userId`, `badgeId`)
);

CREATE TABLE IF NOT EXISTS `userPoints` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `points` INT DEFAULT 0,
  `level` INT DEFAULT 1,
  `lastActivityAt` BIGINT,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_points_unique` (`userId`)
);

-- Tabelas de Feedback e Suporte
CREATE TABLE IF NOT EXISTS `feedbackSubmissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT,
  `email` VARCHAR(255),
  `category` VARCHAR(100),
  `subject` VARCHAR(500),
  `message` TEXT NOT NULL,
  `rating` INT,
  `status` VARCHAR(50) DEFAULT 'pending',
  `submittedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `supportTickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `subject` VARCHAR(500) NOT NULL,
  `description` TEXT NOT NULL,
  `priority` VARCHAR(50) DEFAULT 'medium',
  `status` VARCHAR(50) DEFAULT 'open',
  `assignedTo` INT,
  `resolvedAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `supportMessages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticketId` INT NOT NULL,
  `userId` INT NOT NULL,
  `message` TEXT NOT NULL,
  `isInternal` BOOLEAN DEFAULT FALSE,
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`ticketId`) REFERENCES `supportTickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Tabelas de Pesquisas e Questionários
CREATE TABLE IF NOT EXISTS `surveys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `description` TEXT,
  `questions` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'draft',
  `startsAt` BIGINT,
  `endsAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `surveyResponses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `surveyId` INT NOT NULL,
  `userId` INT,
  `email` VARCHAR(255),
  `responses` TEXT NOT NULL,
  `submittedAt` BIGINT NOT NULL,
  FOREIGN KEY (`surveyId`) REFERENCES `surveys`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Tabelas de Eventos e Webinars
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL UNIQUE,
  `description` TEXT,
  `eventType` VARCHAR(100),
  `location` VARCHAR(500),
  `virtualLink` VARCHAR(1000),
  `startsAt` BIGINT NOT NULL,
  `endsAt` BIGINT NOT NULL,
  `maxAttendees` INT,
  `registrationDeadline` BIGINT,
  `featuredImage` VARCHAR(1000),
  `status` VARCHAR(50) DEFAULT 'draft',
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `eventRegistrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `eventId` INT NOT NULL,
  `userId` INT,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255),
  `status` VARCHAR(50) DEFAULT 'confirmed',
  `registeredAt` BIGINT NOT NULL,
  FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Tabelas de Parcerias e Afiliados
CREATE TABLE IF NOT EXISTS `partners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `logo` VARCHAR(1000),
  `website` VARCHAR(1000),
  `partnerType` VARCHAR(100),
  `status` VARCHAR(50) DEFAULT 'active',
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `affiliates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `affiliateCode` VARCHAR(100) NOT NULL UNIQUE,
  `commissionRate` DECIMAL(5,2) DEFAULT 10.00,
  `totalEarnings` DECIMAL(15,2) DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'active',
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `affiliateReferrals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `affiliateId` INT NOT NULL,
  `referredUserId` INT,
  `referralCode` VARCHAR(100),
  `conversionValue` DECIMAL(15,2),
  `commissionAmount` DECIMAL(15,2),
  `status` VARCHAR(50) DEFAULT 'pending',
  `convertedAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`affiliateId`) REFERENCES `affiliates`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`referredUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Tabelas de Cursos e Treinamentos
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL UNIQUE,
  `description` TEXT,
  `instructor` VARCHAR(255),
  `duration` INT,
  `level` VARCHAR(50),
  `price` DECIMAL(10,2) DEFAULT 0,
  `featuredImage` VARCHAR(1000),
  `status` VARCHAR(50) DEFAULT 'draft',
  `publishedAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `courseLessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `courseId` INT NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `content` TEXT,
  `videoUrl` VARCHAR(1000),
  `duration` INT,
  `orderIndex` INT,
  `isFree` BOOLEAN DEFAULT FALSE,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `courseEnrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `courseId` INT NOT NULL,
  `userId` INT NOT NULL,
  `progress` INT DEFAULT 0,
  `completedAt` BIGINT,
  `enrolledAt` BIGINT NOT NULL,
  FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `course_user_unique` (`courseId`, `userId`)
);

-- Tabelas de Fórum e Comunidade
CREATE TABLE IF NOT EXISTS `forumCategories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `displayOrder` INT,
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `forumTopics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `categoryId` INT NOT NULL,
  `userId` INT NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL UNIQUE,
  `content` TEXT NOT NULL,
  `isPinned` BOOLEAN DEFAULT FALSE,
  `isLocked` BOOLEAN DEFAULT FALSE,
  `viewCount` INT DEFAULT 0,
  `replyCount` INT DEFAULT 0,
  `lastActivityAt` BIGINT,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`categoryId`) REFERENCES `forumCategories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `forumReplies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `topicId` INT NOT NULL,
  `userId` INT NOT NULL,
  `content` TEXT NOT NULL,
  `isAccepted` BOOLEAN DEFAULT FALSE,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL,
  FOREIGN KEY (`topicId`) REFERENCES `forumTopics`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Tabelas de Tags e Taxonomia
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `usageCount` INT DEFAULT 0,
  `createdAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `contentTags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tagId` INT NOT NULL,
  `contentType` VARCHAR(100) NOT NULL,
  `contentId` INT NOT NULL,
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `content_tag_unique` (`tagId`, `contentType`, `contentId`)
);

-- Tabelas de Mídia e Arquivos
CREATE TABLE IF NOT EXISTS `mediaLibrary` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT,
  `fileName` VARCHAR(500) NOT NULL,
  `fileUrl` VARCHAR(1000) NOT NULL,
  `fileType` VARCHAR(100),
  `fileSize` BIGINT,
  `mimeType` VARCHAR(100),
  `altText` VARCHAR(500),
  `caption` TEXT,
  `uploadedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `fileUploads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT,
  `fileName` VARCHAR(500) NOT NULL,
  `fileUrl` VARCHAR(1000) NOT NULL,
  `fileType` VARCHAR(100),
  `fileSize` BIGINT,
  `uploadPurpose` VARCHAR(255),
  `uploadedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Tabelas de Permissões e Roles (Sistema Próprio)
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `roleName` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `permissions` TEXT NOT NULL,
  `isSystemRole` BOOLEAN DEFAULT FALSE,
  `createdAt` BIGINT NOT NULL,
  `updatedAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `userRoles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `roleId` INT NOT NULL,
  `assignedAt` BIGINT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_role_unique` (`userId`, `roleId`)
);

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `permissionName` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `resource` VARCHAR(100),
  `action` VARCHAR(100),
  `createdAt` BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS `rolePermissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `roleId` INT NOT NULL,
  `permissionId` INT NOT NULL,
  `createdAt` BIGINT NOT NULL,
  FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `role_permission_unique` (`roleId`, `permissionId`)
);
