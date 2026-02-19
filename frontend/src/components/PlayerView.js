import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Displays a single player's career chart and season-by-season stats table.
function PlayerView({ playerData, careerStats }) {

  // Turn the raw stats array into the format Recharts needs.
  // Each entry becomes { year, PTS, AST, REB }.
  function buildChartData() {
    if (!playerData?.stats) return [];

    return playerData.stats.map((season) => ({
      year: season.year,
      PTS: season.pts,
      AST: season.ast,
      REB: season.reb,
    }));
  }

  // Helper: converts a decimal like 0.456 to "45.6%" — returns "-" if no value
  function formatPct(value) {
    if (!value) return "-";
    return (value * 100).toFixed(1) + "%";
  }

  return (
    <div className="player-view">

      {/* ── Player name + career summary cards ── */}
      <div className="player-header">
        <h2>{playerData.player.playerName}</h2>

        {careerStats && (
          <div className="career-summary">
            <div className="stat-card">
              <span className="stat-label">Seasons</span>
              <span className="stat-value">{careerStats.seasons_played}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Career PPG</span>
              <span className="stat-value">{careerStats.avg_ppg}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Career APG</span>
              <span className="stat-value">{careerStats.avg_apg}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Career RPG</span>
              <span className="stat-value">{careerStats.avg_rpg}</span>
            </div>
          </div>
        )}
      </div>

      {/* Only show the chart and table if there are stats to show */}
      {playerData.stats.length > 0 && (
        <>
          {/* ── Line chart ── */}
          <div className="chart-container">
            <h3>Career Progression</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={buildChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="PTS" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="AST" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="REB" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── Season-by-season stats table ── */}
          <div className="stats-table">
            <h3>Season-by-Season Stats</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Season</th>
                    <th>Team</th>
                    <th>GP</th>
                    <th>GS</th>
                    <th>MP</th>
                    <th>PTS</th>
                    <th>AST</th>
                    <th>TRB</th>
                    <th>ORB</th>
                    <th>DRB</th>
                    <th>STL</th>
                    <th>BLK</th>
                    <th>TOV</th>
                    <th>PF</th>
                    <th>FG%</th>
                    <th>3P%</th>
                    <th>2P%</th>
                    <th>FT%</th>
                    <th>eFG%</th>
                  </tr>
                </thead>
                <tbody>
                  {playerData.stats.map((season, index) => (
                    <tr key={index}>
                      <td>{season.year}</td>
                      <td>{season.teamName}</td>
                      <td>{season.games_played}</td>
                      <td>{season.games_started || "-"}</td>
                      <td>{season.mp?.toFixed(1)}</td>
                      <td className="highlight">{season.pts}</td>
                      <td>{season.ast}</td>
                      <td>{season.reb}</td>
                      <td>{season.orb || "-"}</td>
                      <td>{season.drb || "-"}</td>
                      <td>{season.stl || "-"}</td>
                      <td>{season.blk || "-"}</td>
                      <td>{season.tov || "-"}</td>
                      <td>{season.pf || "-"}</td>
                      <td>{formatPct(season.fg_pct)}</td>
                      <td>{formatPct(season.three_pt_pct)}</td>
                      <td>{formatPct(season.two_pt_pct)}</td>
                      <td>{formatPct(season.ft_pct)}</td>
                      <td>{formatPct(season.efg_pct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default PlayerView;