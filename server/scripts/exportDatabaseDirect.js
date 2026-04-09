// server/scripts/exportDatabaseDirect.js
// Direct MongoDB export using native driver

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matchmajor';
const exportDir = path.resolve(__dirname, '../../database-exports');

if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

async function exportDatabase() {
  let client;
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI, { 
      maxPoolSize: 10,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000
    });

    await client.connect();
    console.log('✅ Connected to MongoDB!\n');

    const db = client.db();
    const collections = ['users', 'products', 'orders', 'carts'];
    const summary = {
      exportDate: new Date().toISOString(),
      database: MONGODB_URI,
      collections: {},
      files: {}
    };

    let totalDocs = 0;

    for (const collName of collections) {
      console.log(`📥 Exporting ${collName}...`);
      
      const collection = db.collection(collName);
      const docs = await collection.find({}).toArray();
      
      const fileName = `${collName}.json`;
      const filePath = path.join(exportDir, fileName);
      
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
      
      console.log(`✅ ${collName} exported: ${docs.length} documents`);
      console.log(`   File: ${filePath}\n`);
      
      summary.collections[collName] = docs.length;
      summary.files[collName] = fileName;
      totalDocs += docs.length;
    }

    summary.total = totalDocs;

    const summaryFile = path.join(exportDir, 'EXPORT_SUMMARY.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    console.log('═══════════════════════════════════════');
    console.log('📊 EXPORT SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Users:    ${summary.collections.users || 0}`);
    console.log(`Products: ${summary.collections.products || 0}`);
    console.log(`Orders:   ${summary.collections.orders || 0}`);
    console.log(`Carts:    ${summary.collections.carts || 0}`);
    console.log(`─────────────────────────────────────`);
    console.log(`TOTAL:    ${totalDocs} documents`);
    console.log(`Export Date: ${new Date().toLocaleString()}`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('✅ All data exported successfully!');
    console.log(`📁 Location: ${exportDir}\n`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

exportDatabase();
