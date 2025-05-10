const express = require("express");
const cors = require("cors");
const { fetchGitCommits, fetchPRCommits } = require("./services/gitService");
const { summarizeTexts, summarizePR } = require("./services/summarizer");
const { formatReleaseNotes } = require("./services/formatter");
const { connectToDatabase, saveReleaseNote } = require("./database/db");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Initialize MongoDB connection
// connectToDatabase()
//   .then(() => {
//     console.log("MongoDB connected successfully.");
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   })
//   .catch((err) => {
//     console.error("Failed to connect to MongoDB:", err.message);
//     process.exit(1);
//   });

app.get("/", (req, res) => {
  console.log("API is running");
  res.send("🚀 Release Notes Generator API is running!");
});

app.get("/generate", async (req, res) => {
  const { repo_url, from_commit, to_commit } = req.query;

  if (!repo_url) {
    return res.status(400).json({ error: "Repository URL is required" });
  }

  try {
    console.log(`Fetching commits from ${repo_url}...`);
    const commits = await fetchGitCommits(repo_url, from_commit, to_commit);
    console.log(`${commits.length} commits fetched.`);

    const summarized = await summarizeTexts(commits);
    const releaseNotes = formatReleaseNotes(summarized);

    await saveReleaseNote(repo_url, null, from_commit, to_commit, releaseNotes);
    res.json({ release_notes: releaseNotes });
  } catch (error) {
    console.error("Error during release note generation:", error.message);
    res.status(500).json({
      error: "Error generating release notes",
      details: error.message,
    });
  }
});

app.get("/generate-from-pr", async (req, res) => {
  const { repo_url, pr_number, github_token } = req.query;

  if (!repo_url || !pr_number) {
    return res
      .status(400)
      .json({ error: "Repository URL and PR number are required" });
  }

  try {
    const prData = await fetchPRCommits(repo_url, pr_number, github_token);
    const releaseNotes = await summarizePR(prData);

    // await saveReleaseNote(
    //   repo_url,
    //   pr_number,
    //   prData.commits[0]?.hash || null,
    //   prData.commits.at(-1)?.hash || null,
    //   releaseNotes
    // );

    res.json({ release_notes: releaseNotes, pr_info: prData.prInfo });
  } catch (error) {
    console.error(
      "Error during PR-based release note generation:",
      error.message
    );
    res.status(500).json({
      error: "Error generating release notes",
      details: error.message,
    });
  }
});

app.get("/history", async (req, res) => {
  try {
    // Fetch release notes history from MongoDB
    const collection = require("./database/db").db.collection("release_notes");
    const history = await collection
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    res.json({ history });
  } catch (error) {
    console.error("Error fetching release note history:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching history", details: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
