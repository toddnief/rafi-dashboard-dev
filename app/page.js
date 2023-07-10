"use client";
import React, { useState, useEffect, useRef } from "react";
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

  // Handling resizing of container to dynamically update map bounding box
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        const height = containerRef.current.getBoundingClientRect().height;
        state.stateMapSettings.containerWidth = width;
        state.stateMapSettings.containerHeight = height;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
        <div style={{ position: "relative", flex: "3" }} ref={containerRef}>
          <Tooltip />
          <DeckGLMap />
        </div>
        <div style={{ flex: ".5" }}>
          <ControlPanel />
        </div>
        <div style={{ flex: "1.5" }}>
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
