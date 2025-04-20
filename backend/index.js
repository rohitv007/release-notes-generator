const express = require("express");
const cors = require("cors");
const { fetchGitCommits } = require("./services/gitService");
const { summarizeTexts } = require("./services/summarizer");
const { formatReleaseNotes } = require("./services/formatter");
const { saveReleaseNote } = require("./database/db");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("🚀 Release Notes Generator API is running!");
});

app.get("/generate", async (req, res) => {
  const { repo_url, from_tag, to_tag } = req.query;
  const commits = await fetchGitCommits(repo_url, from_tag, to_tag);
  const summarized = await summarizeTexts(commits);
  const releaseNotes = formatReleaseNotes(summarized);
  await saveReleaseNote(repo_url, from_tag, to_tag, releaseNotes);
  res.json({ release_notes: releaseNotes });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
