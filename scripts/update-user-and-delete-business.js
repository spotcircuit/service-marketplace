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

    console.log('Starting update process...\n');

    // First, get the user and business details
    const userResult = await sql`
      SELECT id, email, name, role, business_id 
      FROM users 
      WHERE email = 'james@nurho.tech'
    `;

    if (userResult.length === 0) {
      console.error('❌ User james@nurho.tech not found');
      process.exit(1);
    }

    const user = userResult[0];
    console.log('Found user:', user.email);
    console.log('Current role:', user.role);
    console.log('Business ID:', user.business_id);

    // Get business details before deletion
    if (user.business_id) {
      const businessResult = await sql`
        SELECT id, name, is_claimed 
        FROM businesses 
        WHERE id = ${user.business_id}
      `;
      
      if (businessResult.length > 0) {
        console.log('\nBusiness to delete:');
        console.log('  Name:', businessResult[0].name);
        console.log('  ID:', businessResult[0].id);
        console.log('  Claimed:', businessResult[0].is_claimed);
      }
    }

    // Update user to admin and remove business association
    await sql`
      UPDATE users
      SET 
        role = 'admin',
        business_id = NULL,
        company_name = NULL,
        updated_at = NOW()
      WHERE email = 'james@nurho.tech'
    `;
    console.log('\n✅ Updated james@nurho.tech to admin role');
    console.log('✅ Removed business association from user');

    // Delete the business if it exists
    if (user.business_id) {
      const deleteResult = await sql`
        DELETE FROM businesses 
        WHERE id = ${user.business_id}
        RETURNING name
      `;
      
      if (deleteResult.length > 0) {
        console.log(`✅ Deleted business: ${deleteResult[0].name}`);
      }
    }

    // Verify the changes
    console.log('\n--- Verification ---');
    const verifyUser = await sql`
      SELECT email, name, role, business_id, company_name 
      FROM users 
      WHERE email = 'james@nurho.tech'
    `;
    
    console.log('Updated user details:');
    console.log('  Email:', verifyUser[0].email);
    console.log('  Name:', verifyUser[0].name);
    console.log('  Role:', verifyUser[0].role);
    console.log('  Business ID:', verifyUser[0].business_id || 'None');
    console.log('  Company Name:', verifyUser[0].company_name || 'None');

    console.log('\n✅ All operations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();