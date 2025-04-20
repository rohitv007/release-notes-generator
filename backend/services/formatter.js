function formatReleaseNotes(summaries) {
  console.log("Formatting release notes...");

  const formattedNotes =
    "## Release Notes\n" + summaries.map((s) => `- ${s}`).join("\n");

  console.log("Release notes formatted successfully.");
  return formattedNotes;
}

module.exports = { formatReleaseNotes };
