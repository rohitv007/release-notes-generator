import { useState } from "react";
import axios from "axios";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [fromTag, setFromTag] = useState("");
  const [toTag, setToTag] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const generateNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/generate`, {
        params: { repo_url: repoUrl, from_tag: fromTag, to_tag: toTag },
      });
      setReleaseNotes(res.data.release_notes);
    } catch (err) {
      console.error(err);
      alert("Error generating release notes!");
    }
    setLoading(false);
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
          placeholder="From Tag"
          value={fromTag}
          onChange={(e) => setFromTag(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="To Tag"
          value={toTag}
          onChange={(e) => setToTag(e.target.value)}
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
