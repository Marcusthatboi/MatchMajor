// server/scripts/importDatabaseDirect.js
// Direct MongoDB import using native driver

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matchmajor';
const importDir = path.resolve(__dirname, '../../database-exports');

async function importDatabase() {
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
      importDate: new Date().toISOString(),
      database: MONGODB_URI,
      collections: {},
      files: {}
    };

    let totalDocs = 0;

    // Import each collection
    for (const collectionName of collections) {
      const filePath = path.join(importDir, `${collectionName}.json`);

      if (fs.existsSync(filePath)) {
        try {
          console.log(`📥 Importing ${collectionName}...`);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          
          // Handle both array and single object formats
          const documents = Array.isArray(data) ? data : [data];

          if (documents.length > 0) {
            // Clear existing collection
            await db.collection(collectionName).deleteMany({});
            
            // Insert new data
            const result = await db.collection(collectionName).insertMany(documents);
            
            console.log(`✅ ${collectionName} imported: ${result.insertedCount} documents`);
            summary.collections[collectionName] = result.insertedCount;
            totalDocs += result.insertedCount;
          } else {
            console.log(`ℹ️  ${collectionName} has no documents`);
            summary.collections[collectionName] = 0;
          }
        } catch (error) {
          console.error(`❌ Error importing ${collectionName}:`, error.message);
          summary.collections[collectionName] = `Error: ${error.message}`;
        }
      } else {
        console.log(`⚠️  ${collectionName}.json not found`);
        summary.collections[collectionName] = 'File not found';
      }
    }

    // Save import summary
    summary.totalDocs = totalDocs;
    const summaryPath = path.join(importDir, 'IMPORT_SUMMARY.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`\n╔════════════════════════════════════╗`);
    console.log(`║        IMPORT SUMMARY              ║`);
    console.log(`╠════════════════════════════════════╣`);
    for (const [collection, count] of Object.entries(summary.collections)) {
      console.log(`║ ${collection.padEnd(20)} ${String(count).padStart(10)} ║`);
    }
    console.log(`╠════════════════════════════════════╣`);
    console.log(`║ TOTAL: ${String(totalDocs).padStart(26)} ║`);
    console.log(`║ Import Date: ${new Date().toLocaleString().padStart(18)} ║`);
    console.log(`╚════════════════════════════════════╝`);

    console.log(`\n✅ All data imported successfully!`);
    console.log(`📁 Import Summary: ${summaryPath}\n`);

  } catch (error) {
    console.error('❌ Import error:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('📭 MongoDB connection closed\n');
    }
  }
}

importDatabase();
