const express = require("express");
const cors = require("cors");
const { fetchGitCommits } = require("./services/gitService");
const { summarizeTexts } = require("./services/summarizer");
const { formatReleaseNotes } = require("./services/formatter");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log("API is running");
  res.send("🚀 Release Notes Generator API is running!");
});

app.get("/generate", async (req, res) => {
  const { repo_url, from_commit, to_commit } = req.query;

  if (!repo_url) {
    return res.status(400).json({ error: "Repository URL is required" });
  }

  console.log(
    `Received request to generate release notes for ${repo_url} from commit ${from_commit} to ${to_commit}...`
  );

  try {
    console.log(
      `Fetching commits from ${repo_url} between commit hashes ${from_commit} and ${to_commit}...`
    );
    const commits = await fetchGitCommits(repo_url, from_commit, to_commit);
    console.log(`${commits.length} commits fetched.`);

    console.log("Summarizing commits...");
    const summarized = await summarizeTexts(commits);
    console.log("Commits summarized.");

    console.log("Formatting release notes...");
    const releaseNotes = formatReleaseNotes(summarized);
    console.log("Release notes formatted.");

    // await saveReleaseNote(repo_url, from_commit, to_commit, releaseNotes);

    console.log("Sending release notes response...");
    res.json({ release_notes: releaseNotes });
    console.log("Release notes generated and response sent successfully.");
  } catch (error) {
    console.error("Error during release note generation:", error.message);
    res
      .status(500)
      .json({
        error: "Error generating release notes",
        details: error.message,
      });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
