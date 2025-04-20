const { Pool } = require("pg");
const { DB_URL } = require("../config");

const pool = new Pool({ connectionString: DB_URL });

async function saveReleaseNote(repoUrl, fromTag, toTag, notes) {
  const query =
    "INSERT INTO release_notes(repo_url, from_tag, to_tag, notes) VALUES($1, $2, $3, $4)";
  await pool.query(query, [repoUrl, fromTag, toTag, notes]);
}

module.exports = { saveReleaseNote };
