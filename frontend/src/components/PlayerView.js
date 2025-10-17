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

function PlayerView({ playerData, careerStats }) {
  const prepareChartData = () => {
    if (!playerData?.stats) return [];
    return playerData.stats.map((s) => ({
      year: s.year,
      PTS: s.pts,
      AST: s.ast,
      REB: s.reb,
    }));
  };

  return (
    <div className="player-view">
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

      {playerData.stats.length > 0 && (
        <>
          <div className="chart-container">
            <h3>Career Progression</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData()}>
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
                  {playerData.stats.map((s, index) => (
                    <tr key={index}>
                      <td>{s.year}</td>
                      <td>{s.teamName}</td>
                      <td>{s.games_played}</td>
                      <td>{s.games_started || "-"}</td>
                      <td>{s.mp?.toFixed(1)}</td>
                      <td className="highlight">{s.pts}</td>
                      <td>{s.ast}</td>
                      <td>{s.reb}</td>
                      <td>{s.orb || "-"}</td>
                      <td>{s.drb || "-"}</td>
                      <td>{s.stl || "-"}</td>
                      <td>{s.blk || "-"}</td>
                      <td>{s.tov || "-"}</td>
                      <td>{s.pf || "-"}</td>
                      <td>{s.fg_pct ? (s.fg_pct * 100).toFixed(1) + "%" : "-"}</td>
                      <td>{s.three_pt_pct ? (s.three_pt_pct * 100).toFixed(1) + "%" : "-"}</td>
                      <td>{s.two_pt_pct ? (s.two_pt_pct * 100).toFixed(1) + "%" : "-"}</td>
                      <td>{s.ft_pct ? (s.ft_pct * 100).toFixed(1) + "%" : "-"}</td>
                      <td>{s.efg_pct ? (s.efg_pct * 100).toFixed(1) + "%" : "-"}</td>
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