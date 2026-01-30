/*
  Warnings:

  - You are about to drop the column `activityName` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `confidenceScore` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `dayIndex` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `firstReportedAt` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `helpfulCount` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `isPinned` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdatedAt` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `sampleSize` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `supportingCommentIds` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `timeRelevance` on the `UGCSignal` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `UGCSignal` table. All the data in the column will be lost.
  - Added the required column `commentIds` to the `UGCSignal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `UGCSignal` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UGCSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "actionable" TEXT,
    "confidence" REAL NOT NULL DEFAULT 0.8,
    "commentCount" INTEGER NOT NULL DEFAULT 1,
    "commentIds" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "impactArea" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reviewedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UGCSignal_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "CommunityTrip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UGCSignal" ("category", "createdAt", "id", "isActive", "signalType", "title", "tripId", "updatedAt") SELECT "category", "createdAt", "id", "isActive", "signalType", "title", "tripId", "updatedAt" FROM "UGCSignal";
DROP TABLE "UGCSignal";
ALTER TABLE "new_UGCSignal" RENAME TO "UGCSignal";
CREATE INDEX "UGCSignal_tripId_idx" ON "UGCSignal"("tripId");
CREATE INDEX "UGCSignal_signalType_idx" ON "UGCSignal"("signalType");
CREATE INDEX "UGCSignal_category_idx" ON "UGCSignal"("category");
CREATE INDEX "UGCSignal_priority_idx" ON "UGCSignal"("priority");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
