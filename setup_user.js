const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

(async () => {
  try {
    await client.connect();
    const db = client.db("admin");
    
    // Create user for matchmajor database
    await db.command({
      createUser: "matchmajor",
      pwd: "matchmajor_password",
      roles: [{ role: "readWrite", db: "matchmajor" }]
    }).catch(err => {
      if (err.message.includes("already exists")) {
        console.log("User already exists");
      } else {
        throw err;
      }
    });
    
    console.log("User setup complete");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
