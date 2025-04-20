function formatReleaseNotes(summaries) {
  return "## Release Notes\n" + summaries.map((s) => `- ${s}`).join("\n");
}

module.exports = { formatReleaseNotes };
