-- ====================================================================
-- Run this in pgAdmin Query Tool FIRST (once only)
-- Creates the faceattend database if it doesn't exist
-- ====================================================================

-- Step 1: In pgAdmin, connect to default 'postgres' database
-- Step 2: Open Query Tool and run:

CREATE DATABASE faceattend
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Step 3: Then connect to 'faceattend' database and run all V1–V5 migration files
