#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function resetClaimsAndUsers() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('🔄 RESET CLAIMS AND DELETE USERS');
  console.log('==================================\n');
  
  try {
    // First, check current status
    console.log('📊 Current Status:');
    const currentStatus = await sql`
      SELECT 
        (SELECT COUNT(*) FROM businesses WHERE is_claimed = true) as claimed_businesses,
        (SELECT COUNT(*) FROM businesses WHERE is_verified = true) as verified_businesses,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'business') as business_users,
        (SELECT COUNT(*) FROM users WHERE role = 'customer' OR role IS NULL) as consumer_users
    `;
    
    const status = currentStatus[0];
    console.log(`  Claimed businesses: ${status.claimed_businesses}`);
    console.log(`  Verified businesses: ${status.verified_businesses}`);
    console.log(`  Total users: ${status.total_users}`);
    console.log(`  Business accounts: ${status.business_users}`);
    console.log(`  Consumer accounts: ${status.consumer_users}\n`);
    
    // Step 1: Reset all businesses to unclaimed and unverified
    console.log('1️⃣ Resetting all businesses to unclaimed and unverified...');
    const businessReset = await sql`
      UPDATE businesses 
      SET 
        is_claimed = false,
        is_verified = false,
        owner_name = NULL,
        owner_email = NULL,
        owner_phone = NULL,
        updated_at = NOW()
      WHERE is_claimed = true OR is_verified = true
    `;
    console.log(`  ✓ Reset ${businessReset.count} businesses\n`);
    
    // Step 2: Delete all user accounts
    console.log('2️⃣ Deleting all user accounts...');
    
    // First check if there are any foreign key constraints we need to handle
    console.log('  Checking for related data...');
    
    // Delete any user sessions if table exists
    try {
      const sessionsDeleted = await sql`DELETE FROM sessions WHERE user_id IS NOT NULL`;
      console.log(`  ✓ Deleted ${sessionsDeleted.count} user sessions`);
    } catch (e) {
      console.log('  - No sessions table or already empty');
    }
    
    // Delete any user tokens if table exists
    try {
      const tokensDeleted = await sql`DELETE FROM user_tokens WHERE user_id IS NOT NULL`;
      console.log(`  ✓ Deleted ${tokensDeleted.count} user tokens`);
    } catch (e) {
      console.log('  - No user_tokens table or already empty');
    }
    
    // Update claim_campaigns to remove user references
    const campaignsUpdated = await sql`
      UPDATE claim_campaigns 
      SET claimed_by_user_id = NULL 
      WHERE claimed_by_user_id IS NOT NULL
    `;
    console.log(`  ✓ Cleared user references from ${campaignsUpdated.count} claim campaigns`);
    
    // Update quotes to remove customer references
    const quotesUpdated = await sql`
      UPDATE quotes 
      SET customer_id = NULL 
      WHERE customer_id IS NOT NULL
    `;
    console.log(`  ✓ Cleared customer references from ${quotesUpdated.count} quotes`);
    
    // Update site_configurations to remove user references
    try {
      const configUpdated = await sql`
        UPDATE site_configurations 
        SET updated_by = NULL 
        WHERE updated_by IS NOT NULL
      `;
      console.log(`  ✓ Cleared user references from ${configUpdated.count} site configurations`);
    } catch (e) {
      console.log('  - No site_configurations table or already cleared');
    }
    
    // Update any other tables that might reference users
    try {
      const leadsUpdated = await sql`
        UPDATE lead_assignments 
        SET dealer_id = NULL 
        WHERE dealer_id IS NOT NULL
      `;
      console.log(`  ✓ Cleared dealer references from ${leadsUpdated.count} lead assignments`);
    } catch (e) {
      console.log('  - No lead_assignments table or already cleared');
    }
    
    // Now delete all users
    const usersDeleted = await sql`DELETE FROM users`;
    console.log(`  ✓ Deleted ${usersDeleted.count} user accounts\n`);
    
    // Step 3: Show final status
    console.log('✅ Reset Complete!\n');
    console.log('📊 Final Status:');
    const finalStatus = await sql`
      SELECT 
        (SELECT COUNT(*) FROM businesses) as total_businesses,
        (SELECT COUNT(*) FROM businesses WHERE is_claimed = true) as claimed,
        (SELECT COUNT(*) FROM businesses WHERE is_verified = true) as verified,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM businesses WHERE email IS NOT NULL) as with_email
    `;
    
    const final = finalStatus[0];
    console.log(`  Total businesses: ${final.total_businesses}`);
    console.log(`  Claimed: ${final.claimed}`);
    console.log(`  Verified: ${final.verified}`);
    console.log(`  Users: ${final.users}`);
    console.log(`  Businesses with email: ${final.with_email}\n`);
    
    console.log('🎯 Summary:');
    console.log('  • All businesses are now unclaimed and unverified');
    console.log('  • All user accounts have been deleted');
    console.log('  • Owner information has been cleared from businesses');
    console.log('  • Ready for fresh imports and real claims\n');
    
  } catch (error) {
    console.error('❌ Error during reset:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the reset
resetClaimsAndUsers();