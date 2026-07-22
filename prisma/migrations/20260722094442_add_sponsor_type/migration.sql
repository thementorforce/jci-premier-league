-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdPlacement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "contact" TEXT NOT NULL DEFAULT '',
    "position" TEXT NOT NULL,
    "sponsorType" TEXT NOT NULL DEFAULT 'General',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AdPlacement" ("active", "contact", "createdAt", "id", "imageUrl", "position", "targetUrl", "title") SELECT "active", "contact", "createdAt", "id", "imageUrl", "position", "targetUrl", "title" FROM "AdPlacement";
DROP TABLE "AdPlacement";
ALTER TABLE "new_AdPlacement" RENAME TO "AdPlacement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
