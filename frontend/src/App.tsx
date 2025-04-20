import { useState } from "react";
import axios from "axios";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [fromCommit, setFromCommit] = useState(""); // Update to commit hash
  const [toCommit, setToCommit] = useState(""); // Update to commit hash
  const [releaseNotes, setReleaseNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const generateNotes = async () => {
    if (!repoUrl) {
      alert("Please enter a repository URL");
      return;
    }

    if (!fromCommit && !toCommit) {
      alert("Please provide at least one commit hash");
      return;
    }

    console.log(
      `Request to generate notes with repoUrl: ${repoUrl}, fromCommit: ${fromCommit}, toCommit: ${toCommit}`
    );
    setLoading(true);

    try {
      console.log(`Making API call to ${apiUrl}/generate`);
      const res = await axios.get(`${apiUrl}/generate`, {
        params: {
          repo_url: repoUrl,
          from_commit: fromCommit,
          to_commit: toCommit,
        },
      });

      console.log("API response received:", res.data);
      setReleaseNotes(res.data.release_notes);
    } catch (err) {
      console.error("Error generating release notes:", err);
      alert("Error generating release notes.");
    }

    setLoading(false);
    console.log("Finished generating release notes.");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">Release Notes Generator</h1>
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Git Repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="From Commit Hash"
          value={fromCommit}
          onChange={(e) => setFromCommit(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="To Commit Hash"
          value={toCommit}
          onChange={(e) => setToCommit(e.target.value)}
        />
        <button
          onClick={generateNotes}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          {loading ? "Generating..." : "Generate Release Notes"}
        </button>
        {releaseNotes && (
          <div className="mt-4 p-4 border rounded bg-gray-50 whitespace-pre-wrap text-sm">
            {releaseNotes}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
