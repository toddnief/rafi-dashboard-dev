"use client";
import { proxy, useSnapshot } from "valtio";
import bbox from "@turf/bbox";
import { WebMercatorViewport } from "@deck.gl/core";

//TODO: This isn't quite right for the default view
const DEFAULT_ZOOM = {
  longitude: -90.9712,
  latitude: 40.7831,
  zoom: 3.5,
  pitch: 0,
  bearing: 0,
};

// Create a proxy state
export const state = proxy({
  // basic data
  stateData: {
    counterglowFarms: [],
    plantAccess: [],
    poultryPlants: [],
    allStates: [],

    // filtered data
    filteredStates: [],
    filteredPlants: [],
    filteredCaptureAreas: [],
    filteredCompanies: [],
    filteredSales: [],
    isDataLoaded: false,
  },

  //TODO: Unsure about the best practices for how to load and manage these nested states
  stateMapSettings: {
    // cursor state
    x: undefined,
    y: undefined,
    hoveredObject: undefined,

    // display options
    displayFarms: false,

    // map view
    containerWidth: 0,
    containerHeight: 0,
    mapZoom: DEFAULT_ZOOM,
  },
});

function updateFilteredStates() {
  // choose the filtered areas to display
  state.stateData.filteredCaptureAreas =
    state.stateData.plantAccess.features.filter((row) => {
      if (state.stateData.filteredStates.includes(row.properties.state)) {
        return true;
      } else {
        return false;
      }
    });
}

function updateFilteredPlants() {
  state.stateData.filteredPlants =
    state.stateData.poultryPlants.features.filter((row) => {
      if (state.stateData.filteredStates.includes(row.properties.State)) {
        return true;
      } else {
        return false;
      }
    });
}

function updateFilteredCompanies() {
  state.stateData.filteredCompanies = state.stateData.filteredPlants
    .map((plant) => plant.properties["Parent Corporation"])
    .filter((value, index, array) => array.indexOf(value) === index);
}

function updateFilteredSales() {
  // build dictionary for each company in the area
  let companySales = {};
  for (let i = 0; i < state.stateData.filteredCompanies.length; i++) {
    companySales[state.stateData.filteredCompanies[i]] = 0;
  }

  for (let i = 0; i < state.stateData.filteredPlants.length; i++) {
    let salesVolume =
      state.stateData.filteredPlants[i].properties["Sales Volume (Location)"];
    if (!Number.isNaN(salesVolume)) {
      companySales[
        state.stateData.filteredPlants[i].properties["Parent Corporation"]
      ] += salesVolume;
    }
  }

  // filter NaN values and return dictionary
  let filtered = Object.entries(companySales).reduce(
    (filtered, [key, value]) => {
      if (!Number.isNaN(value)) {
        filtered[key] = value;
      }
      return filtered;
    },
    {}
  );

  // sort on value and convert to object
  let sorted = Object.entries(filtered).sort((a, b) => b[1] - a[1]);
  let unnestedSales = Object.fromEntries(sorted);

  const totalSales = Object.values(unnestedSales).reduce(
    (accumulator, value) => {
      return accumulator + value;
    },
    0
  );

  // create nested object for each corporation
  let nestedSales = {};
  for (let key in unnestedSales) {
    nestedSales[key] = {
      sales: unnestedSales[key],
      percent: unnestedSales[key] / totalSales,
    };
  }
  state.stateData.filteredSales = nestedSales;
}

function updateMapZoom() {
  if (
    !Array.isArray(state.stateData.filteredStates) ||
    !state.stateData.filteredStates.length
  ) {
    state.stateMapSettings.mapZoom = DEFAULT_ZOOM;
    return;
  }

  const currentGeojson = {
    type: "FeatureCollection",
    features: state.stateData.filteredCaptureAreas,
  };
  const boundingBox = bbox(currentGeojson);
  const fittedViewport = new WebMercatorViewport(
    state.stateMapSettings.containerWidth,
    state.stateMapSettings.containerHeight
  );

  const currentLatLonZoom = fittedViewport.fitBounds(
    [
      [boundingBox[0], boundingBox[1]],
      [boundingBox[2], boundingBox[3]],
    ],
    {
      width: state.stateMapSettings.containerWidth,
      height: state.stateMapSettings.containerHeight,
    }
  );

  state.stateMapSettings.mapZoom = {
    longitude: currentLatLonZoom.longitude,
    latitude: currentLatLonZoom.latitude,
    zoom: currentLatLonZoom.zoom, //TODO: The zoom is very wrong here?
    // zoom: 3.5,

    // longitude: -90.9712,
    // latitude: 40.7831,

    pitch: 0,
    bearing: 0,
  };
}

export function updateFilteredData() {
  updateFilteredStates();
  updateFilteredPlants();
  updateFilteredCompanies();
  updateFilteredSales();
  updateMapZoom();
}
