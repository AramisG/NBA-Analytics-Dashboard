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

function ComparisonView({ comparisonData }) {
  const prepareRadarData = () => {
    if (!comparisonData || comparisonData.length === 0) return [];

    const metrics = [
      { name: "PPG", key: "avg_ppg" },
      { name: "APG", key: "avg_apg" },
      { name: "RPG", key: "avg_rpg" },
      { name: "SPG", key: "avg_spg" },
      { name: "BPG", key: "avg_bpg" },
    ];

    return metrics.map((metric) => {
      const data = { metric: metric.name };
      comparisonData.forEach((player) => {
        data[player.playerName] = player[metric.key] || 0;
      });
      return data;
    });
  };

  return (
    <div className="comparison-view">
      <h2>Player Comparison</h2>

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
            {comparisonData.map((player) => (
              <tr key={player.playerID}>
                <td className="player-name">{player.playerName}</td>
                <td>{player.seasons}</td>
                <td>{player.avg_ppg}</td>
                <td>{player.avg_apg}</td>
                <td>{player.avg_rpg}</td>
                <td>{(player.avg_fg_pct * 100).toFixed(1)}%</td>
                <td>{(player.avg_3p_pct * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="chart-container">
        <h3>Statistical Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={prepareRadarData()}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis />
            {comparisonData.map((player, idx) => (
              <Radar
                key={player.playerID}
                name={player.playerName}
                dataKey={player.playerName}
                stroke={["#8884d8", "#82ca9d", "#ffc658"][idx]}
                fill={["#8884d8", "#82ca9d", "#ffc658"][idx]}
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