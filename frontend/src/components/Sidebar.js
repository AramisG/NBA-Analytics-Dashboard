import React from "react";

// Sidebar holds all the filters and the scrollable player list.
function Sidebar({
  searchTerm,
  setSearchTerm,
  selectedTeam,
  setSelectedTeam,
  selectedSeason,
  setSelectedSeason,
  teams,
  seasons,
  visiblePlayers,       // the already-filtered list of players to display
  selectedPlayerID,     // the ID of the currently selected player (normal mode)
  handleSelectPlayer,
  compareMode,
  comparisonPlayerIDs,  // list of player IDs selected for comparison
  handleCompare,
  clearComparison,
  handleShowFilteredStats,
  clearFilters,
}) {
  return (
    <aside className="sidebar">

      {/* ── Filters ── */}
      <div className="filters-section">
        <h3>Filters</h3>

        {/* Player name search */}
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

        {/* Team dropdown */}
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

        {/* Season dropdown */}
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

        {/* Action buttons */}
        <div className="filter-actions">
          <button className="btn btn-small" onClick={handleShowFilteredStats}>
            Show Stats Table
          </button>
          <button className="btn btn-small btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* ── Compare mode info box ── */}
      {/* Only shown when compare mode is active */}
      {compareMode && (
        <div className="compare-info">
          <p>Selected: {comparisonPlayerIDs.length} / 3</p>

          {/* Show "Compare Now" once 2+ players are selected */}
          {comparisonPlayerIDs.length >= 2 && (
            <button className="btn btn-small" onClick={handleCompare}>
              Compare Now
            </button>
          )}

          {/* Show "Clear" once at least 1 player is selected */}
          {comparisonPlayerIDs.length > 0 && (
            <button className="btn btn-small btn-secondary" onClick={clearComparison}>
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Player list ── */}
      <div className="player-list">
        <h4>Players ({visiblePlayers.length})</h4>

        {visiblePlayers.map((player) => {
          // Figure out if this player should appear highlighted
          const isSelected = compareMode
            ? comparisonPlayerIDs.includes(player.playerID)  // compare mode: is this one of the picked players?
            : selectedPlayerID === player.playerID;          // normal mode: is this the viewed player?

          return (
            <div
              key={player.playerID}
              onClick={() => handleSelectPlayer(player.playerID)}
              className={`player-item ${isSelected ? "selected" : ""}`}
            >
              {player.playerName}
              {/* Show a checkmark next to selected players in compare mode */}
              {compareMode && isSelected && <span className="check">✓</span>}
            </div>
          );
        })}
      </div>

    </aside>
  );
}

export default Sidebar;