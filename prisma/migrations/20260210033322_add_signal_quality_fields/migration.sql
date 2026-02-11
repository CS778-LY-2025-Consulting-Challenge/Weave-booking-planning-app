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
    "actionabilityScore" REAL NOT NULL DEFAULT 0.5,
    "qualityTier" TEXT NOT NULL DEFAULT 'standard',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "impactArea" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reviewedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UGCSignal_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "CommunityTrip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UGCSignal" ("actionable", "category", "commentCount", "commentIds", "confidence", "content", "createdAt", "id", "impactArea", "isActive", "priority", "reviewedBy", "signalType", "title", "tripId", "updatedAt") SELECT "actionable", "category", "commentCount", "commentIds", "confidence", "content", "createdAt", "id", "impactArea", "isActive", "priority", "reviewedBy", "signalType", "title", "tripId", "updatedAt" FROM "UGCSignal";
DROP TABLE "UGCSignal";
ALTER TABLE "new_UGCSignal" RENAME TO "UGCSignal";
CREATE INDEX "UGCSignal_tripId_idx" ON "UGCSignal"("tripId");
CREATE INDEX "UGCSignal_signalType_idx" ON "UGCSignal"("signalType");
CREATE INDEX "UGCSignal_category_idx" ON "UGCSignal"("category");
CREATE INDEX "UGCSignal_priority_idx" ON "UGCSignal"("priority");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
