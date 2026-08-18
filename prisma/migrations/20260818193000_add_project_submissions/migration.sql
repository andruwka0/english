ALTER TABLE "Project" ADD COLUMN "starterCode" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Project" ADD COLUMN "testCode" TEXT NOT NULL DEFAULT '';

CREATE TABLE "ProjectSubmission" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "code" TEXT NOT NULL,
    "output" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectSubmission_projectId_idx" ON "ProjectSubmission"("projectId");

ALTER TABLE "ProjectSubmission" ADD CONSTRAINT "ProjectSubmission_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
