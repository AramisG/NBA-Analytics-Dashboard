# NBA Analytics Dashboard

A small analytics dashboard for NBA player statistics. This repo contains a Flask backend (API) and a React frontend used to explore players, teams, seasons and leaderboards.

Prerequisites

- Python 3.8+ (3.10+ recommended)
- Node.js 16+ and npm
- MySQL server with a database, script I used to scrape data in data.ipynb

Backend

1. Create a virtual environment and install dependencies:

```powershell
cd "C:...\backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Environment variables

Create a file named `.env` in the `backend/` directory (this file is gitignored).


```
DB_HOST=127.0.0.1
DB_USER=your_db_user
DB_PASSWORD=your_password
DB_NAME=NBA
```

3. Run the backend

```powershell
python app.py
```

By default the API runs on `http://localhost:5000`.

Frontend

1. Install dependencies and run:

```powershell
cd "C:...\frontend"
npm install
npm start
```

The React app runs on `http://localhost:3000` by default and communicates with the Flask backend.


