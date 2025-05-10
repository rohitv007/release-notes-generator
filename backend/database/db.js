const { MongoClient } = require("mongodb");
const { DB_URL } = require("../config");

const client = new MongoClient(DB_URL);
let db;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db("release_notes_db"); // Replace with your database name
    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw error;
  }
}

async function saveReleaseNote(repoUrl, fromTag, toTag, notes) {
  console.log(
    `Saving release note for repo ${repoUrl} from ${fromTag} to ${toTag}...`
  );

  try {
    const collection = db.collection("release_notes"); // Replace with your collection name
    const result = await collection.insertOne({
      repoUrl,
      fromTag,
      toTag,
      notes,
      createdAt: new Date(),
    });
    console.log("Release note saved successfully with ID:", result.insertedId);
  } catch (error) {
    console.error("Error saving release note:", error.message);
  }
}

module.exports = { connectToDatabase, saveReleaseNote };
