import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PlayerView from "./components/PlayerView";
import ComparisonView from "./components/ComparisonView";
import FilteredStatsView from "./components/FilteredStatsview";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

function App() {
  // State management
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  
  // Player data
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [careerStats, setCareerStats] = useState(null);
  
  // Comparison
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonPlayers, setComparisonPlayers] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(false);
  const [showFilteredStats, setShowFilteredStats] = useState(false);
  const [filteredStatsData, setFilteredStatsData] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedTeam, selectedSeason, allPlayers]);

  const loadInitialData = async () => {
    try {
      const [playersRes, teamsRes, seasonsRes] = await Promise.all([
        axios.get(`${API_URL}/players`),
        axios.get(`${API_URL}/teams`),
        axios.get(`${API_URL}/seasons`)
      ]);
      
      setAllPlayers(playersRes.data);
      setPlayers(playersRes.data);
      setFilteredPlayers(playersRes.data);
      setTeams(teamsRes.data);
      setSeasons(seasonsRes.data);
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  };

  const applyFilters = async () => {
    const params = new URLSearchParams();
    if (selectedTeam) params.append('team', selectedTeam);
    if (selectedSeason) params.append('season', selectedSeason);
    
    try {
      const url = params.toString() 
        ? `${API_URL}/players?${params.toString()}`
        : `${API_URL}/players`;
      
      const res = await axios.get(url);
      let filtered = res.data;
      
      if (searchTerm.trim() !== "") {
        filtered = filtered.filter((p) =>
          p.playerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setPlayers(filtered);
      setFilteredPlayers(filtered);
    } catch (err) {
      console.error("Error applying filters:", err);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTeam("");
    setSelectedSeason("");
    setShowFilteredStats(false);
    setFilteredStatsData([]);
  };

  const handleShowFilteredStats = async () => {
    setLoading(true);
    setShowFilteredStats(true);
    setActiveTab("filtered");
    
    try {
      const params = new URLSearchParams();
      if (selectedTeam) params.append('team', selectedTeam);
      if (selectedSeason) params.append('season', selectedSeason);
      if (searchTerm) params.append('player', searchTerm);
      
      const res = await axios.get(`${API_URL}/stats?${params.toString()}`);
      setFilteredStatsData(res.data);
    } catch (err) {
      console.error("Error fetching filtered stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlayer = async (playerId) => {
    if (compareMode) {
      if (comparisonPlayers.includes(playerId)) {
        setComparisonPlayers(comparisonPlayers.filter((id) => id !== playerId));
      } else if (comparisonPlayers.length < 3) {
        setComparisonPlayers([...comparisonPlayers, playerId]);
      }
      return;
    }

    setLoading(true);
    setSelectedPlayer(playerId);
    setActiveTab("stats");
    setShowFilteredStats(false);

    try {
      const [statsRes, careerRes] = await Promise.all([
        axios.get(`${API_URL}/player/${playerId}`),
        axios.get(`${API_URL}/player/${playerId}/career`),
      ]);
      setPlayerData(statsRes.data);
      setCareerStats(careerRes.data);
    } catch (err) {
      console.error("Error fetching player data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (comparisonPlayers.length < 2) return;

    setLoading(true);
    try {
      const params = comparisonPlayers.map((id) => `playerID=${id}`).join("&");
      const res = await axios.get(`${API_URL}/compare?${params}`);
      setComparisonData(res.data);
      setActiveTab("comparison");
    } catch (err) {
      console.error("Error comparing players:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearComparison = () => {
    setComparisonPlayers([]);
    setComparisonData([]);
    setCompareMode(false);
  };

  return (
    <div className="app">
      <Header 
        compareMode={compareMode}
        setCompareMode={setCompareMode}
        clearComparison={clearComparison}
        setComparisonPlayers={setComparisonPlayers}
        setComparisonData={setComparisonData}
      />

      <div className="container">
        <Sidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
          teams={teams}
          seasons={seasons}
          filteredPlayers={filteredPlayers}
          selectedPlayer={selectedPlayer}
          handleSelectPlayer={handleSelectPlayer}
          compareMode={compareMode}
          comparisonPlayers={comparisonPlayers}
          handleCompare={handleCompare}
          clearComparison={clearComparison}
          handleShowFilteredStats={handleShowFilteredStats}
          clearFilters={clearFilters}
        />

        <main className="main-content">
          {loading && <div className="loading">Loading...</div>}

          {!loading && activeTab === "filtered" && filteredStatsData.length > 0 && (
            <FilteredStatsView 
              filteredStatsData={filteredStatsData}
              handleSelectPlayer={handleSelectPlayer}
            />
          )}

          {!loading && activeTab === "comparison" && comparisonData.length > 0 && (
            <ComparisonView comparisonData={comparisonData} />
          )}

          {!loading && activeTab === "stats" && playerData && (
            <PlayerView 
              playerData={playerData}
              careerStats={careerStats}
            />
          )}

          {!loading && !playerData && !comparisonData.length && activeTab === "stats" && (
            <div className="empty-state">
              <p> Select a player to view their stats</p>
              <p>Or use Compare Mode to analyze multiple players</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;