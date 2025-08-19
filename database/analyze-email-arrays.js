#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function analyzeEmails() {
  console.log('📧 ANALYZING EMAIL DATA STRUCTURE\n');
  
  const importDir = 'imports';
  const files = fs.readdirSync(importDir).filter(f => f.endsWith('.json'));
  
  const emailAnalysis = {
    totalRecords: 0,
    withSingleEmail: 0,
    withEmailArray: 0,
    withMultipleEmails: 0,
    emailFields: new Set(),
    examples: []
  };
  
  for (const file of files) {
    console.log(`\n📁 Analyzing: ${file}`);
    
    try {
      let content = fs.readFileSync(path.join(importDir, file), 'utf8');
      content = content.replace(/:\s*NaN/g, ': null');
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) continue;
      
      let fileStats = {
        single: 0,
        array: 0,
        multiple: 0
      };
      
      data.forEach(record => {
        emailAnalysis.totalRecords++;
        
        // Check various email fields
        const emailFields = ['email', 'emails', 'owner_email', 'generic_company_emails', 'company_emails'];
        
        for (const field of emailFields) {
          if (record[field]) {
            emailAnalysis.emailFields.add(field);
            
            if (Array.isArray(record[field])) {
              fileStats.array++;
              emailAnalysis.withEmailArray++;
              
              if (record[field].length > 1) {
                fileStats.multiple++;
                emailAnalysis.withMultipleEmails++;
                
                // Capture examples
                if (emailAnalysis.examples.length < 5) {
                  emailAnalysis.examples.push({
                    file: file,
                    name: record.name,
                    field: field,
                    emails: record[field]
                  });
                }
              }
            } else if (typeof record[field] === 'string' && record[field].includes('@')) {
              fileStats.single++;
              emailAnalysis.withSingleEmail++;
              
              // Check if it's multiple emails in a string
              if (record[field].includes(',') || record[field].includes(';')) {
                emailAnalysis.withMultipleEmails++;
                
                if (emailAnalysis.examples.length < 5) {
                  emailAnalysis.examples.push({
                    file: file,
                    name: record.name,
                    field: field,
                    emails: record[field].split(/[,;]/).map(e => e.trim())
                  });
                }
              }
            }
            
            break; // Only count once per record
          }
        }
      });
      
      console.log(`  Single emails: ${fileStats.single}`);
      console.log(`  Array emails: ${fileStats.array}`);
      console.log(`  Multiple emails: ${fileStats.multiple}`);
      
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
  }
  
  console.log('\n📊 OVERALL SUMMARY');
  console.log('==================');
  console.log(`Total records analyzed: ${emailAnalysis.totalRecords}`);
  console.log(`Records with single email: ${emailAnalysis.withSingleEmail}`);
  console.log(`Records with email array: ${emailAnalysis.withEmailArray}`);
  console.log(`Records with multiple emails: ${emailAnalysis.withMultipleEmails}`);
  console.log(`\nEmail field names found: ${Array.from(emailAnalysis.emailFields).join(', ')}`);
  
  if (emailAnalysis.examples.length > 0) {
    console.log('\n📋 EXAMPLES OF MULTIPLE EMAILS:');
    emailAnalysis.examples.forEach((ex, i) => {
      console.log(`\n${i + 1}. ${ex.name} (${ex.file})`);
      console.log(`   Field: ${ex.field}`);
      console.log(`   Emails:`);
      if (Array.isArray(ex.emails)) {
        ex.emails.forEach(email => console.log(`     - ${email}`));
      } else {
        console.log(`     - ${ex.emails}`);
      }
    });
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. Add a separate business_emails table for many-to-one relationship');
  console.log('2. Store primary email in businesses.email');
  console.log('3. Store additional emails in business_emails table');
  console.log('4. Update import to handle multiple emails properly');
}

analyzeEmails();