const OpenAI = require("openai");
const { OPENAI_API_KEY } = require("../config");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function summarizeTexts(commits) {
  const summarized = [];
  for (const commit of commits) {
    if (commit.length < 80) {
      summarized.push(commit);
      continue;
    }

    const res = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: `Summarize: ${commit}` }],
    });

    summarized.push(res.choices[0].message.content.trim());
  }
  return summarized;
}

module.exports = { summarizeTexts };
