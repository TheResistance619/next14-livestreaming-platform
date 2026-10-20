CREATE TABLE `PinnedMessage` (
    `id` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `senderName` VARCHAR(191) NOT NULL,
    `senderIdentity` VARCHAR(191) NOT NULL,
    `timestamp` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `streamId` VARCHAR(191) NOT NULL,

    INDEX `PinnedMessage_streamId_idx` (`streamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;