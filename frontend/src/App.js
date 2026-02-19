import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PlayerView from "./components/PlayerView";
import ComparisonView from "./components/ComparisonView";
import FilteredStatsView from "./components/FilteredStatsview";
import "./App.css";

// The base URL for our backend API
const API_URL = "http://127.0.0.1:5000";

function App() {

  //LIST DATA (loaded once on startup)
  const [allPlayers, setAllPlayers] = useState([]);   // every player from the API
  const [teams, setTeams] = useState([]);             // every team for the dropdown
  const [seasons, setSeasons] = useState([]);         // every season for the dropdown

  //FILTER STATE
  const [searchTerm, setSearchTerm] = useState("");       // text the user types
  const [selectedTeam, setSelectedTeam] = useState("");   // chosen team dropdown value
  const [selectedSeason, setSelectedSeason] = useState(""); // chosen season dropdown value

  //SELECTED PLAYER STATE
  const [selectedPlayerID, setSelectedPlayerID] = useState(null); // the clicked player's ID
  const [playerData, setPlayerData] = useState(null);             // that player's season stats
  const [careerStats, setCareerStats] = useState(null);           // that player's career averages

  //COMPARE MODE STATE
  const [compareMode, setCompareMode] = useState(false);           // is compare mode on?
  const [comparisonPlayerIDs, setComparisonPlayerIDs] = useState([]); // IDs of players to compare
  const [comparisonData, setComparisonData] = useState([]);           // data returned from compare API

  //FILTERED STATS STATE
  const [filteredStatsData, setFilteredStatsData] = useState([]); // results from "Show Stats Table"

  //UI STATE
  const [activeTab, setActiveTab] = useState("stats"); // which view to show: "stats", "comparison", "filtered"
  const [loading, setLoading] = useState(false);       // show a loading message?


  //Load players, teams, and seasons when the app first opens
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      //Fetch all three lists at the same time (faster than one-by-one)
      const [playersRes, teamsRes, seasonsRes] = await Promise.all([
        axios.get(`${API_URL}/players`),
        axios.get(`${API_URL}/teams`),
        axios.get(`${API_URL}/seasons`),
      ]);

      setAllPlayers(playersRes.data);
      setTeams(teamsRes.data);
      setSeasons(seasonsRes.data);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  }


  // Filter the player list whenever the user changes a filter.
  // Team/season filtering happens on the API side.
  // Name search is done here in the browser (no extra API call needed).
  useEffect(() => {
    fetchFilteredPlayers();
  }, [selectedTeam, selectedSeason]); // only re-fetch when team or season changes

  async function fetchFilteredPlayers() {
    try {
      // Build the query string, e.g. "?team=LAL&season=2020"
      const params = new URLSearchParams();
      if (selectedTeam) params.append("team", selectedTeam);
      if (selectedSeason) params.append("season", selectedSeason);

      const url = params.toString()
        ? `${API_URL}/players?${params.toString()}`
        : `${API_URL}/players`;

      const res = await axios.get(url);
      setAllPlayers(res.data); // update the full list so name search works on the right subset
    } catch (error) {
      console.error("Failed to fetch filtered players:", error);
    }
  }

  //This is the final list shown in the sidebar.
  const visiblePlayers = allPlayers.filter((player) =>
    player.playerName.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // When the user clicks a player in the sidebar
  async function handleSelectPlayer(playerID) {
    //If compare mode is on, add/remove the player from the comparison list
    if (compareMode) {
      const alreadySelected = comparisonPlayerIDs.includes(playerID);

      if (alreadySelected) {
        //Remove them if they were already selected
        setComparisonPlayerIDs(comparisonPlayerIDs.filter((id) => id !== playerID));
      } else if (comparisonPlayerIDs.length < 3) {
        //Add them if we haven't hit the 3-player limit
        setComparisonPlayerIDs([...comparisonPlayerIDs, playerID]);
      }
      return; // stop here — don't load the individual player view
    }

    //Normal mode: load the individual player's stats
    setLoading(true);
    setSelectedPlayerID(playerID);
    setActiveTab("stats");
    setFilteredStatsData([]); // clear any previous filtered stats view

    try {
      //Fetch both season stats and career averages at the same time
      const [statsRes, careerRes] = await Promise.all([
        axios.get(`${API_URL}/player/${playerID}`),
        axios.get(`${API_URL}/player/${playerID}/career`),
      ]);
      setPlayerData(statsRes.data);
      setCareerStats(careerRes.data);
    } catch (error) {
      console.error("Failed to fetch player data:", error);
    } finally {
      setLoading(false);
    }
  }


  // When the user clicks "Compare Now"
  async function handleCompare() {
    if (comparisonPlayerIDs.length < 2) return; // need at least 2 players

    setLoading(true);

    try {
      //Build a query like "?playerID=1&playerID=2&playerID=3"
      const query = comparisonPlayerIDs.map((id) => `playerID=${id}`).join("&");
      const res = await axios.get(`${API_URL}/compare?${query}`);
      setComparisonData(res.data);
      setActiveTab("comparison");
    } catch (error) {
      console.error("Failed to compare players:", error);
    } finally {
      setLoading(false);
    }
  }


  // When the user clicks "Show Stats Table"
  async function handleShowFilteredStats() {
    setLoading(true);
    setActiveTab("filtered");

    try {
      const params = new URLSearchParams();
      if (selectedTeam) params.append("team", selectedTeam);
      if (selectedSeason) params.append("season", selectedSeason);
      if (searchTerm) params.append("player", searchTerm);

      const res = await axios.get(`${API_URL}/stats?${params.toString()}`);
      setFilteredStatsData(res.data);
    } catch (error) {
      console.error("Failed to fetch filtered stats:", error);
    } finally {
      setLoading(false);
    }
  }



  // Reset all filters and clear the view
  function clearFilters() {
    setSearchTerm("");
    setSelectedTeam("");
    setSelectedSeason("");
    setFilteredStatsData([]);
    setActiveTab("stats");
  }


  // Reset comparison state
  function clearComparison() {
    setComparisonPlayerIDs([]);
    setComparisonData([]);
    setCompareMode(false);
  }


  // Render
  return (
    <div className="app">
      <Header
        compareMode={compareMode}
        setCompareMode={setCompareMode}
        clearComparison={clearComparison}
        setComparisonPlayerIDs={setComparisonPlayerIDs}
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
          visiblePlayers={visiblePlayers}
          selectedPlayerID={selectedPlayerID}
          handleSelectPlayer={handleSelectPlayer}
          compareMode={compareMode}
          comparisonPlayerIDs={comparisonPlayerIDs}
          handleCompare={handleCompare}
          clearComparison={clearComparison}
          handleShowFilteredStats={handleShowFilteredStats}
          clearFilters={clearFilters}
        />

        <main className="main-content">
          {/* Show a loading message while waiting for data */}
          {loading && <div className="loading">Loading...</div>}

          {/* Filtered stats card grid */}
          {!loading && activeTab === "filtered" && filteredStatsData.length > 0 && (
            <FilteredStatsView
              filteredStatsData={filteredStatsData}
              handleSelectPlayer={handleSelectPlayer}
            />
          )}

          {/* Side-by-side player comparison */}
          {!loading && activeTab === "comparison" && comparisonData.length > 0 && (
            <ComparisonView comparisonData={comparisonData} />
          )}

          {/* Individual player stats */}
          {!loading && activeTab === "stats" && playerData && (
            <PlayerView playerData={playerData} careerStats={careerStats} />
          )}

          {/* Default empty state — nothing selected yet */}
          {!loading && !playerData && comparisonData.length === 0 && activeTab === "stats" && (
            <div className="empty-state">
              <p>Select a player to view their stats</p>
              <p>Or use Compare Mode to analyze multiple players</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;