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

module.exports = { summarizeTexts };
