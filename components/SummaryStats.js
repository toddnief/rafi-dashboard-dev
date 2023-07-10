"use client";
import { useState, useEffect } from "react";
import { useSnapshot } from "valtio";

import { state } from "../lib/state";

function calculateHHI(filteredSales) {
  // TODO: should probably make total sales part of the state
  // calculate total sales in selected area
  if (Object.keys(filteredSales).length) {
    let totalSales = Object.values(filteredSales).reduce(
      (acc, item) => acc + item.sales,
      0
    );

    // calculate HHI
    return Object.values(filteredSales).reduce(
      (acc, item) => acc + Math.pow((item.sales * 100) / totalSales, 2),
      0
    );
  } else {
    return 0;
  }
}

function calculateCapturedArea(filteredAreas) {
  let areas = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  // TODO: Need to add area to GeoJSON
  for (let i = 0; i < filteredAreas.length; i++) {
    areas[filteredAreas[i].properties.corporate_access] +=
      filteredAreas[i].properties.area;
  }

  let totalArea = Object.values(areas).reduce((acc, val) => acc + val, 0);

  let percentArea = {};
  Object.keys(areas).forEach((key) => {
    percentArea[key] = areas[key] / totalArea;
  });

  return percentArea;
}

export function SummaryStats() {
  const snapshot = useSnapshot(state.stateData);

  if (!snapshot.isDataLoaded) {
    return <div>Loading...</div>;
  }

  const calculatedHHI = calculateHHI(snapshot.filteredSales);
  const capturedAreas = calculateCapturedArea(snapshot.filteredCaptureAreas);

  return (
    <div>
      {calculatedHHI ? (
        <div className="m-2">
          <h2 className="text-2xl font-bold text-center">
            HHI for Selected States
          </h2>
          <p className="text-center">{calculatedHHI.toFixed(0)}</p>
        </div>
      ) : (
        "No data available"
      )}
      {/* <div className="max-h-[75%] overflow-y-auto">
        {snapshot.filteredCaptureAreas &&
        Object.keys(snapshot.filteredCaptureAreas).length > 0 ? (
          <table className="table table-sm">
            <thead className="sticky">
              <tr>
                <th>Percent of Area With Plant Access</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(capturedAreas).map(([key, item]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{(item * 100).toFixed(1) + "%"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          ""
        )}
      </div> */}
      <div className="max-h-[50vh] overflow-y-auto">
        {snapshot.filteredSales &&
        Object.keys(snapshot.filteredSales).length > 0 ? (
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Company</th>
                <th>Sales</th>
                <th>Percent of Sales</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(snapshot.filteredSales).map(([key, item]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>
                    {(item.sales * 1000).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    })}
                  </td>
                  <td>{(item.percent * 100).toFixed(1) + "%"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
