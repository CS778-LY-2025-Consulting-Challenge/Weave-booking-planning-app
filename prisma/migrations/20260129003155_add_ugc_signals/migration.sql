-- CreateTable
CREATE TABLE "UGCSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "supportingCommentIds" TEXT NOT NULL,
    "confidenceScore" REAL NOT NULL DEFAULT 0.5,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "timeRelevance" TEXT,
    "firstReportedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" DATETIME NOT NULL,
    "activityName" TEXT,
    "dayIndex" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UGCSignal_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "CommunityTrip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UGCSignal_tripId_idx" ON "UGCSignal"("tripId");

-- CreateIndex
CREATE INDEX "UGCSignal_signalType_idx" ON "UGCSignal"("signalType");

-- CreateIndex
CREATE INDEX "UGCSignal_category_idx" ON "UGCSignal"("category");

-- CreateIndex
CREATE INDEX "UGCSignal_isActive_idx" ON "UGCSignal"("isActive");

-- CreateIndex
CREATE INDEX "UGCSignal_confidenceScore_idx" ON "UGCSignal"("confidenceScore");
