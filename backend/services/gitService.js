const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

async function fetchGitCommits(repoUrl, fromTag, toTag) {
  const clonePath = "/tmp/repo";
  if (fs.existsSync(clonePath)) fs.rmSync(clonePath, { recursive: true });
  execSync(`git clone ${repoUrl} ${clonePath}`);
  const output = execSync(`git log ${fromTag}..${toTag} --pretty=format:%s`, {
    cwd: clonePath,
  });
  return output.toString().split("\n");
}

module.exports = { fetchGitCommits };
