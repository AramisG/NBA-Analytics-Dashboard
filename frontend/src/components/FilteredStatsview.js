import React from "react";

function FilteredStatsView({ filteredStatsData, handleSelectPlayer }) {
  return (
    <div className="filtered-stats-view">
      <div className="filtered-stats-header">
        <h2>Filtered Player Stats</h2>
        <p className="results-count">Showing {filteredStatsData.length} results</p>
      </div>
      
      <div className="player-cards-grid">
        {filteredStatsData.map((stat, index) => (
          <div 
            key={index}
            onClick={() => handleSelectPlayer(stat.playerID)}
            className="player-card"
          >
            {/* Image Placeholder */}
            <div className="player-card-image">
              <div className="player-initials">
                {stat.playerName.split(' ').map(n => n[0]).join('')}
              </div>
            </div>

            {/* Player Info */}
            <div className="player-card-info">
              <h3 className="player-card-name">{stat.playerName}</h3>
              <p className="player-card-team">
                {stat.teamName} • {stat.year}
              </p>
              {stat.pos && <span className="player-card-position">{stat.pos}</span>}
            </div>

            {/* Main Stats */}
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

            {/* Secondary Stats */}
            <div className="player-card-stats-secondary">
              <div className="secondary-stat">
                <span className="secondary-label">FG%</span>
                <span className="secondary-value">
                  {stat.fg_pct ? (stat.fg_pct * 100).toFixed(1) + "%" : "-"}
                </span>
              </div>
              <div className="secondary-stat">
                <span className="secondary-label">FT%</span>
                <span className="secondary-value">
                  {stat.ft_pct ? (stat.ft_pct * 100).toFixed(1) + "%" : "-"}
                </span>
              </div>
            </div>

            {/* Footer Stats */}
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