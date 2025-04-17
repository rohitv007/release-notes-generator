from fastapi import FastAPI
from services.git_service import get_git_commits
from services.summarizer import generate_release_notes
from services.formatter import format_notes
from database.db import store_notes

app = FastAPI()

@app.get("/generate")
def generate(repo_url: str, from_tag: str, to_tag: str):
    commits = get_git_commits(repo_url, from_tag, to_tag)
    summary = generate_release_notes(commits)
    formatted = format_notes(summary)
    store_notes(repo_url, from_tag, to_tag, formatted)
    return {"release_notes": formatted}