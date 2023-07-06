"use client";
// app.js
import React, { useState, useEffect } from "react";
import { proxy, useSnapshot } from "valtio";

import { state } from "../lib/state";

import DeckGL from "@deck.gl/react";
import { LineLayer, IconLayer, GeoJsonLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl";

import colorbrewer from "colorbrewer";
import tinycolor from "tinycolor2";
// import bbox from "@turf/bbox";

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoidG9kZG5pZWYiLCJhIjoiY2xncGpwZnRtMHR0aTNxcDlkN3FzY3h0eiJ9.dGj0-yOWwF05hS7qeb_SVw";

const plantColorPalette = (() => {
  const plantAccessColors = colorbrewer.Set3[4];
  const plantAccess = ["One Plant", "Two Plants", "Three Plants", "4+ Plants"];

  const hexPalette = Object.fromEntries(
    plantAccess.map((access, i) => [access, plantAccessColors[i]])
  );
  const rgbPalette = Object.entries(hexPalette).map(([key, hex]) => {
    return [key, Object.values(tinycolor(hex).toRgb())];
  });

  for (let key in rgbPalette) {
    let rgb = rgbPalette[key][1];
    rgb[3] = 255;
    rgbPalette[key][1] = rgb;
  }

  return Object.fromEntries(rgbPalette);
})();

const markerPalette = {
  farm: [220, 220, 220, 255],
  plant: [255, 255, 255, 255],
  default: [140, 140, 140, 255],
};

const colorPalette = (() => {
  // return Object.assign(plantColorPalette, corpColorPalette, markerPalette)
  return Object.assign(plantColorPalette, markerPalette);
})();

// TODO: I'm unsure how to set this up so that it gets the size of the container that this is contained in
function calculateZoom() {
  const currentGeojson = {
    type: "FeatureCollection",
    features: state.filteredCaptureAreas,
  };
  let bbox = bbox(currentGeojson);
  let width = container.getBoundingClientRect().width;
  let height = container.getBoundingClientRect().height;
  let fittedViewport = new deck.WebMercatorViewport({ width, height });
  let currentLatLonZoom = fittedViewport.fitBounds(
    [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]],
    ],
    { width, height }
  );
}

export function DeckGLMap() {
  // Get a snapshot of the current state
  const { stateData, stateMapSettings } = useSnapshot(state);

  // console.log(useSnapshot(state));

  // console.log(dataSnap);

  // Don't render the component until the data is loaded
  if (!stateData.isDataLoaded) {
    return <div>Loading...</div>;
  }

  // console.log(snapshot.poultryPlants)

  const plantAccessLayer = new GeoJsonLayer({
    // data: snapshot.stateAccessShapes,
    data: stateData.filteredCaptureAreas,

    pickable: true,
    // TODO: maybe add tooltip back
    // onHover: onHoverPlantAccess,

    getFillColor: function (dataRow) {
      switch (dataRow.properties.plant_access) {
        case 1:
          return colorPalette["One Plant"];
        case 2:
          return colorPalette["Two Plants"];
        case 3:
          return colorPalette["Three Plants"];
        case 4:
          return colorPalette["4+ Plants"];
      }
    },
  });

  // console.log(counterglowFarms)

  const farmLayer = new IconLayer({
    id: "icon-layer",
    data: stateData.counterglowFarms.features,
    pickable: true,
    iconAtlas:
      "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
    iconMapping: {
      marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
    },

    //TODO: Make farms less chaotic
    getIcon: (d) => "marker",
    getPosition: (d) => d.geometry.coordinates,
    getSize: (d) => 10,
    getColor: (d) => colorPalette.farm,
  });

  const plantLayer = new IconLayer({
    id: "icon-layer",
    data: stateData.poultryPlants.features,
    iconAtlas:
      "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
    iconMapping: {
      marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
    },
    getIcon: (d) => "marker",
    getPosition: (d) => d.geometry.coordinates,
    getSize: 35,
    getColor: colorPalette.plant,
    getTooltip: (d) => `Address: ${d.properties["Full Address"]}`,

    pickable: true,
    // onHover: onHoverPlant
  });

  const deck = (
    <DeckGL
      initialViewState={stateMapSettings.mapZoom}
      controller={true}
      layers={[plantAccessLayer, plantLayer, farmLayer]}
      pickingRadius={200} //TODO: is this right?
    >
      <Map
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
      />
    </DeckGL>
  );

  return deck;
}
