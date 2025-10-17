import React from "react";

function Header({ compareMode, setCompareMode, clearComparison, setComparisonPlayers, setComparisonData }) {
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (!compareMode) {
      setComparisonPlayers([]);
      setComparisonData([]);
    }
  };

  return (
    <header className="header">
      <h1> NBA Analytics Dashboard</h1>
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