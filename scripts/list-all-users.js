#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found in .env.local');
      process.exit(1);
    }

    const sql = neon(databaseUrl);

    // Query all users with their business associations
    const users = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.phone,
        u.business_id,
        u.company_name,
        u.email_verified,
        u.last_login_at,
        u.created_at,
        b.name as business_name,
        b.is_claimed as business_claimed
      FROM users u
      LEFT JOIN businesses b ON u.business_id = b.id
      ORDER BY u.created_at DESC
    `;

    console.log(`\nFound ${users.length} user(s) total:\n`);
    console.log('─'.repeat(100));
    
    // Group by role
    const byRole = {
      admin: [],
      business_owner: [],
      customer: [],
      other: []
    };
    
    users.forEach(user => {
      const role = user.role || 'customer';
      if (byRole[role]) {
        byRole[role].push(user);
      } else {
        byRole.other.push(user);
      }
    });

    // Display by role
    Object.entries(byRole).forEach(([role, roleUsers]) => {
      if (roleUsers.length > 0) {
        console.log(`\n${role.toUpperCase()} USERS (${roleUsers.length}):`);
        console.log('─'.repeat(100));
        
        roleUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.email}`);
          console.log(`   Name: ${user.name || '(not set)'}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   ID: ${user.id}`);
          if (user.business_id) {
            console.log(`   Business ID: ${user.business_id}`);
            console.log(`   Business Name: ${user.business_name || '(not found)'}`);
            console.log(`   Business Claimed: ${user.business_claimed ? 'Yes' : 'No'}`);
          }
          if (user.company_name) {
            console.log(`   Company Name: ${user.company_name}`);
          }
          console.log(`   Verified: ${user.email_verified ? 'Yes' : 'No'}`);
          console.log(`   Last Login: ${user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}`);
          console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
          console.log('');
        });
      }
    });

    console.log('─'.repeat(100));

    process.exit(0);
  } catch (err) {
    console.error('❌ Error querying users:', err);
    process.exit(1);
  }
})();