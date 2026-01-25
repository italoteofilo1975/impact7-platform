CREATE TABLE `permissions` (
	`id` int NOT NULL,
	`code` varchar(100) NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` text,
	`category` varchar(50) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` int NOT NULL,
	`updatedAt` int NOT NULL,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `rolePermissions` (
	`id` int NOT NULL,
	`roleId` int NOT NULL,
	`permissionId` int NOT NULL,
	`assignedAt` int NOT NULL,
	CONSTRAINT `rolePermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`level` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` int NOT NULL,
	`updatedAt` int NOT NULL,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `userRoles` (
	`id` int NOT NULL,
	`userId` int NOT NULL,
	`roleId` int NOT NULL,
	`assignedAt` int NOT NULL,
	CONSTRAINT `userRoles_id` PRIMARY KEY(`id`)
);
