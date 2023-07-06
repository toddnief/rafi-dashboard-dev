"use client";
import Papa from "papaparse";
import { coords2geo } from "geotoolbox";

import { state, updateFilteredData } from "../lib/state";

const POULTRY_PLANTS_CSV = "../data/poultry_plants_with_sales.csv";
const PLANT_ACCESS_GEOJSON = "../data/all_states.geojson";
const COUNTERGLOW_FARS = "../data/counterglow_geojson.geojson";

const getJSON = async (dataPath) => {
  const response = await fetch(dataPath);
  return await response.json();
};

const getPoultryCSV = async (dataPath) => {
  const response = await fetch(dataPath);
  const reader = response.body.getReader();
  const result = await reader.read(); // raw array
  const decoder = new TextDecoder("utf-8");
  const csv = decoder.decode(result.value);

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: true,
      complete: (results) => {
        const data = results.data.map((row) => ({
          ...row,
          "Sales Volume (Location)": parseFloat(row["Sales Volume (Location)"]),
        }));

        resolve(data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Function to load data
export const loadData = async () => {
  // Read raw files
  state.plantAccess = await getJSON(PLANT_ACCESS_GEOJSON);
  state.allStates = state.plantAccess.features
    .map((feature) => feature.properties.state)
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort();
  state.counterglowFarms = await getJSON(COUNTERGLOW_FARS);

  // Filter FSIS plant data
  const rawPlants = await getPoultryCSV(POULTRY_PLANTS_CSV);
  const rawPoultryPlants = rawPlants.filter((row) => {
    if (row["Animals Processed"] === "Chicken" && row.Size === "Large") {
      return true;
    } else {
      return false;
    }
  });
  state.poultryPlants = coords2geo(rawPoultryPlants, {
    lat: "latitude",
    lng: "longitude",
  });

  // Initialize display data
  state.filteredStates = [...state.allStates]; // Start with all states selected
  updateFilteredData();
  state.isDataLoaded = true;
};
