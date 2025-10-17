from flask import Flask, jsonify, request
from mysql.connector import pooling, Error
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()


app = Flask(__name__)
CORS(app)

try:
    db_pool = pooling.MySQLConnectionPool(
        pool_name="nba_pool",
        pool_size=5,
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    print("Connected to MySQL pool successfully!")
except Error as e:
    print(f"Error creating connection pool: {e}")
    exit(1)

def get_db():
    """Get connection and cursor from pool"""
    try:
        connection = db_pool.get_connection()
        cursor = connection.cursor(dictionary=True)
        return connection, cursor
    except Error as e:
        print(f"Error getting connection: {e}")
        return None, None

def close_db(connection, cursor):
    """Safely close cursor and return connection to pool"""
    if cursor:
        cursor.close()
    if connection:
        connection.close()

# --- ERROR HANDLERS ---
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# --- ROUTES ---

@app.route('/')
def home():
    return jsonify({"message": " NBA API is running!", "version": "2.0"})

# --- PLAYERS ---
@app.route('/players')
def get_players():
    """Get all players, optionally filtered by team and/or season"""
    team = request.args.get('team')
    season = request.args.get('season')
    
    connection, cursor = get_db()
    if not cursor:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        if team or season:
            # Get players filtered by team/season
            query = """
                SELECT DISTINCT p.playerID, p.playerName
                FROM players p
                JOIN player_stats ps ON p.playerID = ps.playerID
            """
            conditions = []
            params = []
            
            if team:
                query += " JOIN teams t ON ps.teamCode = t.teamCode"
                conditions.append("t.teamCode = %s")
                params.append(team)
            
            if season:
                query += " JOIN seasons s ON ps.seasonID = s.seasonID"
                conditions.append("s.year = %s")
                params.append(season)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY p.playerName;"
            cursor.execute(query, tuple(params))
        else:
            # Get all players
            cursor.execute("SELECT playerID, playerName FROM players ORDER BY playerName;")
        
        players = cursor.fetchall()
        return jsonify(players)
    finally:
        close_db(connection, cursor)

@app.route('/player/<int:player_id>')
def get_player(player_id):
    connection, cursor = get_db()
    if not cursor:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        # Get player info
        cursor.execute("SELECT playerID, playerName FROM players WHERE playerID = %s", (player_id,))
        player = cursor.fetchone()
        
        if not player:
            return jsonify({"error": "Player not found"}), 404
        
        # Get season stats
        query = """
            SELECT s.year, ps.pts, ps.ast, ps.trb AS reb, 
                   ps.minutes_played as mp, ps.games_played, ps.games_started,
                   ps.fg_pct, ps.three_pt_pct, ps.two_pt_pct, ps.ft_pct, ps.efg_pct,
                   ps.orb, ps.drb, ps.stl, ps.blk, ps.tov, ps.pf,
                   t.teamName, ps.pos
            FROM player_stats ps
            JOIN seasons s ON ps.seasonID = s.seasonID
            LEFT JOIN teams t ON ps.teamCode = t.teamCode
            WHERE ps.playerID = %s AND ps.is_total_row = FALSE
            ORDER BY s.year DESC;
        """
        cursor.execute(query, (player_id,))
        stats = cursor.fetchall()
        
        return jsonify({"player": player, "stats": stats})
    finally:
        close_db(connection, cursor)

@app.route('/player/<int:player_id>/career')
def get_career_stats(player_id):
    connection, cursor = get_db()
    if not cursor:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        query = """
            SELECT 
                COUNT(DISTINCT ps.seasonID) as seasons_played,
                SUM(ps.games_played) as total_games,
                ROUND(AVG(ps.pts), 1) as avg_ppg,
                ROUND(AVG(ps.ast), 1) as avg_apg,
                ROUND(AVG(ps.trb), 1) as avg_rpg,
                ROUND(AVG(ps.fg_pct), 3) as avg_fg_pct,
                ROUND(AVG(ps.three_pt_pct), 3) as avg_3p_pct,
                MAX(ps.pts) as best_ppg_season,
                MIN(s.year) as first_season,
                MAX(s.year) as last_season
            FROM player_stats ps
            JOIN seasons s ON ps.seasonID = s.seasonID
            WHERE ps.playerID = %s AND ps.is_total_row = FALSE
            GROUP BY ps.playerID;
        """
        cursor.execute(query, (player_id,))
        career = cursor.fetchone()
        
        if not career:
            return jsonify({"error": "No career stats found"}), 404
        
        return jsonify(career)
    finally:
        close_db(connection, cursor)

# --- PLAYER COMPARISON ---
@app.route('/compare')
def compare_players():
    player_ids = request.args.getlist('playerID')
    
    if len(player_ids) < 2:
        return jsonify({"error": "Please provide at least 2 player IDs"}), 400
    
    connection, cursor = get_db()
    if not cursor:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        placeholders = ','.join(['%s'] * len(player_ids))
        query = f"""
            SELECT 
                p.playerID,
                p.playerName,
                ROUND(AVG(ps.pts), 1) as avg_ppg,
                ROUND(AVG(ps.ast), 1) as avg_apg,
                ROUND(AVG(ps.trb), 1) as avg_rpg,
                ROUND(AVG(ps.stl), 1) as avg_spg,
                ROUND(AVG(ps.blk), 1) as avg_bpg,
                ROUND(AVG(ps.fg_pct), 3) as avg_fg_pct,
                ROUND(AVG(ps.three_pt_pct), 3) as avg_3p_pct,
                COUNT(DISTINCT ps.seasonID) as seasons
            FROM player_stats ps
            JOIN players p ON ps.playerID = p.playerID
            WHERE ps.playerID IN ({placeholders}) AND ps.is_total_row = FALSE
            GROUP BY p.playerID, p.playerName;
        """
        cursor.execute(query, tuple(player_ids))
        comparison = cursor.fetchall()
        
        return jsonify(comparison)
    finally:
        close_db(connection, cursor)

# --- TEAMS ---
@app.route('/teams')
def get_teams():
    connection, cursor = get_db()
    if not cursor:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor.execute("SELECT teamCode, teamName FROM teams ORDER BY teamName;")
        teams = cursor.fetchall()
        return jsonify(teams)
    finally:
        close_db(connection, cursor)

# --- SEASONS ---
@app.route('/seasons')
def get_seasons():
    connection, cursor = get_db()
    if not cursor:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor.execute("SELECT seasonID, year FROM seasons ORDER BY year DESC;")
        seasons = cursor.fetchall()
        return jsonify(seasons)
    finally:
        close_db(connection, cursor)

# --- LEADERBOARD ---
@app.route('/leaderboard')
def get_leaderboard():
    stat = request.args.get('stat', 'pts')
    season = request.args.get('season')
    limit = request.args.get('limit', 20)
    
    valid_stats = ['pts', 'ast', 'trb', 'stl', 'blk', 'fg_pct', 'three_pt_pct']
    if stat not in valid_stats:
        return jsonify({"error": "Invalid stat parameter"}), 400
    
    connection, cursor = get_db()
    if not cursor:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        query = f"""
            SELECT 
                p.playerName,
                t.teamName,
                s.year,
                ps.{stat},
                ps.games_played
            FROM player_stats ps
            JOIN players p ON ps.playerID = p.playerID
            JOIN teams t ON ps.teamCode = t.teamCode
            JOIN seasons s ON ps.seasonID = s.seasonID
            WHERE ps.is_total_row = FALSE AND ps.games_played >= 20
        """
        params = []
        
        if season:
            query += " AND s.year = %s"
            params.append(season)
        
        query += f" ORDER BY ps.{stat} DESC LIMIT %s;"
        params.append(limit)
        
        cursor.execute(query, tuple(params))
        leaders = cursor.fetchall()
        return jsonify(leaders)
    finally:
        close_db(connection, cursor)

# --- FILTERED STATS VIEW ---
@app.route('/stats')
def get_stats():
    """Get player stats with flexible filtering"""
    player = request.args.get('player')
    team = request.args.get('team')
    season = request.args.get('season')

    connection, cursor = get_db()
    if not cursor:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        query = """
            SELECT 
                p.playerID,
                p.playerName, 
                t.teamName, 
                t.teamCode,
                s.year, 
                ps.pts, 
                ps.ast, 
                ps.trb as reb, 
                ps.games_played, 
                ps.minutes_played,
                ps.fg_pct, 
                ps.three_pt_pct, 
                ps.ft_pct,
                ps.stl,
                ps.blk,
                ps.pos
            FROM player_stats ps
            JOIN players p ON ps.playerID = p.playerID
            JOIN teams t ON ps.teamCode = t.teamCode
            JOIN seasons s ON ps.seasonID = s.seasonID
            WHERE ps.is_total_row = FALSE
        """
        params = []
        
        if player:
            query += " AND p.playerName LIKE %s"
            params.append(f"%{player}%")
        if team:
            query += " AND t.teamCode = %s"
            params.append(team)
        if season:
            query += " AND s.year = %s"
            params.append(season)

        query += " ORDER BY s.year DESC, ps.pts DESC LIMIT 200;"

        cursor.execute(query, tuple(params))
        results = cursor.fetchall()
        return jsonify(results)
    finally:
        close_db(connection, cursor)

# --- PLAYER AWARDS ---
@app.route('/awards')
def get_awards():
    connection, cursor = get_db()
    if not cursor:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor.execute("""
            SELECT p.playerName, s.year, a.awardName, a.awardValue
            FROM player_awards a
            JOIN players p ON a.playerID = p.playerID
            JOIN seasons s ON a.seasonID = s.seasonID
            ORDER BY s.year DESC, a.awardName;
        """)
        awards = cursor.fetchall()
        return jsonify(awards)
    finally:
        close_db(connection, cursor)

# --- SEARCH ---
@app.route('/search')
def search_players():
    query = request.args.get('q', '')
    
    if len(query) < 2:
        return jsonify([])
    
    connection, cursor = get_db()
    if not cursor:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor.execute("""
            SELECT playerID, playerName 
            FROM players 
            WHERE playerName LIKE %s 
            ORDER BY playerName 
            LIMIT 20;
        """, (f"%{query}%",))
        results = cursor.fetchall()
        return jsonify(results)
    finally:
        close_db(connection, cursor)

# --- RUN APP ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)