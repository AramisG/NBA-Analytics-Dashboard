import React from "react";

// Header sits at the top of the page.
// It shows the app title and the Compare Players button.
function Header({ compareMode, setCompareMode, clearComparison, setComparisonPlayerIDs, setComparisonData }) {

  // Toggle compare mode on/off.
  // When turning it OFF, also wipe any players that were selected for comparison.
  function toggleCompareMode() {
    if (compareMode) {
      // Turning off — clear everything comparison-related
      clearComparison();
    } else {
      // Turning on — just flip the flag
      setCompareMode(true);
    }
  }

  return (
    <header className="header">
      <h1>NBA Analytics Dashboard</h1>

      <div className="header-actions">
        <button
          className={`btn ${compareMode ? "btn-active" : ""}`}
          onClick={toggleCompareMode}
        >
          {compareMode ? "Exit Compare Mode" : "Compare Players"}
        </button>
      </div>
    </header>
  );
}

export default Header;