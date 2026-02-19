import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Colors for each player's radar line (up to 3 players)
const PLAYER_COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

// Displays a comparison table and radar chart for 2–3 players.
function ComparisonView({ comparisonData }) {

  // Recharts needs the data structured by metric, not by player.
  // We transform it into: [{ metric: "PPG", "LeBron James": 27.1, "Kevin Durant": 27.2 }, ...]
  function buildRadarData() {
    const metrics = [
      { label: "PPG", key: "avg_ppg" },
      { label: "APG", key: "avg_apg" },
      { label: "RPG", key: "avg_rpg" },
      { label: "SPG", key: "avg_spg" },
      { label: "BPG", key: "avg_bpg" },
    ];

    return metrics.map((metric) => {
      // Start with the metric name
      const row = { metric: metric.label };

      // Add each player's value for this metric
      comparisonData.forEach((player) => {
        row[player.playerName] = player[metric.key] || 0;
      });

      return row;
    });
  }

  // Helper: converts 0.456 → "45.6%", handles missing values
  function formatPct(value) {
    if (!value) return "-";
    return (value * 100).toFixed(1) + "%";
  }

  return (
    <div className="comparison-view">
      <h2>Player Comparison</h2>

      {/* ── Stats table ── */}
      <div className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Seasons</th>
              <th>PPG</th>
              <th>APG</th>
              <th>RPG</th>
              <th>FG%</th>
              <th>3P%</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((player, index) => (
              <tr key={player.playerID}>
                {/* Give each player name their own color so the table matches the radar chart */}
                <td className="player-name" style={{ color: PLAYER_COLORS[index] }}>
                  {player.playerName}
                </td>
                <td>{player.seasons}</td>
                <td>{player.avg_ppg}</td>
                <td>{player.avg_apg}</td>
                <td>{player.avg_rpg}</td>
                <td>{formatPct(player.avg_fg_pct)}</td>
                <td>{formatPct(player.avg_3p_pct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Radar chart ── */}
      <div className="chart-container">
        <h3>Statistical Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={buildRadarData()}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis />

            {/* Draw one radar shape per player */}
            {comparisonData.map((player, index) => (
              <Radar
                key={player.playerID}
                name={player.playerName}
                dataKey={player.playerName}
                stroke={PLAYER_COLORS[index]}
                fill={PLAYER_COLORS[index]}
                fillOpacity={0.6}
              />
            ))}

            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ComparisonView;