"use client";
import { useState, useEffect } from "react";
import { useSnapshot } from "valtio";

import { state } from "../lib/state";

function calculateHHI(filteredSales) {
  if (Object.keys(filteredSales).length) {
    let totalSales = Object.values(filteredSales).reduce(
      (acc, val) => acc + val
    );
    return Object.values(filteredSales).reduce(
      (acc, val) => acc + Math.pow((val * 100) / totalSales, 2),
      0
    );
  } else {
    return 0;
  }
}

export function SummaryStats() {
  const snapshot = useSnapshot(state.stateData);

  if (!snapshot.isDataLoaded) {
    return <div>Loading...</div>;
  }

  const calculatedHHI = calculateHHI(snapshot.filteredSales);

  return (
    <div>
      {calculatedHHI ? (
        <div>
          <h2>HHI for Selected States</h2>
          <p>{calculatedHHI.toFixed(0)}</p>
        </div>
      ) : (
        "No data available"
      )}
      <div>
        {snapshot.filteredSales &&
        Object.keys(snapshot.filteredSales).length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Sales</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(snapshot.filteredSales).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>
                    {(value * 1000).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    })}
                  </td>
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
