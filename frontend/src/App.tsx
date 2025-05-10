import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [fromCommit, setFromCommit] = useState("");
  const [toCommit, setToCommit] = useState("");
  const [prNumber, setPrNumber] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"commit" | "pr">("commit");

  const apiUrl = import.meta.env.VITE_API_URL;

  // Reset release notes when mode or repo changes
  const handleModeChange = (newMode: "commit" | "pr") => {
    setMode(newMode);
    setReleaseNotes("");
  };

  const handleRepoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoUrl(e.target.value);
    setReleaseNotes("");
  };

  const generateNotes = async () => {
    if (!repoUrl) {
      alert("Repository URL is required");
      return;
    }

    setLoading(true);

    try {
      let res;

      if (mode === "commit") {
        if (!fromCommit || !toCommit) {
          alert("Both 'From Commit Hash' and 'To Commit Hash' are required");
          setLoading(false);
          return;
        }

        res = await axios.get(`${apiUrl}/generate`, {
          params: {
            repo_url: repoUrl,
            from_commit: fromCommit,
            to_commit: toCommit,
          },
        });
      } else {
        if (!prNumber) {
          alert("PR number is required");
          setLoading(false);
          return;
        }

        res = await axios.get(`${apiUrl}/generate-from-pr`, {
          params: {
            repo_url: repoUrl,
            pr_number: prNumber,
            github_token: githubToken || undefined,
          },
        });
      }

      setReleaseNotes(res.data.release_notes || "No release notes generated.");
    } catch (err: unknown) {
      setReleaseNotes("");
      if (axios.isAxiosError(err) && err.response?.data?.details) {
        alert(`Error generating release notes: ${err.response.data.details}`);
      } else {
        alert(`Error generating release notes: ${String(err)}`);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">Release Notes Generator</h1>

        <div className="flex space-x-2">
          <button
            onClick={() => handleModeChange("commit")}
            className={`flex-1 p-2 rounded ${
              mode === "commit"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            By Commits
          </button>
          <button
            onClick={() => handleModeChange("pr")}
            className={`flex-1 p-2 rounded ${
              mode === "pr"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            By Pull Request
          </button>
        </div>

        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Git Repo URL (e.g., https://github.com/user/repo)"
          value={repoUrl}
          onChange={handleRepoUrlChange}
        />

        {mode === "commit" ? (
          <>
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
          </>
        ) : (
          <>
            <input
              className="w-full border p-2 rounded"
              type="text"
              placeholder="PR Number (e.g., 123)"
              value={prNumber}
              onChange={(e) => setPrNumber(e.target.value)}
            />
            <input
              className="w-full border p-2 rounded"
              type="password"
              placeholder="GitHub Token (optional)"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
            />
          </>
        )}

        <button
          onClick={generateNotes}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          {loading ? "Generating..." : "Generate Release Notes"}
        </button>

        {releaseNotes && (
          <div className="mt-4 p-4 border rounded bg-gray-50 text-sm markdown-body">
            <ReactMarkdown>{releaseNotes}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
