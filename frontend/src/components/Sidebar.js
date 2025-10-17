import React from "react";

function Sidebar({
  searchTerm,
  setSearchTerm,
  selectedTeam,
  setSelectedTeam,
  selectedSeason,
  setSelectedSeason,
  teams,
  seasons,
  filteredPlayers,
  selectedPlayer,
  handleSelectPlayer,
  compareMode,
  comparisonPlayers,
  handleCompare,
  clearComparison,
  handleShowFilteredStats,
  clearFilters
}) {
  return (
    <aside className="sidebar">
      <div className="filters-section">
        <h3>Filters</h3>
        
        {/* Search */}
        <div className="filter-group">
          <label>Search Player</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Team Filter */}
        <div className="filter-group">
          <label>Team</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="filter-select"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team.teamCode} value={team.teamCode}>
                {team.teamName}
              </option>
            ))}
          </select>
        </div>

        {/* Season Filter */}
        <div className="filter-group">
          <label>Season</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="filter-select"
          >
            <option value="">All Seasons</option>
            {seasons.map((season) => (
              <option key={season.seasonID} value={season.year}>
                {season.year}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Actions */}
        <div className="filter-actions">
          <button className="btn btn-small" onClick={handleShowFilteredStats}>
            Show Stats Table
          </button>
          <button className="btn btn-small btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {compareMode && (
        <div className="compare-info">
          <p>Selected: {comparisonPlayers.length}/3</p>
          {comparisonPlayers.length >= 2 && (
            <button className="btn btn-small" onClick={handleCompare}>
              Compare Now
            </button>
          )}
          {comparisonPlayers.length > 0 && (
            <button className="btn btn-small btn-secondary" onClick={clearComparison}>
              Clear
            </button>
          )}
        </div>
      )}

      <div className="player-list">
        <h4>Players ({filteredPlayers.length})</h4>
        {filteredPlayers.map((player) => {
          const isSelected = compareMode
            ? comparisonPlayers.includes(player.playerID)
            : selectedPlayer === player.playerID;

          return (
            <div
              key={player.playerID}
              onClick={() => handleSelectPlayer(player.playerID)}
              className={`player-item ${isSelected ? "selected" : ""}`}
            >
              {player.playerName}
              {compareMode && isSelected && <span className="check">✓</span>}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;