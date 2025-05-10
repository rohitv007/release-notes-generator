const { summarizeTexts, summarizePR } = require("./summarizer");
const { formatReleaseNotes } = require("./formatter");
const axios = require("axios");

/**
 * Fetch commits between two commits from a GitHub repo.
 * @param {string} repo_url - GitHub repo URL (e.g., https://github.com/user/repo)
 * @param {string} from_commit
 * @param {string} to_commit
 * @returns {Promise<Array<{hash: string, message: string}>>}
 */
async function fetchGitCommits(repo_url, from_commit, to_commit) {
  // Extract owner/repo from URL
  const match = repo_url.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/i);
  if (!match) throw new Error("Invalid GitHub repo URL");
  const owner = match[1];
  const repo = match[2];

  // Use GitHub compare API
  const url = `https://api.github.com/repos/${owner}/${repo}/compare/${from_commit}...${to_commit}`;
  const res = await axios.get(url);
  return res.data.commits.map((c) => ({
    hash: c.sha,
    message: c.commit.message,
  }));
}

/**
 * Fetch PR info and commits from a GitHub repo.
 * @param {string} repo_url - GitHub repo URL (e.g., https://github.com/user/repo)
 * @param {string|number} pr_number
 * @param {string} [github_token]
 * @returns {Promise<{prInfo: object, commits: Array<{hash: string, message: string}>}>}
 */
async function fetchPRCommits(repo_url, pr_number, github_token) {
  const match = repo_url.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/i);
  if (!match) throw new Error("Invalid GitHub repo URL");
  const owner = match[1];
  const repo = match[2];

  const headers = github_token
    ? { Authorization: `token ${github_token}` }
    : {};

  // Get PR info
  const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pr_number}`;
  const prRes = await axios.get(prUrl, { headers });
  const pr = prRes.data;

  // Get PR commits
  const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pr_number}/commits`;
  const commitsRes = await axios.get(commitsUrl, { headers });
  const commits = commitsRes.data.map((c) => ({
    hash: c.sha,
    message: c.commit.message,
  }));

  return {
    prInfo: {
      title: pr.title,
      description: pr.body,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      author: pr.user.login,
    },
    commits,
  };
}

module.exports = { fetchGitCommits, fetchPRCommits };
