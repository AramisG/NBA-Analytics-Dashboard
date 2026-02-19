import React from "react";

// Shows a grid of player cards based on the current filters.
// Clicking a card loads that player's full stats page.
function FilteredStatsView({ filteredStatsData, handleSelectPlayer }) {

  // Helper: converts 0.456 → "45.6%", returns "-" if no value
  function formatPct(value) {
    if (!value) return "-";
    return (value * 100).toFixed(1) + "%";
  }

  // Helper: turn "LeBron James" into initials "LJ" for the avatar placeholder
  function getInitials(name) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("");
  }

  return (
    <div className="filtered-stats-view">

      {/* ── Header ── */}
      <div className="filtered-stats-header">
        <h2>Filtered Player Stats</h2>
        <p className="results-count">Showing {filteredStatsData.length} results</p>
      </div>

      {/* ── Card grid ── */}
      <div className="player-cards-grid">
        {filteredStatsData.map((stat, index) => (
          <div
            key={index}
            onClick={() => handleSelectPlayer(stat.playerID)}
            className="player-card"
          >

            {/* Avatar placeholder with initials */}
            <div className="player-card-image">
              <div className="player-initials">{getInitials(stat.playerName)}</div>
            </div>

            {/* Name, team, year, and position badge */}
            <div className="player-card-info">
              <h3 className="player-card-name">{stat.playerName}</h3>
              <p className="player-card-team">
                {stat.teamName} • {stat.year}
              </p>
              {stat.pos && (
                <span className="player-card-position">{stat.pos}</span>
              )}
            </div>

            {/* Main stats: points, assists, rebounds */}
            <div className="player-card-stats-main">
              <div className="stat-item">
                <span className="stat-value">{stat.pts}</span>
                <span className="stat-label">PPG</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stat.ast}</span>
                <span className="stat-label">APG</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stat.reb}</span>
                <span className="stat-label">RPG</span>
              </div>
            </div>

            {/* Secondary stats: shooting percentages */}
            <div className="player-card-stats-secondary">
              <div className="secondary-stat">
                <span className="secondary-label">FG%</span>
                <span className="secondary-value">{formatPct(stat.fg_pct)}</span>
              </div>
              <div className="secondary-stat">
                <span className="secondary-label">FT%</span>
                <span className="secondary-value">{formatPct(stat.ft_pct)}</span>
              </div>
            </div>

            {/* Footer: games played and minutes */}
            <div className="player-card-footer">
              <span>GP: {stat.games_played}</span>
              <span>MPG: {stat.minutes_played?.toFixed(1)}</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default FilteredStatsView;