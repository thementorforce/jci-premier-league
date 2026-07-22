-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerContact" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "pointsPurse" INTEGER NOT NULL DEFAULT 100000,
    "pointsSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Team" ("createdAt", "id", "logoUrl", "name", "ownerName", "pointsPurse", "pointsSpent") SELECT "createdAt", "id", "logoUrl", "name", "ownerName", "pointsPurse", "pointsSpent" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
