const { Anthropic } = require("@anthropic-ai/sdk");
const { ANTHROPIC_API_KEY } = require("../config");

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

async function summarizeTexts(commits) {
  const summarized = [];

  console.log("Starting to summarize commit messages...", commits);

  if (!commits || commits.length === 0) {
    console.log("No commits to summarize");
    return summarized;
  }

  for (const commit of commits) {
    if (!commit || !commit.message) {
      console.log("Skipping invalid commit:", commit);
      continue;
    }

    if (commit.message.length < 80) {
      console.log(
        `Skipping commit ${commit.hash} as the message is too short.`
      );
      summarized.push(commit.message);
      continue;
    }

    console.log(`Summarizing commit ${commit.hash}...`);

    try {
      const res = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: `Summarize this Git commit message:\n\n${commit.message}`,
          },
        ],
      });

      const summarizedMessage = res.content[0].text.trim();
      summarized.push(summarizedMessage);
      console.log(`Commit ${commit.hash} summarized successfully.`);
    } catch (error) {
      console.error(`Error summarizing commit ${commit.hash}:`, error.message);
      summarized.push(commit.message);
    }
  }

  console.log("Summarization complete.");
  return summarized;
}

async function summarizePR(prData) {
  console.log("Starting to summarize PR...");

  try {
    const prContent = `
Title: ${prData.prInfo.title}
Description: ${prData.prInfo.description || "No description provided."}
Number of commits: ${prData.commits.length}
Commits:
${prData.commits.map((c) => `- ${c.message}`).join("\n")}
`;

    const res = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a release notes generator. 
Your job is to create a short, clear, and non-technical summary for end users and stakeholders based on the following Pull Request information.
- Use the PR title as a single main heading.
- Write a one-sentence summary in plain English, focusing on the purpose and benefit of this change.
- List the most important improvements or changes as 2-5 bullet points, using simple language and focusing on what users or stakeholders would care about.
- Do NOT include code details, class names, or implementation specifics.
- Do NOT repeat information or add unnecessary explanation.
- Use only Markdown formatting for heading and bullet points.

PR Info:
${prContent}`,
        },
      ],
    });

    const summary = res.content[0].text.trim();
    console.log("PR summarized successfully");
    return summary;
  } catch (error) {
    console.error("Error summarizing PR:", error.message);
    // Fallback to basic summary with Markdown formatting
    return `# ${prData.prInfo.title}\n\n${
      prData.prInfo.description || ""
    }\n\n_(${prData.commits.length} changes)_`;
  }
}

module.exports = { summarizeTexts, summarizePR };
