-- Fix Missing Columns in Existing Tables
-- This script adds only the missing columns without dropping any data

-- Fix testimonials table (missing: name, role, company, sector, content, rating, imageUrl, videoUrl, metrics)
ALTER TABLE testimonials 
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS `role` VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS `company` VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS `sector` VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS `content` TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS `rating` INT NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS `imageUrl` VARCHAR(500),
  ADD COLUMN IF NOT EXISTS `videoUrl` VARCHAR(500),
  ADD COLUMN IF NOT EXISTS `metrics` TEXT;

-- Fix socialProofMetrics table (missing: metrickey, category)
ALTER TABLE socialProofMetrics
  ADD COLUMN IF NOT EXISTS `metrickey` VARCHAR(100),
  ADD COLUMN IF NOT EXISTS `category` VARCHAR(50);

-- Fix caseStudies or calculations table (missing: organization)
-- Need to check which table has 'sroi' column
ALTER TABLE calculations
  ADD COLUMN IF NOT EXISTS `organization` VARCHAR(255);

-- Verify changes
SELECT 'testimonials columns:' as info;
SHOW COLUMNS FROM testimonials;

SELECT 'socialProofMetrics columns:' as info;
SHOW COLUMNS FROM socialProofMetrics;

SELECT 'calculations columns:' as info;
SHOW COLUMNS FROM calculations;
