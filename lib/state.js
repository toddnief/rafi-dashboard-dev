"use client"
import { proxy, useSnapshot } from 'valtio'

// Create a proxy state
export const state = proxy({
    // basic data
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

    // map view
    mapZoom: {
        longitude: -90.9712,
        latitude: 40.7831,
        zoom: 3.5,
        pitch: 0,
        bearing: 0
    },

    isDataLoaded: false,
})

function updateFilteredStates() {
    // choose the filtered areas to display
    state.filteredCaptureAreas = state.plantAccess.features.filter(
        row => {
            if (state.filteredStates.includes(row.properties.state)) {
                return true
            } else {
                return false
            }
        })
}

function updateFilteredPlants() {
    state.filteredPlants = state.poultryPlants.features.filter(
        row => {
            if (state.filteredStates.includes(row.properties.State)) {
                return true
            } else {
                return false
            }
        })
}

function updateFilteredCompanies() {
    state.filteredCompanies = state.filteredPlants.map(
        plant => plant.properties["Parent Corporation"]).filter((value, index, array) => array.indexOf(value) === index)
}

function updateFilteredSales() {
    // build dictionary for each company in the area
    let companySales = {}
    for (let i = 0; i < state.filteredCompanies.length; i++) {
        companySales[state.filteredCompanies[i]] = 0
    }

    for (let i = 0; i < state.filteredPlants.length; i++) {
        let salesVolume = state.filteredPlants[i].properties["Sales Volume (Location)"]
        if (!Number.isNaN(salesVolume)) {
            companySales[state.filteredPlants[i].properties["Parent Corporation"]] += salesVolume
        }
    }

    // filter NaN values and return dictionary
    let filtered = Object.entries(companySales).reduce((filtered, [key, value]) => {
        if (!Number.isNaN(value)) {
            filtered[key] = value
        }
        return filtered
    }, {})

    // sort on value
    let sorted = Object.entries(filtered).sort((a, b) => b[1] - a[1])

    // return Object.fromEntries(sorted)
    state.filteredSales = Object.fromEntries(sorted)
}

export function updateFilteredData() {
    updateFilteredStates()
    updateFilteredPlants()
    updateFilteredCompanies()
    updateFilteredSales()
}