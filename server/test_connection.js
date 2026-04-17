const { MongoClient } = require("mongodb");

async function test() {
  const uri = "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor?authSource=admin";
  console.log("Connecting to:", uri);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000
  });
  
  try {
    await client.connect();
    console.log("? Connected!");
    
    const db = client.db("matchmajor");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    await client.close();
  } catch (err) {
    console.error("? Error:", err.message);
  }
}

test();
