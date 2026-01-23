-- CreateTable
CREATE TABLE "SavedTrip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "plannerState" TEXT NOT NULL,
    "chatHistory" TEXT NOT NULL,
    "transportation" TEXT,
    "accommodation" TEXT,
    "safetyAlert" TEXT,
    "thingsToKnow" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "SavedTrip_userId_idx" ON "SavedTrip"("userId");
