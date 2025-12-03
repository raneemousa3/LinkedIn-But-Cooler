-- Migration SQL for evra
-- Run this in Supabase SQL Editor
-- This creates all necessary tables with safe foreign key constraints

-- 1. Create Likes table
CREATE TABLE IF NOT EXISTS "Like" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- 2. Create Comments table
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- 3. Create Bookmarks table
CREATE TABLE IF NOT EXISTS "Bookmark" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- 4. Create MoodBoard table
CREATE TABLE IF NOT EXISTS "MoodBoard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MoodBoard_pkey" PRIMARY KEY ("id")
);

-- 5. Create MoodBoardItem table
CREATE TABLE IF NOT EXISTS "MoodBoardItem" (
    "id" TEXT NOT NULL,
    "moodBoardId" TEXT NOT NULL,
    "postId" TEXT,
    "portfolioItemId" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MoodBoardItem_pkey" PRIMARY KEY ("id")
);

-- 6. Create Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT,
    "postId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints (with error handling for existing constraints)
DO $$
BEGIN
    -- Like foreign keys
    BEGIN
        ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" 
        FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
        NULL;
    END;
    
    BEGIN
        ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    -- Comment foreign keys
    BEGIN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" 
        FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    -- Bookmark foreign keys
    BEGIN
        ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_postId_fkey" 
        FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    -- MoodBoard foreign keys
    BEGIN
        ALTER TABLE "MoodBoard" ADD CONSTRAINT "MoodBoard_ownerId_fkey" 
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    -- MoodBoardItem foreign keys
    BEGIN
        ALTER TABLE "MoodBoardItem" ADD CONSTRAINT "MoodBoardItem_moodBoardId_fkey" 
        FOREIGN KEY ("moodBoardId") REFERENCES "MoodBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    -- Notification foreign keys
    BEGIN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" 
        FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" 
        FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- Add unique constraints (skip if already exists)
-- Note: If you get an error that these already exist, you can safely skip this section
DO $$
BEGIN
    -- For Like table - check if constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Like_postId_userId_key'
        UNION
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = 'Like_postId_userId_key'
    ) THEN
        BEGIN
            CREATE UNIQUE INDEX "Like_postId_userId_key" ON "Like"("postId", "userId");
        EXCEPTION WHEN duplicate_table THEN
            -- Index already exists, skip
            NULL;
        END;
    END IF;
    
    -- For Bookmark table - check if constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Bookmark_postId_userId_key'
        UNION
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = 'Bookmark_postId_userId_key'
    ) THEN
        BEGIN
            CREATE UNIQUE INDEX "Bookmark_postId_userId_key" ON "Bookmark"("postId", "userId");
        EXCEPTION WHEN duplicate_table THEN
            -- Index already exists, skip
            NULL;
        END;
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "Like_postId_idx" ON "Like"("postId");
CREATE INDEX IF NOT EXISTS "Like_userId_idx" ON "Like"("userId");

CREATE INDEX IF NOT EXISTS "Comment_postId_idx" ON "Comment"("postId");
CREATE INDEX IF NOT EXISTS "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX IF NOT EXISTS "Comment_createdAt_idx" ON "Comment"("createdAt");

CREATE INDEX IF NOT EXISTS "Bookmark_postId_idx" ON "Bookmark"("postId");
CREATE INDEX IF NOT EXISTS "Bookmark_userId_idx" ON "Bookmark"("userId");

CREATE INDEX IF NOT EXISTS "MoodBoard_ownerId_idx" ON "MoodBoard"("ownerId");
CREATE INDEX IF NOT EXISTS "MoodBoard_createdAt_idx" ON "MoodBoard"("createdAt");

CREATE INDEX IF NOT EXISTS "MoodBoardItem_moodBoardId_idx" ON "MoodBoardItem"("moodBoardId");

CREATE INDEX IF NOT EXISTS "Notification_recipientId_idx" ON "Notification"("recipientId");
CREATE INDEX IF NOT EXISTS "Notification_read_idx" ON "Notification"("read");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");

-- 7. Create Service table
CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceRange" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- 8. Create ServiceRequest table
CREATE TABLE IF NOT EXISTS "ServiceRequest" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "agreedPrice" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- 9. Create Transaction table
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints for Service tables
DO $$
BEGIN
    -- Service foreign keys
    BEGIN
        ALTER TABLE "Service" ADD CONSTRAINT "Service_providerId_fkey" 
        FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    -- ServiceRequest foreign keys
    BEGIN
        ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_serviceId_fkey" 
        FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_clientId_fkey" 
        FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_providerId_fkey" 
        FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_transactionId_fkey" 
        FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    -- Transaction foreign keys
    BEGIN
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_requestId_fkey" 
        FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_providerId_fkey" 
        FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_clientId_fkey" 
        FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- Add unique constraints for Service tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ServiceRequest_transactionId_key'
        UNION
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = 'ServiceRequest_transactionId_key'
    ) THEN
        BEGIN
            CREATE UNIQUE INDEX "ServiceRequest_transactionId_key" ON "ServiceRequest"("transactionId");
        EXCEPTION WHEN duplicate_table THEN
            NULL;
        END;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Transaction_requestId_key'
        UNION
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = 'Transaction_requestId_key'
    ) THEN
        BEGIN
            CREATE UNIQUE INDEX "Transaction_requestId_key" ON "Transaction"("requestId");
        EXCEPTION WHEN duplicate_table THEN
            NULL;
        END;
    END IF;
END $$;

-- Add indexes for Service tables
CREATE INDEX IF NOT EXISTS "Service_providerId_idx" ON "Service"("providerId");
CREATE INDEX IF NOT EXISTS "Service_isActive_idx" ON "Service"("isActive");
CREATE INDEX IF NOT EXISTS "Service_category_idx" ON "Service"("category");

CREATE INDEX IF NOT EXISTS "ServiceRequest_serviceId_idx" ON "ServiceRequest"("serviceId");
CREATE INDEX IF NOT EXISTS "ServiceRequest_clientId_idx" ON "ServiceRequest"("clientId");
CREATE INDEX IF NOT EXISTS "ServiceRequest_providerId_idx" ON "ServiceRequest"("providerId");
CREATE INDEX IF NOT EXISTS "ServiceRequest_status_idx" ON "ServiceRequest"("status");

CREATE INDEX IF NOT EXISTS "Transaction_providerId_idx" ON "Transaction"("providerId");
CREATE INDEX IF NOT EXISTS "Transaction_clientId_idx" ON "Transaction"("clientId");
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON "Transaction"("status");

-- 10. Create JobApplication table
CREATE TABLE IF NOT EXISTS "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints for JobApplication
DO $$
BEGIN
    -- JobApplication foreign keys
    BEGIN
        ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" 
        FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_applicantId_fkey" 
        FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- Add unique constraint for JobApplication (one application per user per job)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'JobApplication_jobId_applicantId_key'
        UNION
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = 'JobApplication_jobId_applicantId_key'
    ) THEN
        BEGIN
            CREATE UNIQUE INDEX "JobApplication_jobId_applicantId_key" ON "JobApplication"("jobId", "applicantId");
        EXCEPTION WHEN duplicate_table THEN
            NULL;
        END;
    END IF;
END $$;

-- Add indexes for JobApplication
CREATE INDEX IF NOT EXISTS "JobApplication_jobId_idx" ON "JobApplication"("jobId");
CREATE INDEX IF NOT EXISTS "JobApplication_applicantId_idx" ON "JobApplication"("applicantId");
CREATE INDEX IF NOT EXISTS "JobApplication_status_idx" ON "JobApplication"("status");
