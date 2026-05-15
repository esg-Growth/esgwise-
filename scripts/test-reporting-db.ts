import { getCompanyScore, getCompanyById } from '../src/lib/db';

async function testReportingDB() {
  process.env.USE_LOCAL_DB = 'true';
  const companyId = 'demo_company';
  
  console.log('Testing getCompanyById (Valid ID)...');
  const company = await getCompanyById(companyId);
  console.log('Company:', company);
  
  console.log('\nTesting getCompanyScore (Valid ID)...');
  const score = await getCompanyScore(companyId);
  console.log('Score:', score);
  
  if (company && score) {
    console.log('\n✅ Integration test passed! Data retrieved from SQLite correctly.');
  } else {
    console.log('\n❌ Integration test failed! Missing data.');
  }

  // Edge Case: Invalid Company ID
  const invalidCompanyId = 'non_existent_company_123';
  console.log(`\nTesting getCompanyScore with Invalid ID (${invalidCompanyId})...`);
  const missingScore = await getCompanyScore(invalidCompanyId);
  console.log('Missing Score:', missingScore);

  if (missingScore === null || missingScore === undefined) {
    console.log('\n✅ Edge case test passed! Missing score returned gracefully.');
  } else {
    console.log('\n❌ Edge case test failed! Unexpected data returned for missing score.');
  }
}

testReportingDB().catch(console.error);
