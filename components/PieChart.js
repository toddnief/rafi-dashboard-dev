"use client";
import React, { useState, useEffect } from "react";
import { useSnapshot } from "valtio";

import { state } from "../lib/state";

import { Pie } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";
Chart.register(ArcElement);

export default function PieChart() {
  const snapshot = useSnapshot(state.stateData);

  if (!snapshot.isDataLoaded) {
    return <div>Loading...</div>;
  }

  console.log("Object.keys(snapshot.filteredSales)");
  console.log(Object.keys(snapshot.filteredSales));

  const chartData = {
    labels: Object.keys(snapshot.filteredSales),
    datasets: [
      {
        data: Object.values(snapshot.filteredSales),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          // Add more colors as needed
        ],
      },
    ],
  };

  return (
    <Pie
      data={chartData}
      options={{
        responsive: true,
        legend: {
          display: true,
          // position: 'top', // you can change this to 'top', 'left', 'bottom'
          // labels: {
          //     fontColor: '#333', // set your desired color
          //     // you can add more label styling options here
          // },
        },
      }}
    />
  );
}
