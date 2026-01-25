CREATE TABLE `apiKeys` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`keyHash` varchar(64) NOT NULL,
	`keyPrefix` varchar(8) NOT NULL,
	`permissions` text,
	`rateLimit` int NOT NULL DEFAULT 1000,
	`lastUsedAt` int,
	`expiresAt` int,
	`isActive` int NOT NULL DEFAULT true,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `apiKeys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`userEmail` varchar(255),
	`action` text NOT NULL,
	`resourceType` varchar(100) NOT NULL,
	`resourceId` varchar(100),
	`resourceName` varchar(255),
	`previousValue` text,
	`newValue` text,
	`metadata` text,
	`ipAddress` varchar(45),
	`userAgent` varchar(500),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` int NOT NULL,
	`slug` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50) NOT NULL,
	`color` varchar(7) NOT NULL DEFAULT '#f97316',
	`requirement` varchar(50) NOT NULL,
	`requiredValue` int NOT NULL,
	`pointsReward` int NOT NULL DEFAULT 100,
	`rarity` text NOT NULL DEFAULT ('common'),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `badges_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `calculations` (
	`id` int NOT NULL,
	`sessionId` varchar(64),
	`userId` int,
	`projectName` varchar(255),
	`investment` int NOT NULL,
	`contextScore` int NOT NULL,
	`resistanceScore` int NOT NULL,
	`beneficiaries` int NOT NULL,
	`duration` int NOT NULL,
	`impactScore` int NOT NULL,
	`sRoi` int NOT NULL,
	`sector` varchar(100),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `calculations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `caseFavorites` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`caseId` int NOT NULL,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `caseFavorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `caseSubmissions` (
	`id` int NOT NULL,
	`organizationName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`contactPhone` varchar(20),
	`projectTitle` varchar(255) NOT NULL,
	`sector` varchar(100) NOT NULL,
	`location` varchar(255) NOT NULL,
	`investment` varchar(100) NOT NULL,
	`beneficiaries` varchar(100) NOT NULL,
	`duration` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`challenge` text NOT NULL,
	`solution` text NOT NULL,
	`results` text NOT NULL,
	`metrics` text,
	`documentUrl` varchar(500),
	`status` text NOT NULL DEFAULT ('pending'),
	`reviewNotes` text,
	`reviewedAt` int,
	`reviewedBy` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `caseSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `caseTagRelations` (
	`id` int NOT NULL,
	`caseId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `caseTagRelations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `caseTags` (
	`id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`color` varchar(7) NOT NULL DEFAULT '#f97316',
	`description` text,
	`createdBy` int NOT NULL,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `caseTags_id` PRIMARY KEY(`id`),
	CONSTRAINT `caseTags_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`subject` varchar(255),
	`message` text NOT NULL,
	`status` text NOT NULL DEFAULT ('new'),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversionEvents` (
	`id` int NOT NULL,
	`userId` int,
	`sessionId` varchar(100),
	`eventType` text NOT NULL,
	`eventValue` varchar(255),
	`source` varchar(100),
	`medium` varchar(100),
	`campaign` varchar(100),
	`referrer` varchar(500),
	`metadata` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `conversionEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyMetrics` (
	`id` int NOT NULL,
	`metricDate` int NOT NULL,
	`totalPageViews` int NOT NULL DEFAULT 0,
	`uniqueVisitors` int NOT NULL DEFAULT 0,
	`totalLeads` int NOT NULL DEFAULT 0,
	`totalConversions` int NOT NULL DEFAULT 0,
	`jarvisInteractions` int NOT NULL DEFAULT 0,
	`calculatorUses` int NOT NULL DEFAULT 0,
	`ebookDownloads` int NOT NULL DEFAULT 0,
	`whitepaperDownloads` int NOT NULL DEFAULT 0,
	`avgTimeOnSite` int DEFAULT 0,
	`bounceRate` int DEFAULT 0,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `dailyMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ebookDownloads` (
	`id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`organization` varchar(255),
	`role` varchar(100),
	`phone` varchar(20),
	`source` varchar(100) DEFAULT 'website',
	`downloadedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`emailSent` int NOT NULL DEFAULT false,
	CONSTRAINT `ebookDownloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailCampaigns` (
	`id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`subject` varchar(255) NOT NULL,
	`preheader` varchar(255),
	`htmlContent` text NOT NULL,
	`textContent` text,
	`targetSegment` text NOT NULL DEFAULT ('all'),
	`status` text NOT NULL DEFAULT ('draft'),
	`scheduledAt` int,
	`sentAt` int,
	`totalRecipients` int DEFAULT 0,
	`totalSent` int DEFAULT 0,
	`totalOpened` int DEFAULT 0,
	`totalClicked` int DEFAULT 0,
	`totalUnsubscribed` int DEFAULT 0,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `emailCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `featureFlags` (
	`id` int NOT NULL,
	`key` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isEnabled` int NOT NULL DEFAULT false,
	`rolloutPercentage` int DEFAULT 0,
	`targetUserIds` text,
	`targetRoles` text,
	`targetPlans` text,
	`isExperiment` int NOT NULL DEFAULT false,
	`variants` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`expiresAt` int,
	CONSTRAINT `featureFlags_id` PRIMARY KEY(`id`),
	CONSTRAINT `featureFlags_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `impactCertificates` (
	`id` int NOT NULL,
	`certificateId` varchar(64) NOT NULL,
	`userId` int,
	`organizationName` varchar(255) NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`projectDescription` text,
	`totalInvestment` int NOT NULL,
	`beneficiaries` int NOT NULL,
	`sRoi` int NOT NULL,
	`impactScore` int NOT NULL,
	`sector` varchar(100) NOT NULL,
	`sdgs` text,
	`previousHash` varchar(64),
	`dataHash` varchar(64) NOT NULL,
	`merkleRoot` varchar(64),
	`blockNumber` int,
	`verificationStatus` text NOT NULL DEFAULT ('pending'),
	`verifiedBy` int,
	`verifiedAt` int,
	`issuedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`validUntil` int,
	`qrCodeUrl` varchar(500),
	`pdfUrl` varchar(500),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `impactCertificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `impactCertificates_certificateId_unique` UNIQUE(`certificateId`)
);
--> statement-breakpoint
CREATE TABLE `impactTokens` (
	`id` int NOT NULL,
	`tokenId` varchar(64) NOT NULL,
	`userId` int,
	`organizationId` int,
	`certificateId` int,
	`tokenType` text NOT NULL,
	`amount` int NOT NULL DEFAULT 1,
	`value` int NOT NULL DEFAULT 0,
	`name` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` varchar(500),
	`metadata` text,
	`previousOwner` int,
	`transferCount` int NOT NULL DEFAULT 0,
	`status` text NOT NULL DEFAULT ('active'),
	`mintedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`expiresAt` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `impactTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `impactTokens_tokenId_unique` UNIQUE(`tokenId`)
);
--> statement-breakpoint
CREATE TABLE `jarvisAnalytics` (
	`id` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`interactionType` text NOT NULL,
	`query` text,
	`skillUsed` varchar(50),
	`responseTime` int,
	`tokensUsed` int,
	`successful` int NOT NULL DEFAULT true,
	`errorMessage` text,
	`userFeedback` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `jarvisAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jarvisMemory` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`memoryType` text NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`importance` int NOT NULL DEFAULT 5,
	`lastAccessed` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`accessCount` int NOT NULL DEFAULT 1,
	`expiresAt` int,
	`isActive` int NOT NULL DEFAULT true,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `jarvisMemory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jarvisMessages` (
	`id` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `jarvisMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jarvisReports` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`reportType` text NOT NULL,
	`content` text NOT NULL,
	`summary` text,
	`metrics` text,
	`pdfUrl` varchar(500),
	`wordUrl` varchar(500),
	`status` text NOT NULL DEFAULT ('generating'),
	`generatedAt` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `jarvisReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jarvisSessions` (
	`id` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`context` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `jarvisSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `jarvisSessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `knowledgeDocuments` (
	`id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`tags` text,
	`embedding` text,
	`isActive` int NOT NULL DEFAULT true,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `knowledgeDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadConversions` (
	`id` int NOT NULL,
	`leadId` int NOT NULL,
	`conversionType` text NOT NULL,
	`sourcePage` varchar(255),
	`sourceForm` varchar(100),
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`referrer` varchar(500),
	`deviceType` text,
	`browser` varchar(50),
	`country` varchar(100),
	`convertedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `leadConversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int NOT NULL,
	`name` varchar(255),
	`email` varchar(320) NOT NULL,
	`organization` varchar(255),
	`phone` varchar(20),
	`message` text,
	`source` text NOT NULL DEFAULT ('contact_form'),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`welcomeEmailSent` int NOT NULL DEFAULT false,
	`nurturingStep` int NOT NULL DEFAULT 0,
	`lastEmailSentAt` int,
	`unsubscribed` int NOT NULL DEFAULT false,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterSubscribers` (
	`id` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`segment` text NOT NULL DEFAULT ('general'),
	`interests` text,
	`isActive` int NOT NULL DEFAULT true,
	`confirmedAt` int,
	`unsubscribedAt` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `newsletterSubscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletterSubscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`infoEnabled` int NOT NULL DEFAULT true,
	`successEnabled` int NOT NULL DEFAULT true,
	`warningEnabled` int NOT NULL DEFAULT true,
	`errorEnabled` int NOT NULL DEFAULT true,
	`casePendingEnabled` int NOT NULL DEFAULT true,
	`caseApprovedEnabled` int NOT NULL DEFAULT true,
	`caseRejectedEnabled` int NOT NULL DEFAULT true,
	`certificateIssuedEnabled` int NOT NULL DEFAULT true,
	`tokenEarnedEnabled` int NOT NULL DEFAULT true,
	`systemEnabled` int NOT NULL DEFAULT true,
	`emailEnabled` int NOT NULL DEFAULT true,
	`emailDigestFrequency` text NOT NULL DEFAULT ('instant'),
	`pushEnabled` int NOT NULL DEFAULT true,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationTemplates` (
	`id` int NOT NULL,
	`code` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`titleTemplate` varchar(255) NOT NULL,
	`messageTemplate` text NOT NULL,
	`availableVariables` text,
	`isActive` int NOT NULL DEFAULT true,
	`isSystem` int NOT NULL DEFAULT false,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`createdBy` int,
	CONSTRAINT `notificationTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationTemplates_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`type` text NOT NULL DEFAULT ('info'),
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`link` varchar(500),
	`isRead` int NOT NULL DEFAULT false,
	`metadata` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`readAt` int,
	`emailSentAt` int,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oauthAuthCodes` (
	`id` int NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(64) NOT NULL,
	`redirectUri` varchar(500) NOT NULL,
	`scopes` text NOT NULL,
	`codeChallenge` varchar(128),
	`codeChallengeMethod` varchar(10),
	`expiresAt` int NOT NULL,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `oauthAuthCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauthAuthCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `oauthClients` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`clientId` varchar(64) NOT NULL,
	`clientSecretHash` varchar(64) NOT NULL,
	`redirectUris` text NOT NULL,
	`scopes` text NOT NULL,
	`isActive` int NOT NULL DEFAULT true,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `oauthClients_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauthClients_clientId_unique` UNIQUE(`clientId`)
);
--> statement-breakpoint
CREATE TABLE `oauthTokens` (
	`id` int NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`accessToken` varchar(64) NOT NULL,
	`refreshToken` varchar(64),
	`scopes` text NOT NULL,
	`accessTokenExpiresAt` int NOT NULL,
	`refreshTokenExpiresAt` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `oauthTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauthTokens_accessToken_unique` UNIQUE(`accessToken`),
	CONSTRAINT `oauthTokens_refreshToken_unique` UNIQUE(`refreshToken`)
);
--> statement-breakpoint
CREATE TABLE `pageViews` (
	`id` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`pagePath` varchar(255) NOT NULL,
	`pageTitle` varchar(255),
	`referrer` varchar(500),
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`deviceType` text,
	`browser` varchar(50),
	`country` varchar(100),
	`timeOnPage` int,
	`scrollDepth` int,
	`viewedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `pageViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`logoUrl` varchar(500),
	`websiteUrl` varchar(500),
	`sector` varchar(100),
	`partnerType` text NOT NULL DEFAULT ('strategic'),
	`tier` text NOT NULL DEFAULT ('silver'),
	`isActive` int NOT NULL DEFAULT true,
	`isFeatured` int NOT NULL DEFAULT false,
	`displayOrder` int NOT NULL DEFAULT 0,
	`contactName` varchar(255),
	`contactEmail` varchar(320),
	`partnerSince` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformStats` (
	`id` int NOT NULL,
	`date` int NOT NULL,
	`totalUsers` int NOT NULL DEFAULT 0,
	`activeUsers` int NOT NULL DEFAULT 0,
	`totalCalculations` int NOT NULL DEFAULT 0,
	`totalCases` int NOT NULL DEFAULT 0,
	`totalCertificates` int NOT NULL DEFAULT 0,
	`totalTokensIssued` int NOT NULL DEFAULT 0,
	`avgSroi` int DEFAULT 0,
	`totalImpactValue` int DEFAULT 0,
	`totalBeneficiaries` int DEFAULT 0,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `platformStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pointTransactions` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`points` int NOT NULL,
	`reason` varchar(100) NOT NULL,
	`metadata` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `pointTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int NOT NULL,
	`referrerId` int NOT NULL,
	`referrerCode` varchar(20) NOT NULL,
	`referredId` int,
	`referredEmail` varchar(320),
	`status` text NOT NULL DEFAULT ('pending'),
	`referrerRewardType` text DEFAULT ('none'),
	`referrerRewardAmount` int DEFAULT 0,
	`referrerRewardApplied` int DEFAULT false,
	`referredRewardType` text DEFAULT ('none'),
	`referredRewardAmount` int DEFAULT 0,
	`referredRewardApplied` int DEFAULT false,
	`invitedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`signedUpAt` int,
	`convertedAt` int,
	`rewardedAt` int,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `set7Agents` (
	`id` int NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`agentType` text NOT NULL,
	`phase` varchar(20),
	`hookType` text,
	`defaultModel` varchar(50) NOT NULL DEFAULT 'gpt-4o',
	`allowedModels` text,
	`maxTokensPerRequest` int NOT NULL DEFAULT 4000,
	`maxTokensPerDay` int NOT NULL DEFAULT 100000,
	`permissions` text,
	`canReadFiles` int NOT NULL DEFAULT 0,
	`canWriteFiles` int NOT NULL DEFAULT 0,
	`canExecuteCode` int NOT NULL DEFAULT 0,
	`canAccessNetwork` int NOT NULL DEFAULT 0,
	`canAccessDatabase` int NOT NULL DEFAULT 0,
	`status` text NOT NULL DEFAULT ('active'),
	`killSwitchTriggered` int NOT NULL DEFAULT 0,
	`killSwitchReason` text,
	`killSwitchAt` int,
	`totalTasksExecuted` int NOT NULL DEFAULT 0,
	`totalTokensUsed` int NOT NULL DEFAULT 0,
	`totalCostUsd` int NOT NULL DEFAULT 0,
	`avgExecutionTimeMs` int NOT NULL DEFAULT 0,
	`successRate` int NOT NULL DEFAULT 100,
	`lastActiveAt` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `set7Agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `set7Agents_agentId_unique` UNIQUE(`agentId`)
);
--> statement-breakpoint
CREATE TABLE `set7AuditLog` (
	`id` int NOT NULL,
	`auditId` varchar(64) NOT NULL,
	`eventType` text NOT NULL,
	`phase` varchar(20),
	`agentId` varchar(64),
	`taskId` varchar(64),
	`gateId` varchar(64),
	`integrationId` varchar(64),
	`description` text NOT NULL,
	`details` text,
	`userId` int,
	`userName` varchar(255),
	`severity` text NOT NULL DEFAULT ('info'),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `set7AuditLog_id` PRIMARY KEY(`id`),
	CONSTRAINT `set7AuditLog_auditId_unique` UNIQUE(`auditId`)
);
--> statement-breakpoint
CREATE TABLE `set7Gates` (
	`id` int NOT NULL,
	`gateId` varchar(64) NOT NULL,
	`phase` varchar(20) NOT NULL,
	`gateName` varchar(255) NOT NULL,
	`description` text,
	`mode` text NOT NULL DEFAULT ('standard'),
	`checklistItems` text,
	`requiredItems` text,
	`status` text NOT NULL DEFAULT ('pending'),
	`evidences` text,
	`mitigationPlan` text,
	`mitigationDeadline` int,
	`mitigationApprovedBy` int,
	`approvedBy` int,
	`approvedAt` int,
	`humanApprovalRequired` int NOT NULL DEFAULT false,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `set7Gates_id` PRIMARY KEY(`id`),
	CONSTRAINT `set7Gates_gateId_unique` UNIQUE(`gateId`)
);
--> statement-breakpoint
CREATE TABLE `set7Integrations` (
	`id` int NOT NULL,
	`integrationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`integrationType` text NOT NULL,
	`contractVersion` varchar(20) NOT NULL,
	`contractSchema` text,
	`endpointUrl` varchar(500),
	`httpMethod` varchar(10),
	`identityHash` varchar(64) NOT NULL,
	`previousHash` varchar(64),
	`qrCodeData` text,
	`qrCodeUrl` varchar(500),
	`verificationStatus` text NOT NULL DEFAULT ('pending'),
	`lastVerifiedAt` int,
	`verificationCount` int NOT NULL DEFAULT 0,
	`config` text,
	`headers` text,
	`authentication` text,
	`status` text NOT NULL DEFAULT ('active'),
	`totalCalls` int NOT NULL DEFAULT 0,
	`successfulCalls` int NOT NULL DEFAULT 0,
	`failedCalls` int NOT NULL DEFAULT 0,
	`avgResponseTimeMs` int NOT NULL DEFAULT 0,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `set7Integrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `set7Integrations_integrationId_unique` UNIQUE(`integrationId`)
);
--> statement-breakpoint
CREATE TABLE `set7Nfrs` (
	`id` int NOT NULL,
	`nfrId` varchar(64) NOT NULL,
	`projectId` varchar(64),
	`phase` varchar(20),
	`dimension` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` text NOT NULL DEFAULT ('P1'),
	`measurementCriteria` text,
	`targetValue` varchar(100),
	`currentValue` varchar(100),
	`status` text NOT NULL DEFAULT ('not_started'),
	`evidences` text,
	`ownerId` int,
	`ownerName` varchar(255),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `set7Nfrs_id` PRIMARY KEY(`id`),
	CONSTRAINT `set7Nfrs_nfrId_unique` UNIQUE(`nfrId`)
);
--> statement-breakpoint
CREATE TABLE `set7RoiTracking` (
	`id` int NOT NULL,
	`trackingId` varchar(64) NOT NULL,
	`roiType` text NOT NULL,
	`phase` varchar(20),
	`plannedCostUsd` int NOT NULL DEFAULT 0,
	`actualCostUsd` int NOT NULL DEFAULT 0,
	`plannedTokens` int NOT NULL DEFAULT 0,
	`actualTokens` int NOT NULL DEFAULT 0,
	`plannedHours` int NOT NULL DEFAULT 0,
	`actualHours` int NOT NULL DEFAULT 0,
	`plannedValueUsd` int NOT NULL DEFAULT 0,
	`actualValueUsd` int NOT NULL DEFAULT 0,
	`roiPercentage` int NOT NULL DEFAULT 0,
	`roiRatio` varchar(20),
	`assumptions` text,
	`deviations` text,
	`deviationAnalysis` text,
	`documentUrl` varchar(500),
	`documentHash` varchar(64),
	`calculatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `set7RoiTracking_id` PRIMARY KEY(`id`),
	CONSTRAINT `set7RoiTracking_trackingId_unique` UNIQUE(`trackingId`)
);
--> statement-breakpoint
CREATE TABLE `set7RuntimeConfig` (
	`id` int NOT NULL,
	`configId` varchar(64) NOT NULL,
	`mode` text NOT NULL DEFAULT ('standard'),
	`hooksEnabled` text,
	`hookRoiEnabled` int NOT NULL DEFAULT true,
	`hookTokensEnabled` int NOT NULL DEFAULT true,
	`hookQualityEnabled` int NOT NULL DEFAULT true,
	`hookSecurityEnabled` int NOT NULL DEFAULT true,
	`hookGtlEnabled` int NOT NULL DEFAULT true,
	`hookFrequency` text NOT NULL DEFAULT ('per_phase'),
	`gtlType` text NOT NULL DEFAULT ('saas'),
	`gtlPlans` text,
	`defaultTokenBudget` int NOT NULL DEFAULT 100000,
	`modelRouting` text,
	`gateProfile` text,
	`humanApprovalPhases` text,
	`isActive` int NOT NULL DEFAULT true,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `set7RuntimeConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `set7RuntimeConfig_configId_unique` UNIQUE(`configId`)
);
--> statement-breakpoint
CREATE TABLE `set7Tasklog` (
	`id` int NOT NULL,
	`taskId` varchar(64) NOT NULL,
	`phase` varchar(20) NOT NULL,
	`taskType` text NOT NULL,
	`taskName` varchar(255) NOT NULL,
	`description` text,
	`agentId` varchar(64) NOT NULL,
	`agentType` text NOT NULL,
	`agentName` varchar(100) NOT NULL,
	`taxonomyBase` varchar(10),
	`taxonomySubbase` varchar(20),
	`taxonomyTags` text,
	`tokensInput` int NOT NULL DEFAULT 0,
	`tokensOutput` int NOT NULL DEFAULT 0,
	`tokensTotal` int NOT NULL DEFAULT 0,
	`modelUsed` varchar(50),
	`executionTimeMs` int NOT NULL DEFAULT 0,
	`costUsd` int NOT NULL DEFAULT 0,
	`status` text NOT NULL DEFAULT ('pending'),
	`result` text,
	`errorMessage` text,
	`outputArtifacts` text,
	`gateId` varchar(64),
	`gateStatus` text,
	`startedAt` int,
	`completedAt` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `set7Tasklog_id` PRIMARY KEY(`id`),
	CONSTRAINT `set7Tasklog_taskId_unique` UNIQUE(`taskId`)
);
--> statement-breakpoint
CREATE TABLE `set7TokenBudgets` (
	`id` int NOT NULL,
	`budgetId` varchar(64) NOT NULL,
	`scope` text NOT NULL,
	`scopeId` varchar(64) NOT NULL,
	`scopeName` varchar(255) NOT NULL,
	`budgetTokens` int NOT NULL,
	`budgetUsd` int NOT NULL,
	`warningThreshold` int NOT NULL DEFAULT 80,
	`criticalThreshold` int NOT NULL DEFAULT 95,
	`usedTokens` int NOT NULL DEFAULT 0,
	`usedUsd` int NOT NULL DEFAULT 0,
	`periodType` text NOT NULL DEFAULT ('monthly'),
	`periodStart` int,
	`periodEnd` int,
	`status` text NOT NULL DEFAULT ('active'),
	`circuitBreakerTriggered` int NOT NULL DEFAULT false,
	`circuitBreakerAt` int,
	`circuitBreakerReason` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `set7TokenBudgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `set7TokenBudgets_budgetId_unique` UNIQUE(`budgetId`)
);
--> statement-breakpoint
CREATE TABLE `siteMetrics` (
	`id` int NOT NULL,
	`metricType` varchar(50) NOT NULL,
	`metricValue` int NOT NULL,
	`metricDate` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`metadata` text,
	CONSTRAINT `siteMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialProofMetrics` (
	`id` int NOT NULL,
	`key` varchar(50) NOT NULL,
	`value` varchar(50) NOT NULL,
	`label` varchar(255) NOT NULL,
	`labelEn` varchar(255),
	`labelEs` varchar(255),
	`icon` varchar(50),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT true,
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `socialProofMetrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `socialProofMetrics_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `supportTickets` (
	`id` int NOT NULL,
	`ticketNumber` varchar(20) NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`userEmail` varchar(320) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL DEFAULT ('general'),
	`priority` text NOT NULL DEFAULT ('medium'),
	`status` text NOT NULL DEFAULT ('open'),
	`assignedToId` int,
	`assignedToName` varchar(255),
	`resolution` text,
	`resolvedAt` int,
	`attachments` text,
	`tags` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`firstResponseAt` int,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `supportTickets_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`description` varchar(255),
	`category` text NOT NULL DEFAULT ('general'),
	`valueType` text NOT NULL DEFAULT ('string'),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`company` varchar(255) NOT NULL,
	`sector` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`imageUrl` varchar(500),
	`videoUrl` varchar(500),
	`metrics` text,
	`isActive` int NOT NULL DEFAULT true,
	`isFeatured` int NOT NULL DEFAULT false,
	`displayOrder` int NOT NULL DEFAULT 0,
	`language` varchar(5) NOT NULL DEFAULT 'pt',
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticketMessages` (
	`id` int NOT NULL,
	`ticketId` int NOT NULL,
	`senderId` int,
	`senderName` varchar(255) NOT NULL,
	`senderEmail` varchar(320),
	`isStaff` int NOT NULL DEFAULT false,
	`message` text NOT NULL,
	`attachments` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `ticketMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokenTransactions` (
	`id` int NOT NULL,
	`tokenId` int NOT NULL,
	`transactionType` text NOT NULL,
	`fromUserId` int,
	`toUserId` int,
	`amount` int NOT NULL DEFAULT 1,
	`transactionHash` varchar(64) NOT NULL,
	`previousTransactionHash` varchar(64),
	`metadata` text,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `tokenTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokenUsageLogs` (
	`id` int NOT NULL,
	`tokenId` int NOT NULL,
	`userId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`statusCode` int,
	`responseTime` int,
	`ipAddress` varchar(45),
	`userAgent` varchar(500),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `tokenUsageLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `twoFactorAuth` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`secret` varchar(255) NOT NULL,
	`isEnabled` int NOT NULL DEFAULT false,
	`isVerified` int NOT NULL DEFAULT false,
	`backupCodes` text,
	`backupCodesUsed` int NOT NULL DEFAULT 0,
	`recoveryEmail` varchar(320),
	`recoveryPhone` varchar(20),
	`lastUsedAt` int,
	`failedAttempts` int NOT NULL DEFAULT 0,
	`lockedUntil` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `twoFactorAuth_id` PRIMARY KEY(`id`),
	CONSTRAINT `twoFactorAuth_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `twoFactorSessions` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`sessionToken` varchar(64) NOT NULL,
	`isVerified` int NOT NULL DEFAULT false,
	`verifiedAt` int,
	`expiresAt` int NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` varchar(500),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `twoFactorSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `twoFactorSessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `userAccessTokens` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`tokenHash` varchar(64) NOT NULL,
	`tokenPrefix` varchar(12) NOT NULL,
	`scopes` text,
	`rateLimit` int NOT NULL DEFAULT 1000,
	`rateLimitRemaining` int NOT NULL DEFAULT 1000,
	`rateLimitResetAt` int,
	`lastUsedAt` int,
	`usageCount` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT true,
	`expiresAt` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `userAccessTokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userBadges` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `userBadges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPoints` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`totalInteractions` int NOT NULL DEFAULT 0,
	`streak` int NOT NULL DEFAULT 0,
	`lastInteractionAt` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `userPoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'pt',
	`theme` text NOT NULL DEFAULT ('system'),
	`timezone` varchar(50) NOT NULL DEFAULT 'America/Sao_Paulo',
	`emailNotifications` int NOT NULL DEFAULT true,
	`pushNotifications` int NOT NULL DEFAULT true,
	`weeklyDigest` int NOT NULL DEFAULT true,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int NOT NULL,
	`openId` varchar(64),
	`name` text,
	`email` varchar(320),
	`passwordHash` varchar(255),
	`loginMethod` varchar(64),
	`role` text NOT NULL DEFAULT ('user'),
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`subscriptionStatus` text DEFAULT ('none'),
	`planType` text DEFAULT ('free'),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`lastSignedIn` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `webhookDeliveries` (
	`id` int NOT NULL,
	`webhookId` int NOT NULL,
	`event` varchar(50) NOT NULL,
	`payload` text NOT NULL,
	`responseStatus` int,
	`responseBody` text,
	`attempts` int NOT NULL DEFAULT 1,
	`nextRetryAt` int,
	`deliveredAt` int,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `webhookDeliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`url` varchar(500) NOT NULL,
	`secret` varchar(64) NOT NULL,
	`events` text NOT NULL,
	`isActive` int NOT NULL DEFAULT true,
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `white_label_config` (
	`id` int NOT NULL,
	`organizationId` varchar(255) NOT NULL,
	`platformName` varchar(255) NOT NULL DEFAULT 'IMPACT7',
	`logoUrl` varchar(500),
	`faviconUrl` varchar(500),
	`primaryColor` varchar(7) DEFAULT '#ff6b35',
	`secondaryColor` varchar(7) DEFAULT '#004e89',
	`accentColor` varchar(7) DEFAULT '#f7931e',
	`fontFamily` varchar(100) DEFAULT 'Inter',
	`customDomain` varchar(255),
	`supportEmail` varchar(320),
	`supportPhone` varchar(20),
	`websiteUrl` varchar(500),
	`linkedinUrl` varchar(500),
	`twitterUrl` varchar(500),
	`createdAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	`updatedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `white_label_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `white_label_config_organizationId_unique` UNIQUE(`organizationId`)
);
--> statement-breakpoint
CREATE TABLE `whitepaperDownloads` (
	`id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`organization` varchar(255),
	`downloadedAt` int NOT NULL DEFAULT UNIX_TIMESTAMP(),
	CONSTRAINT `whitepaperDownloads_id` PRIMARY KEY(`id`)
);
