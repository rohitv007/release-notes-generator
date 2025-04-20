const { Pool } = require("pg");
const { DB_URL } = require("../config");

const pool = new Pool({ connectionString: DB_URL });

async function saveReleaseNote(repoUrl, fromTag, toTag, notes) {
  console.log(
    `Saving release note for repo ${repoUrl} from ${fromTag} to ${toTag}...`
  );

  const query =
    "INSERT INTO release_notes(repo_url, from_tag, to_tag, notes) VALUES($1, $2, $3, $4)";

  try {
    await pool.query(query, [repoUrl, fromTag, toTag, notes]);
    console.log("Release note saved successfully.");
  } catch (error) {
    console.error("Error saving release note:", error.message);
  }
}

module.exports = { saveReleaseNote };
