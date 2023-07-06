"use client";
import React, { useState, useEffect } from "react";
import { proxy, useSnapshot } from "valtio";

import { loadData } from "../lib/data";
import { state } from "../lib/state";

import { DeckGLMap } from "../components/DeckGLMap";
import { SummaryStats } from "../components/SummaryStats";
import ControlPanel from "../components/ControlPanel";
import PieChart from "../components/PieChart";
import Tooltip from "../components/Tooltip";

import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/styles.css";
// import styles from "./page.module.css"; //TODO: unsure about styles import

export default function Home() {
  // load JSON and CSV data
  useEffect(() => {
    loadData();
  }, []);

  const snapshot = useSnapshot(state);

  // if (!snapshot.isDataLoaded) {
  //   return <div>Loading...</div>
  // }

  return (
    <div>
      <h1>Please Show a Map</h1>
      {/* <div className={styles["map-container"]}> */}
      <div
        style={{
          minHeight: "600px",
          height: "calc(100vh - 600px)",
          width: "100%",
          display: "flex",
        }}
      >
        <div style={{ position: "relative", flex: "3" }}>
          <Tooltip />
          <DeckGLMap />
        </div>
        <div style={{ flex: "1" }}>
          <ControlPanel />
        </div>
        <div style={{ flex: "1" }}>
          <div style={{ position: "relative", height: "25%" }}>
            <PieChart />
          </div>
          <div style={{ position: "relative", height: "75%" }}>
            <SummaryStats />
          </div>
        </div>
      </div>
    </div>
  );
}
