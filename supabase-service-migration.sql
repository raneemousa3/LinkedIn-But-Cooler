-- Migration SQL for Service, ServiceRequest, Transaction, and JobApplication tables
-- Run this in Supabase SQL Editor

-- 1. Create Service table
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

-- 2. Create ServiceRequest table
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

-- 3. Create Transaction table
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

-- 4. Create JobApplication table
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

    -- ServiceRequest foreign keys (excluding transactionId - handled after Transaction)
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

    -- Transaction foreign keys (must be created before ServiceRequest.transactionId FK)
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
    
    -- Now add ServiceRequest.transactionId FK (after Transaction table and its FKs exist)
    BEGIN
        ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_transactionId_fkey" 
        FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

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

-- Add unique constraints
DO $$
BEGIN
    -- ServiceRequest.transactionId unique constraint
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
    
    -- Transaction.requestId unique constraint
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
    
    -- JobApplication unique constraint (one application per user per job)
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

-- Add indexes for performance
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

CREATE INDEX IF NOT EXISTS "JobApplication_jobId_idx" ON "JobApplication"("jobId");
CREATE INDEX IF NOT EXISTS "JobApplication_applicantId_idx" ON "JobApplication"("applicantId");
CREATE INDEX IF NOT EXISTS "JobApplication_status_idx" ON "JobApplication"("status");

