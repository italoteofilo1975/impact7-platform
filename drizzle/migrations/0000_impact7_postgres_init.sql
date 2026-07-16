CREATE TABLE "apiKeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"keyHash" varchar(64) NOT NULL,
	"keyPrefix" varchar(8) NOT NULL,
	"permissions" text,
	"rateLimit" integer DEFAULT 1000 NOT NULL,
	"lastUsedAt" bigint,
	"expiresAt" bigint,
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auditLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"userName" varchar(255),
	"userEmail" varchar(255),
	"action" text NOT NULL,
	"resourceType" varchar(100) NOT NULL,
	"resourceId" varchar(100),
	"resourceName" varchar(255),
	"previousValue" text,
	"newValue" text,
	"metadata" text,
	"ipAddress" varchar(45),
	"userAgent" varchar(500),
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50) NOT NULL,
	"color" varchar(7) DEFAULT '#f97316' NOT NULL,
	"requirement" varchar(50) NOT NULL,
	"requiredValue" integer NOT NULL,
	"pointsReward" integer DEFAULT 100 NOT NULL,
	"rarity" text DEFAULT 'common' NOT NULL,
	"createdAt" bigint NOT NULL,
	CONSTRAINT "badges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blogPosts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"featuredImage" varchar(1000),
	"author" varchar(255),
	"category" varchar(255),
	"tags" text,
	"status" varchar(50) DEFAULT 'draft',
	"viewCount" integer DEFAULT 0,
	"publishedAt" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculations" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64),
	"userId" integer,
	"projectName" varchar(255),
	"investment" integer NOT NULL,
	"contextScore" integer NOT NULL,
	"resistanceScore" integer NOT NULL,
	"beneficiaries" integer NOT NULL,
	"duration" integer NOT NULL,
	"impactScore" integer NOT NULL,
	"sRoi" integer NOT NULL,
	"sector" varchar(100),
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caseFavorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"caseId" integer NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caseStudies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"organization" varchar(255),
	"sector" varchar(100),
	"region" varchar(100),
	"location" varchar(255),
	"investment" integer,
	"beneficiaries" integer,
	"duration" integer,
	"sroi" numeric(10, 2),
	"year" integer,
	"description" text,
	"challenge" text,
	"solution" text,
	"results" text,
	"testimonialQuote" text,
	"testimonialAuthor" varchar(255),
	"testimonialRole" varchar(255),
	"sdgs" text,
	"metrics" text,
	"isFeatured" integer DEFAULT 0 NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	"projectTitle" varchar(255),
	"organizationName" varchar(255),
	"contactName" varchar(255),
	"contactEmail" varchar(320),
	"contactPhone" varchar(20),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"reviewNotes" text,
	"reviewedBy" integer,
	"reviewedAt" bigint
);
--> statement-breakpoint
CREATE TABLE "caseSubmissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organizationName" varchar(255) NOT NULL,
	"contactName" varchar(255) NOT NULL,
	"contactEmail" varchar(320) NOT NULL,
	"contactPhone" varchar(20),
	"projectTitle" varchar(255) NOT NULL,
	"sector" varchar(100) NOT NULL,
	"location" varchar(255) NOT NULL,
	"investment" varchar(100) NOT NULL,
	"beneficiaries" varchar(100) NOT NULL,
	"duration" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"challenge" text NOT NULL,
	"solution" text NOT NULL,
	"results" text NOT NULL,
	"metrics" text,
	"documentUrl" varchar(500),
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewNotes" text,
	"reviewedAt" bigint,
	"reviewedBy" integer,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caseTagRelations" (
	"id" serial PRIMARY KEY NOT NULL,
	"caseId" integer NOT NULL,
	"tagId" integer NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caseTags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"color" varchar(7) DEFAULT '#f97316' NOT NULL,
	"description" text,
	"createdBy" integer NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "caseTags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cmsPages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text,
	"metaDescription" varchar(500),
	"isPublished" integer DEFAULT 1,
	"updatedBy" integer,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "cmsPages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20),
	"subject" varchar(255),
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversionEvents" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"sessionId" varchar(100),
	"eventType" text NOT NULL,
	"eventValue" varchar(255),
	"source" varchar(100),
	"medium" varchar(100),
	"campaign" varchar(100),
	"referrer" varchar(500),
	"metadata" text,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courseEnrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer NOT NULL,
	"userId" integer NOT NULL,
	"progress" integer DEFAULT 0,
	"completedAt" bigint,
	"enrolledAt" bigint NOT NULL,
	"completedLessons" text DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE "courseLessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text,
	"videoUrl" varchar(1000),
	"duration" integer,
	"orderIndex" integer DEFAULT 0,
	"isFree" integer DEFAULT 0,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"description" text,
	"instructor" varchar(255),
	"duration" integer,
	"level" varchar(50),
	"price" numeric(10, 2),
	"featuredImage" varchar(1000),
	"status" varchar(50) DEFAULT 'draft',
	"publishedAt" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dailyMetrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metricDate" integer NOT NULL,
	"totalPageViews" integer DEFAULT 0 NOT NULL,
	"uniqueVisitors" integer DEFAULT 0 NOT NULL,
	"totalLeads" integer DEFAULT 0 NOT NULL,
	"totalConversions" integer DEFAULT 0 NOT NULL,
	"jarvisInteractions" integer DEFAULT 0 NOT NULL,
	"calculatorUses" integer DEFAULT 0 NOT NULL,
	"ebookDownloads" integer DEFAULT 0 NOT NULL,
	"whitepaperDownloads" integer DEFAULT 0 NOT NULL,
	"avgTimeOnSite" integer DEFAULT 0,
	"bounceRate" integer DEFAULT 0,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ebookDownloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"organization" varchar(255),
	"role" varchar(100),
	"phone" varchar(20),
	"source" varchar(100) DEFAULT 'website',
	"downloadedAt" bigint NOT NULL,
	"emailSent" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emailCampaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"subject" varchar(255) NOT NULL,
	"preheader" varchar(255),
	"htmlContent" text NOT NULL,
	"textContent" text,
	"targetSegment" text DEFAULT 'all' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduledAt" bigint,
	"sentAt" bigint,
	"totalRecipients" integer DEFAULT 0,
	"totalSent" integer DEFAULT 0,
	"totalOpened" integer DEFAULT 0,
	"totalClicked" integer DEFAULT 0,
	"totalUnsubscribed" integer DEFAULT 0,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "errorLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" varchar(20) DEFAULT 'error' NOT NULL,
	"message" text NOT NULL,
	"stack" text,
	"context" jsonb,
	"userId" integer,
	"userEmail" varchar(255),
	"path" varchar(500),
	"method" varchar(10),
	"statusCode" integer,
	"resolved" integer DEFAULT 0,
	"resolvedAt" bigint,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventRegistrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventId" integer NOT NULL,
	"userId" integer,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"company" varchar(255),
	"status" varchar(50) DEFAULT 'confirmed',
	"registeredAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"description" text,
	"eventType" varchar(100),
	"location" varchar(500),
	"virtualLink" varchar(1000),
	"startsAt" bigint NOT NULL,
	"endsAt" bigint NOT NULL,
	"maxAttendees" integer,
	"registrationDeadline" integer,
	"featuredImage" varchar(1000),
	"status" varchar(50) DEFAULT 'draft',
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "featureFlags" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"isEnabled" integer DEFAULT 0 NOT NULL,
	"rolloutPercentage" integer DEFAULT 0,
	"targetUserIds" text,
	"targetRoles" text,
	"targetPlans" text,
	"isExperiment" integer DEFAULT 0 NOT NULL,
	"variants" text,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	"expiresAt" bigint,
	CONSTRAINT "featureFlags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "forumCategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"displayOrder" integer DEFAULT 0,
	"isActive" integer DEFAULT 1,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forumReplies" (
	"id" serial PRIMARY KEY NOT NULL,
	"topicId" integer NOT NULL,
	"userId" integer NOT NULL,
	"content" text NOT NULL,
	"isAccepted" integer DEFAULT 0,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forumTopics" (
	"id" serial PRIMARY KEY NOT NULL,
	"categoryId" integer NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"isPinned" integer DEFAULT 0,
	"isLocked" integer DEFAULT 0,
	"viewCount" integer DEFAULT 0,
	"replyCount" integer DEFAULT 0,
	"lastActivityAt" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impactCertificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"certificateId" varchar(64) NOT NULL,
	"userId" integer,
	"organizationName" varchar(255) NOT NULL,
	"projectName" varchar(255) NOT NULL,
	"projectDescription" text,
	"totalInvestment" integer NOT NULL,
	"beneficiaries" integer NOT NULL,
	"sRoi" integer NOT NULL,
	"impactScore" integer NOT NULL,
	"sector" varchar(100) NOT NULL,
	"sdgs" text,
	"previousHash" varchar(64),
	"dataHash" varchar(64) NOT NULL,
	"merkleRoot" varchar(64),
	"blockNumber" integer,
	"verificationStatus" text DEFAULT 'pending' NOT NULL,
	"verifiedBy" integer,
	"verifiedAt" bigint,
	"issuedAt" bigint NOT NULL,
	"validUntil" bigint,
	"qrCodeUrl" varchar(500),
	"pdfUrl" varchar(500),
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "impactCertificates_certificateId_unique" UNIQUE("certificateId")
);
--> statement-breakpoint
CREATE TABLE "impactTokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"tokenId" varchar(64) NOT NULL,
	"userId" integer,
	"organizationId" integer,
	"certificateId" integer,
	"tokenType" text NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"imageUrl" varchar(500),
	"metadata" text,
	"previousOwner" integer,
	"transferCount" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"mintedAt" bigint NOT NULL,
	"expiresAt" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "impactTokens_tokenId_unique" UNIQUE("tokenId")
);
--> statement-breakpoint
CREATE TABLE "jarvisAnalytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"userId" integer,
	"interactionType" text NOT NULL,
	"query" text,
	"skillUsed" varchar(50),
	"responseTime" integer,
	"tokensUsed" integer,
	"successful" integer DEFAULT 1 NOT NULL,
	"errorMessage" text,
	"userFeedback" text,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jarvisMemory" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"memoryType" text NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"importance" integer DEFAULT 5 NOT NULL,
	"lastAccessed" integer NOT NULL,
	"accessCount" integer DEFAULT 1 NOT NULL,
	"expiresAt" bigint,
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jarvisMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" text,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jarvisReports" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"reportType" text NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"metrics" text,
	"pdfUrl" varchar(500),
	"wordUrl" varchar(500),
	"status" text DEFAULT 'generating' NOT NULL,
	"generatedAt" bigint,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jarvisSessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"userId" integer,
	"context" text,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "jarvisSessions_sessionId_unique" UNIQUE("sessionId")
);
--> statement-breakpoint
CREATE TABLE "jobOpenings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"department" varchar(255),
	"location" varchar(255),
	"type" varchar(100),
	"salaryRange" varchar(255),
	"description" text,
	"requirements" jsonb,
	"benefits" jsonb,
	"isActive" integer DEFAULT 1,
	"isNew" integer DEFAULT 0,
	"applyUrl" varchar(1000),
	"closingDate" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledgeDocuments" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"tags" text,
	"embedding" text,
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leadConversions" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"conversionType" text NOT NULL,
	"sourcePage" varchar(255),
	"sourceForm" varchar(100),
	"utmSource" varchar(100),
	"utmMedium" varchar(100),
	"utmCampaign" varchar(100),
	"referrer" varchar(500),
	"deviceType" text,
	"browser" varchar(50),
	"country" varchar(100),
	"convertedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(320) NOT NULL,
	"organization" varchar(255),
	"phone" varchar(20),
	"message" text,
	"source" text DEFAULT 'contact_form' NOT NULL,
	"createdAt" bigint NOT NULL,
	"welcomeEmailSent" integer DEFAULT 0 NOT NULL,
	"nurturingStep" integer DEFAULT 0 NOT NULL,
	"lastEmailSentAt" bigint,
	"unsubscribed" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletterSubscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255),
	"segment" text DEFAULT 'general' NOT NULL,
	"interests" text,
	"isActive" integer DEFAULT 1 NOT NULL,
	"confirmedAt" bigint,
	"unsubscribedAt" bigint,
	"createdAt" bigint NOT NULL,
	CONSTRAINT "newsletterSubscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notificationPreferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"infoEnabled" integer DEFAULT 1 NOT NULL,
	"successEnabled" integer DEFAULT 1 NOT NULL,
	"warningEnabled" integer DEFAULT 1 NOT NULL,
	"errorEnabled" integer DEFAULT 1 NOT NULL,
	"casePendingEnabled" integer DEFAULT 1 NOT NULL,
	"caseApprovedEnabled" integer DEFAULT 1 NOT NULL,
	"caseRejectedEnabled" integer DEFAULT 1 NOT NULL,
	"certificateIssuedEnabled" integer DEFAULT 1 NOT NULL,
	"tokenEarnedEnabled" integer DEFAULT 1 NOT NULL,
	"systemEnabled" integer DEFAULT 1 NOT NULL,
	"emailEnabled" integer DEFAULT 1 NOT NULL,
	"emailDigestFrequency" text DEFAULT 'instant' NOT NULL,
	"pushEnabled" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notificationTemplates" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"titleTemplate" varchar(255) NOT NULL,
	"messageTemplate" text NOT NULL,
	"availableVariables" text,
	"isActive" integer DEFAULT 1 NOT NULL,
	"isSystem" integer DEFAULT 0 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	"createdBy" integer,
	CONSTRAINT "notificationTemplates_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"link" varchar(500),
	"isRead" integer DEFAULT 0 NOT NULL,
	"metadata" text,
	"createdAt" bigint NOT NULL,
	"readAt" bigint,
	"emailSentAt" bigint
);
--> statement-breakpoint
CREATE TABLE "oauthAuthCodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientId" varchar(64) NOT NULL,
	"userId" integer NOT NULL,
	"code" varchar(64) NOT NULL,
	"redirectUri" varchar(500) NOT NULL,
	"scopes" text NOT NULL,
	"codeChallenge" varchar(128),
	"codeChallengeMethod" varchar(10),
	"expiresAt" bigint NOT NULL,
	"createdAt" bigint NOT NULL,
	CONSTRAINT "oauthAuthCodes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "oauthClients" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"clientId" varchar(64) NOT NULL,
	"clientSecretHash" varchar(64) NOT NULL,
	"redirectUris" text NOT NULL,
	"scopes" text NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "oauthClients_clientId_unique" UNIQUE("clientId")
);
--> statement-breakpoint
CREATE TABLE "oauthTokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientId" varchar(64) NOT NULL,
	"userId" integer NOT NULL,
	"accessToken" varchar(64) NOT NULL,
	"refreshToken" varchar(64),
	"scopes" text NOT NULL,
	"accessTokenExpiresAt" bigint NOT NULL,
	"refreshTokenExpiresAt" bigint,
	"createdAt" bigint NOT NULL,
	CONSTRAINT "oauthTokens_accessToken_unique" UNIQUE("accessToken"),
	CONSTRAINT "oauthTokens_refreshToken_unique" UNIQUE("refreshToken")
);
--> statement-breakpoint
CREATE TABLE "pageViews" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"userId" integer,
	"pagePath" varchar(255) NOT NULL,
	"pageTitle" varchar(255),
	"referrer" varchar(500),
	"utmSource" varchar(100),
	"utmMedium" varchar(100),
	"utmCampaign" varchar(100),
	"deviceType" text,
	"browser" varchar(50),
	"country" varchar(100),
	"timeOnPage" integer,
	"scrollDepth" integer,
	"viewedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"description" text,
	"logo" varchar(1000),
	"website" varchar(1000),
	"partnerType" varchar(100),
	"status" varchar(50),
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expiresAt" bigint NOT NULL,
	"createdAt" bigint NOT NULL,
	"usedAt" bigint
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "platformStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" bigint NOT NULL,
	"totalUsers" integer DEFAULT 0 NOT NULL,
	"activeUsers" integer DEFAULT 0 NOT NULL,
	"totalCalculations" integer DEFAULT 0 NOT NULL,
	"totalCases" integer DEFAULT 0 NOT NULL,
	"totalCertificates" integer DEFAULT 0 NOT NULL,
	"totalTokensIssued" integer DEFAULT 0 NOT NULL,
	"avgSroi" integer DEFAULT 0,
	"totalImpactValue" integer DEFAULT 0,
	"totalBeneficiaries" integer DEFAULT 0,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pointTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"points" integer NOT NULL,
	"reason" varchar(100) NOT NULL,
	"metadata" text,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrerId" integer NOT NULL,
	"referrerCode" varchar(20) NOT NULL,
	"referredId" integer,
	"referredEmail" varchar(320),
	"status" text DEFAULT 'pending' NOT NULL,
	"referrerRewardType" text DEFAULT 'none',
	"referrerRewardAmount" integer DEFAULT 0,
	"referrerRewardApplied" integer DEFAULT 0,
	"referredRewardType" text DEFAULT 'none',
	"referredRewardAmount" integer DEFAULT 0,
	"referredRewardApplied" integer DEFAULT 0,
	"invitedAt" bigint NOT NULL,
	"signedUpAt" bigint,
	"convertedAt" bigint,
	"rewardedAt" bigint
);
--> statement-breakpoint
CREATE TABLE "rolePermissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"roleId" integer NOT NULL,
	"permissionId" integer NOT NULL,
	"assignedAt" bigint NOT NULL,
	CONSTRAINT "rolePermissions_role_perm_uq" UNIQUE("roleId","permissionId")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"level" integer DEFAULT 0 NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "set7Agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"agentId" varchar(64) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"agentType" text NOT NULL,
	"phase" varchar(20),
	"hookType" text,
	"defaultModel" varchar(50) DEFAULT 'gpt-4o' NOT NULL,
	"allowedModels" text,
	"maxTokensPerRequest" integer DEFAULT 4000 NOT NULL,
	"maxTokensPerDay" integer DEFAULT 100000 NOT NULL,
	"permissions" text,
	"canReadFiles" integer DEFAULT 0 NOT NULL,
	"canWriteFiles" integer DEFAULT 0 NOT NULL,
	"canExecuteCode" integer DEFAULT 0 NOT NULL,
	"canAccessNetwork" integer DEFAULT 0 NOT NULL,
	"canAccessDatabase" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"killSwitchTriggered" integer DEFAULT 0 NOT NULL,
	"killSwitchReason" text,
	"killSwitchAt" bigint,
	"totalTasksExecuted" integer DEFAULT 0 NOT NULL,
	"totalTokensUsed" integer DEFAULT 0 NOT NULL,
	"totalCostUsd" integer DEFAULT 0 NOT NULL,
	"avgExecutionTimeMs" integer DEFAULT 0 NOT NULL,
	"successRate" integer DEFAULT 100 NOT NULL,
	"lastActiveAt" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "set7Agents_agentId_unique" UNIQUE("agentId")
);
--> statement-breakpoint
CREATE TABLE "set7AuditLog" (
	"id" serial PRIMARY KEY NOT NULL,
	"auditId" varchar(64) NOT NULL,
	"eventType" text NOT NULL,
	"phase" varchar(20),
	"agentId" varchar(64),
	"taskId" varchar(64),
	"gateId" varchar(64),
	"integrationId" varchar(64),
	"description" text NOT NULL,
	"details" text,
	"userId" integer,
	"userName" varchar(255),
	"severity" text DEFAULT 'info' NOT NULL,
	"createdAt" bigint NOT NULL,
	CONSTRAINT "set7AuditLog_auditId_unique" UNIQUE("auditId")
);
--> statement-breakpoint
CREATE TABLE "set7Gates" (
	"id" serial PRIMARY KEY NOT NULL,
	"gateId" varchar(64) NOT NULL,
	"phase" varchar(20) NOT NULL,
	"gateName" varchar(255) NOT NULL,
	"description" text,
	"mode" text DEFAULT 'standard' NOT NULL,
	"checklistItems" text,
	"requiredItems" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"evidences" text,
	"mitigationPlan" text,
	"mitigationDeadline" integer,
	"mitigationApprovedBy" integer,
	"approvedBy" integer,
	"approvedAt" bigint,
	"humanApprovalRequired" integer DEFAULT 0 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "set7Gates_gateId_unique" UNIQUE("gateId")
);
--> statement-breakpoint
CREATE TABLE "set7Integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"integrationId" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"integrationType" text NOT NULL,
	"contractVersion" varchar(20) NOT NULL,
	"contractSchema" text,
	"endpointUrl" varchar(500),
	"httpMethod" varchar(10),
	"identityHash" varchar(64) NOT NULL,
	"previousHash" varchar(64),
	"qrCodeData" text,
	"qrCodeUrl" varchar(500),
	"verificationStatus" text DEFAULT 'pending' NOT NULL,
	"lastVerifiedAt" bigint,
	"verificationCount" integer DEFAULT 0 NOT NULL,
	"config" text,
	"headers" text,
	"authentication" text,
	"status" text DEFAULT 'active' NOT NULL,
	"totalCalls" integer DEFAULT 0 NOT NULL,
	"successfulCalls" integer DEFAULT 0 NOT NULL,
	"failedCalls" integer DEFAULT 0 NOT NULL,
	"avgResponseTimeMs" integer DEFAULT 0 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "set7Integrations_integrationId_unique" UNIQUE("integrationId")
);
--> statement-breakpoint
CREATE TABLE "set7Nfrs" (
	"id" serial PRIMARY KEY NOT NULL,
	"nfrId" varchar(64) NOT NULL,
	"projectId" varchar(64),
	"phase" varchar(20),
	"dimension" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" text DEFAULT 'P1' NOT NULL,
	"measurementCriteria" text,
	"targetValue" varchar(100),
	"currentValue" varchar(100),
	"status" text DEFAULT 'not_started' NOT NULL,
	"evidences" text,
	"ownerId" integer,
	"ownerName" varchar(255),
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "set7Nfrs_nfrId_unique" UNIQUE("nfrId")
);
--> statement-breakpoint
CREATE TABLE "set7RoiTracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"trackingId" varchar(64) NOT NULL,
	"roiType" text NOT NULL,
	"phase" varchar(20),
	"plannedCostUsd" integer DEFAULT 0 NOT NULL,
	"actualCostUsd" integer DEFAULT 0 NOT NULL,
	"plannedTokens" integer DEFAULT 0 NOT NULL,
	"actualTokens" integer DEFAULT 0 NOT NULL,
	"plannedHours" integer DEFAULT 0 NOT NULL,
	"actualHours" integer DEFAULT 0 NOT NULL,
	"plannedValueUsd" integer DEFAULT 0 NOT NULL,
	"actualValueUsd" integer DEFAULT 0 NOT NULL,
	"roiPercentage" integer DEFAULT 0 NOT NULL,
	"roiRatio" varchar(20),
	"assumptions" text,
	"deviations" text,
	"deviationAnalysis" text,
	"documentUrl" varchar(500),
	"documentHash" varchar(64),
	"calculatedAt" bigint NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "set7RoiTracking_trackingId_unique" UNIQUE("trackingId")
);
--> statement-breakpoint
CREATE TABLE "set7RuntimeConfig" (
	"id" serial PRIMARY KEY NOT NULL,
	"configId" varchar(64) NOT NULL,
	"mode" text DEFAULT 'standard' NOT NULL,
	"hooksEnabled" text,
	"hookRoiEnabled" integer DEFAULT 1 NOT NULL,
	"hookTokensEnabled" integer DEFAULT 1 NOT NULL,
	"hookQualityEnabled" integer DEFAULT 1 NOT NULL,
	"hookSecurityEnabled" integer DEFAULT 1 NOT NULL,
	"hookGtlEnabled" integer DEFAULT 1 NOT NULL,
	"hookFrequency" text DEFAULT 'per_phase' NOT NULL,
	"gtlType" text DEFAULT 'saas' NOT NULL,
	"gtlPlans" text,
	"defaultTokenBudget" integer DEFAULT 100000 NOT NULL,
	"modelRouting" text,
	"gateProfile" text,
	"humanApprovalPhases" text,
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "set7RuntimeConfig_configId_unique" UNIQUE("configId")
);
--> statement-breakpoint
CREATE TABLE "set7Tasklog" (
	"id" serial PRIMARY KEY NOT NULL,
	"taskId" varchar(64) NOT NULL,
	"phase" varchar(20) NOT NULL,
	"taskType" text NOT NULL,
	"taskName" varchar(255) NOT NULL,
	"description" text,
	"agentId" varchar(64) NOT NULL,
	"agentType" text NOT NULL,
	"agentName" varchar(100) NOT NULL,
	"taxonomyBase" varchar(10),
	"taxonomySubbase" varchar(20),
	"taxonomyTags" text,
	"tokensInput" integer DEFAULT 0 NOT NULL,
	"tokensOutput" integer DEFAULT 0 NOT NULL,
	"tokensTotal" integer DEFAULT 0 NOT NULL,
	"modelUsed" varchar(50),
	"executionTimeMs" integer DEFAULT 0 NOT NULL,
	"costUsd" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"result" text,
	"errorMessage" text,
	"outputArtifacts" text,
	"gateId" varchar(64),
	"gateStatus" text,
	"startedAt" bigint,
	"completedAt" bigint,
	"createdAt" bigint NOT NULL,
	CONSTRAINT "set7Tasklog_taskId_unique" UNIQUE("taskId")
);
--> statement-breakpoint
CREATE TABLE "set7TokenBudgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"budgetId" varchar(64) NOT NULL,
	"scope" text NOT NULL,
	"scopeId" varchar(64) NOT NULL,
	"scopeName" varchar(255) NOT NULL,
	"budgetTokens" integer NOT NULL,
	"budgetUsd" integer NOT NULL,
	"warningThreshold" integer DEFAULT 80 NOT NULL,
	"criticalThreshold" integer DEFAULT 95 NOT NULL,
	"usedTokens" integer DEFAULT 0 NOT NULL,
	"usedUsd" integer DEFAULT 0 NOT NULL,
	"periodType" text DEFAULT 'monthly' NOT NULL,
	"periodStart" integer,
	"periodEnd" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"circuitBreakerTriggered" integer DEFAULT 0 NOT NULL,
	"circuitBreakerAt" bigint,
	"circuitBreakerReason" text,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "set7TokenBudgets_budgetId_unique" UNIQUE("budgetId")
);
--> statement-breakpoint
CREATE TABLE "siteMetrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metricType" varchar(50) NOT NULL,
	"metricValue" integer NOT NULL,
	"metricDate" integer NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "socialProofMetrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(50) NOT NULL,
	"value" varchar(50) NOT NULL,
	"label" varchar(255) NOT NULL,
	"labelEn" varchar(255),
	"labelEs" varchar(255),
	"icon" varchar(50),
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "socialProofMetrics_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "supportTickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticketNumber" varchar(20) NOT NULL,
	"userId" integer,
	"userName" varchar(255),
	"userEmail" varchar(320) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"assignedToId" integer,
	"assignedToName" varchar(255),
	"resolution" text,
	"resolvedAt" bigint,
	"attachments" text,
	"tags" text,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	"firstResponseAt" bigint,
	CONSTRAINT "supportTickets_ticketNumber_unique" UNIQUE("ticketNumber")
);
--> statement-breakpoint
CREATE TABLE "systemSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"description" varchar(255),
	"category" text DEFAULT 'general' NOT NULL,
	"valueType" text DEFAULT 'string' NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "systemSettings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"company" varchar(255) NOT NULL,
	"sector" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"imageUrl" varchar(500),
	"videoUrl" varchar(500),
	"metrics" text,
	"isActive" integer DEFAULT 1 NOT NULL,
	"isFeatured" integer DEFAULT 0 NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"language" varchar(5) DEFAULT 'pt' NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticketMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticketId" integer NOT NULL,
	"senderId" integer,
	"senderName" varchar(255) NOT NULL,
	"senderEmail" varchar(320),
	"isStaff" integer DEFAULT 0 NOT NULL,
	"message" text NOT NULL,
	"attachments" text,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokenTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tokenId" integer NOT NULL,
	"transactionType" text NOT NULL,
	"fromUserId" integer,
	"toUserId" integer,
	"amount" integer DEFAULT 1 NOT NULL,
	"transactionHash" varchar(64) NOT NULL,
	"previousTransactionHash" varchar(64),
	"metadata" text,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokenUsageLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"tokenId" integer NOT NULL,
	"userId" integer NOT NULL,
	"endpoint" varchar(255) NOT NULL,
	"method" varchar(10) NOT NULL,
	"statusCode" integer,
	"responseTime" integer,
	"ipAddress" varchar(45),
	"userAgent" varchar(500),
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "twoFactorAuth" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"secret" varchar(255) NOT NULL,
	"isEnabled" integer DEFAULT 0 NOT NULL,
	"isVerified" integer DEFAULT 0 NOT NULL,
	"backupCodes" text,
	"backupCodesUsed" integer DEFAULT 0 NOT NULL,
	"recoveryEmail" varchar(320),
	"recoveryPhone" varchar(20),
	"lastUsedAt" bigint,
	"failedAttempts" integer DEFAULT 0 NOT NULL,
	"lockedUntil" integer,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "twoFactorAuth_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "twoFactorSessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"sessionToken" varchar(64) NOT NULL,
	"isVerified" integer DEFAULT 0 NOT NULL,
	"verifiedAt" bigint,
	"expiresAt" bigint NOT NULL,
	"ipAddress" varchar(45),
	"userAgent" varchar(500),
	"createdAt" bigint NOT NULL,
	CONSTRAINT "twoFactorSessions_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "userAccessTokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"tokenHash" varchar(64) NOT NULL,
	"tokenPrefix" varchar(12) NOT NULL,
	"scopes" text,
	"rateLimit" integer DEFAULT 1000 NOT NULL,
	"rateLimitRemaining" integer DEFAULT 1000 NOT NULL,
	"rateLimitResetAt" bigint,
	"lastUsedAt" bigint,
	"usageCount" integer DEFAULT 0 NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"expiresAt" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userBadges" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"badgeId" integer NOT NULL,
	"earnedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userPoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"totalInteractions" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"lastInteractionAt" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userPreferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"language" varchar(10) DEFAULT 'pt' NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"timezone" varchar(50) DEFAULT 'America/Sao_Paulo' NOT NULL,
	"emailNotifications" integer DEFAULT 1 NOT NULL,
	"pushNotifications" integer DEFAULT 1 NOT NULL,
	"weeklyDigest" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "userPreferences_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "userRoles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"roleId" integer NOT NULL,
	"assignedAt" bigint NOT NULL,
	CONSTRAINT "userRoles_user_role_uq" UNIQUE("userId","roleId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" varchar(320),
	"passwordHash" varchar(255),
	"loginMethod" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"stripeCustomerId" varchar(255),
	"stripeSubscriptionId" varchar(255),
	"subscriptionStatus" text DEFAULT 'none',
	"planType" text DEFAULT 'free',
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	"lastSignedIn" bigint NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhookDeliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"webhookId" integer NOT NULL,
	"event" varchar(50) NOT NULL,
	"payload" text NOT NULL,
	"responseStatus" integer,
	"responseBody" text,
	"attempts" integer DEFAULT 1 NOT NULL,
	"nextRetryAt" bigint,
	"deliveredAt" bigint,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"url" varchar(500) NOT NULL,
	"secret" varchar(64) NOT NULL,
	"events" text NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "white_label_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"organizationId" varchar(255) NOT NULL,
	"platformName" varchar(255) DEFAULT 'IMPACT7' NOT NULL,
	"logoUrl" varchar(500),
	"faviconUrl" varchar(500),
	"primaryColor" varchar(7) DEFAULT '#ff6b35',
	"secondaryColor" varchar(7) DEFAULT '#004e89',
	"accentColor" varchar(7) DEFAULT '#f7931e',
	"fontFamily" varchar(100) DEFAULT 'Inter',
	"customDomain" varchar(255),
	"supportEmail" varchar(320),
	"supportPhone" varchar(20),
	"websiteUrl" varchar(500),
	"linkedinUrl" varchar(500),
	"twitterUrl" varchar(500),
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "white_label_config_organizationId_unique" UNIQUE("organizationId")
);
--> statement-breakpoint
CREATE TABLE "whitepaperDownloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"organization" varchar(255),
	"downloadedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagementEvents" (
	"id" serial PRIMARY KEY NOT NULL,
	"identityKey" varchar(128) NOT NULL,
	"initiativeId" integer NOT NULL,
	"signal" varchar(64) NOT NULL,
	"level" integer NOT NULL,
	"instrumented" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiatives" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"sector" varchar(128),
	"odsTags" text,
	"stageIve" varchar(32) DEFAULT 'origem' NOT NULL,
	"custeioMode" varchar(32) DEFAULT 'comercial' NOT NULL,
	"instrumented" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auditLog" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor" varchar(128) NOT NULL,
	"action" varchar(64) NOT NULL,
	"entity" varchar(64) NOT NULL,
	"entityId" integer,
	"inputJson" text,
	"resultJson" text,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiativeParams" (
	"id" serial PRIMARY KEY NOT NULL,
	"initiativeId" integer NOT NULL,
	"valorGatilhoCents" integer DEFAULT 3000 NOT NULL,
	"valorTransformacaoCents" integer DEFAULT 80000 NOT NULL,
	"atribuicaoBps" integer DEFAULT 6000 NOT NULL,
	"custoImtsCents" integer DEFAULT 0 NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agentUsage" (
	"id" serial PRIMARY KEY NOT NULL,
	"identityKey" varchar(128) NOT NULL,
	"dayBucket" integer NOT NULL,
	"usedSeconds" integer DEFAULT 0 NOT NULL,
	"tokensIn" integer DEFAULT 0 NOT NULL,
	"tokensOut" integer DEFAULT 0 NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(64) DEFAULT 'alianca' NOT NULL,
	"mode" varchar(32) DEFAULT 'social' NOT NULL,
	"brandTheme" varchar(64),
	"sponsorId" integer,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ee_initiative_idx" ON "engagementEvents" USING btree ("initiativeId");--> statement-breakpoint
CREATE INDEX "ee_identity_initiative_idx" ON "engagementEvents" USING btree ("identityKey","initiativeId");--> statement-breakpoint
CREATE INDEX "ip_initiative_idx" ON "initiativeParams" USING btree ("initiativeId");--> statement-breakpoint
CREATE INDEX "au_identity_day_idx" ON "agentUsage" USING btree ("identityKey","dayBucket");