"use client";
// app.js
import React, { useState, useEffect } from "react";
import { useSnapshot } from "valtio";

import { state, updateFilteredData } from "../lib/state";

import "tailwindcss/tailwind.css";
import "../styles/styles.css";

export default function ControlPanel() {
  const snapshot = useSnapshot(state);

  if (!snapshot.isDataLoaded) {
    return <div>Loading...</div>;
  }

  const handleCheckboxChange = (event) => {
    const { checked, value } = event.target;

    // adjust filtered states
    if (checked) {
      state.filteredStates.push(value);
    } else {
      const index = state.filteredStates.indexOf(value);
      if (index !== -1) {
        state.filteredStates.splice(index, 1);
      }
    }

    updateFilteredData();
  };

  const selectAll = () => {
    state.filteredStates = [...state.allStates];
    updateFilteredData();
  };

  const selectNone = () => {
    state.filteredStates.length = 0;
    updateFilteredData();
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      {snapshot.allStates.map((option, index) => (
        <label key={index} className="block mt-4 checkbox-label">
          <span className="text-gray-700">{option}</span>
          <input
            className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            value={option}
            type="checkbox"
            checked={snapshot.filteredStates.includes(option)}
            onChange={handleCheckboxChange}
          />
        </label>
      ))}
      <button onClick={selectAll}>Select All</button>
      <button onClick={selectNone}>Select None</button>
    </div>
  );
}
