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

// TODO: Is it ok load this client side? Seems like maybe it is for Mapbox?
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// TODO: How should I make an object in this kind of context?
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

const plantColorPalette = Object.fromEntries(rgbPalette);

const markerPalette = {
  farm: [220, 220, 220, 255],
  plant: [255, 255, 255, 255],
  default: [140, 140, 140, 255],
};

// TODO: Add corporation palette — need to decide how many to actually color at once

const colorPalette = Object.assign({}, plantColorPalette, markerPalette);

export function DeckGLMap() {
  const { stateData, stateMapSettings } = useSnapshot(state);

  // Don't render the component until the data is loaded
  if (!stateData.isDataLoaded) {
    return <div>Loading...</div>;
  }

  const plantAccessLayer = new GeoJsonLayer({
    data: stateData.filteredCaptureAreas,

    pickable: true,
    // TODO: add tooltip back
    onHover: ({ x, y, object }) => {
      state.stateMapSettings.x = x;
      state.stateMapSettings.y = y;
      state.stateMapSettings.hoveredObject = object;
    },

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

  const farmLayer = new IconLayer({
    id: "icon-layer",
    data: stateData.counterglowFarms.features,
    pickable: true,
    iconAtlas:
      "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
    iconMapping: {
      marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
    },

    // TODO: Make farms less chaotic
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
    onHover: ({ x, y, object }) => {
      state.stateMapSettings.x = x;
      state.stateMapSettings.y = y;
      state.stateMapSettings.hoveredObject = object;
    },
  });

  var displayLayers = [plantAccessLayer, plantLayer];

  if (stateMapSettings.displayFarms) {
    displayLayers.push(farmLayer);
  }

  const deck = (
    <DeckGL
      initialViewState={stateMapSettings.mapZoom} // TODO: is there a way to have an initial state and still dynamically update the view?
      controller={true}
      layers={displayLayers}
      pickingRadius={50} //TODO: This behaves strangely and only works when zoomed out?
    >
      <Map
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
      />
      <div id="legend">
        {Object.entries(plantColorPalette).map(([key, color]) => (
          <div key={key}>
            <div
              className="swatch"
              style={{
                background: `rgb(${color.slice(0, 3).join(",")},${
                  color[3] / 255
                })`,
              }}
            ></div>
            <div className="label">{key}</div>
          </div>
        ))}
      </div>
    </DeckGL>
  );

  return deck;
}
