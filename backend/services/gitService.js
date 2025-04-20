const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function fetchGitCommits(repoUrl, fromCommit, toCommit) {
  console.log(`Starting to clone repo: ${repoUrl}`);

  const clonePath = path.join(__dirname, "repo");

  if (fs.existsSync(clonePath)) fs.rmSync(clonePath, { recursive: true });

  console.log("Cloning repo...");
  try {
    execSync(`git clone ${repoUrl} ${clonePath}`);
    console.log("Repo cloned successfully.");
  } catch (error) {
    console.error("Error cloning the repo:", error.message);
    throw error;
  }

  console.log(
    `Fetching commits from commit hash ${fromCommit} to ${toCommit}...`
  );
  try {
    execSync(`git fetch --all`, { cwd: clonePath });

    const getCommitDate = (commitHash) => {
      if (!commitHash) return null;
      try {
        return execSync(`git show -s --format=%ct ${commitHash}`, {
          cwd: clonePath,
        })
          .toString()
          .trim();
      } catch (e) {
        console.error(
          `Error getting date for commit ${commitHash}:`,
          e.message
        );
        return null;
      }
    };

    const fromDate = getCommitDate(fromCommit);
    const toDate = getCommitDate(toCommit);

    let olderCommit = fromCommit;
    let newerCommit = toCommit;

    if (fromDate && toDate && parseInt(fromDate) > parseInt(toDate)) {
      console.log("Commit range appears to be reversed, adjusting order...");
      olderCommit = toCommit;
      newerCommit = fromCommit;
    }

    let gitCommand;
    if (olderCommit && newerCommit) {
      gitCommand = `git log ${olderCommit}^..${newerCommit} --pretty=format:"%h|%s" --no-merges`;
    } else if (newerCommit) {
      gitCommand = `git log ${newerCommit} -10 --pretty=format:"%h|%s" --no-merges`;
    } else if (olderCommit) {
      gitCommand = `git log ${olderCommit}..HEAD --pretty=format:"%h|%s" --no-merges`;
    } else {
      gitCommand = `git log -10 --pretty=format:"%h|%s" --no-merges`;
    }

    console.log(`Executing git command: ${gitCommand}`);
    const output = execSync(gitCommand, { cwd: clonePath });

    const commits = output
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, ...messageParts] = line.split("|");
        const message = messageParts.join("|");
        return { hash, message };
      });

    console.log(`Fetched ${commits.length} commits from the repo.`);
    return commits;
  } catch (error) {
    console.error("Error fetching commits:", error.message);
    throw error;
  }
}

module.exports = { fetchGitCommits };
