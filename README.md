# NBA PROJECT NEW

This repository contains a simple Flask backend and React frontend for NBA player statistics.

Structure:
- backend/: Flask API server
- frontend/: React app
- data/: notebooks and data files

Setup (local):

1. Create a Python virtual environment and install backend dependencies:

```powershell
python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r backend\requirements.txt
```

2. Install frontend dependencies (Node.js required):

```powershell
cd frontend; npm install
```

3. Ensure your database credentials are set in `info.env` (this file is ignored by git):

```
DB_HOST=127.0.0.1
DB_USER=your_db_user
DB_PASSWORD=your_password
DB_NAME=NBA
```

Create GitHub repo and push:

1. Create a new repository on GitHub (via web UI) named `nba-project-new` (or another name).
2. On your local machine, in the project root run:

```powershell
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/nba-project-new.git
git push -u origin main
```

If you have the GitHub CLI (`gh`) installed you can create the remote from the command line:

```powershell
gh repo create <your-username>/nba-project-new --public --source=. --remote=origin --push
```
