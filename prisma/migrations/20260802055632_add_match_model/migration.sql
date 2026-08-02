-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchNumber" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "venue" TEXT NOT NULL,
    "team1Id" TEXT NOT NULL,
    "team2Id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "result" TEXT,
    "winnerId" TEXT,
    "tossWinnerId" TEXT,
    "tossDecision" TEXT,
    "team1Score" TEXT,
    "team2Score" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Match_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "matches" INTEGER NOT NULL DEFAULT 0,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "fours" INTEGER NOT NULL DEFAULT 0,
    "ballsFaced" INTEGER NOT NULL DEFAULT 0,
    "oversBowled" REAL NOT NULL DEFAULT 0,
    "runsConceded" INTEGER NOT NULL DEFAULT 0,
    "momAwards" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PlayerStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlayerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "jerseySize" TEXT NOT NULL,
    "preferredRole" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Registered',
    "soldPrice" INTEGER,
    "teamId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
    "transactionId" TEXT,
    "paymentScreenshot" TEXT,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "isViceCaptain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerProfile_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlayerProfile" ("ageGroup", "createdAt", "email", "experience", "fullName", "gender", "id", "jerseySize", "mobileNumber", "organization", "paymentScreenshot", "paymentStatus", "photoUrl", "preferredRole", "soldPrice", "status", "teamId", "transactionId", "updatedAt") SELECT "ageGroup", "createdAt", "email", "experience", "fullName", "gender", "id", "jerseySize", "mobileNumber", "organization", "paymentScreenshot", "paymentStatus", "photoUrl", "preferredRole", "soldPrice", "status", "teamId", "transactionId", "updatedAt" FROM "PlayerProfile";
DROP TABLE "PlayerProfile";
ALTER TABLE "new_PlayerProfile" RENAME TO "PlayerProfile";
CREATE INDEX "PlayerProfile_status_idx" ON "PlayerProfile"("status");
CREATE INDEX "PlayerProfile_paymentStatus_idx" ON "PlayerProfile"("paymentStatus");
CREATE INDEX "PlayerProfile_teamId_idx" ON "PlayerProfile"("teamId");
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerContact" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "pointsPurse" INTEGER NOT NULL DEFAULT 100000,
    "pointsSpent" INTEGER NOT NULL DEFAULT 0,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "nrr" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Team" ("createdAt", "id", "logoUrl", "name", "ownerContact", "ownerName", "pointsPurse", "pointsSpent") SELECT "createdAt", "id", "logoUrl", "name", "ownerContact", "ownerName", "pointsPurse", "pointsSpent" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStats_playerId_key" ON "PlayerStats"("playerId");

-- CreateIndex
CREATE INDEX "BidHistory_playerId_idx" ON "BidHistory"("playerId");

-- CreateIndex
CREATE INDEX "BidHistory_teamId_idx" ON "BidHistory"("teamId");
