// src/controllers/mapController.js
import { listRestaurants } from "../services/restaurantsService";
import { reverseGeocode, geocodeCity } from "../services/geocodeService";

export async function getUserCoords() {
  if (!("geolocation" in navigator)) throw new Error("Geolocalização não suportada");
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new Error(err.message || "Não foi possível obter a localização")),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
  });
}

// Agora ignora coords; só lista todos
export async function fetchRestaurantsAround(/* coords, radiusKm = 25 */) {
  return listRestaurants();
}

export async function coordsToCity(coords) {
  return reverseGeocode(coords.lat, coords.lon);
}

export async function searchCityCoords(query) {
  return geocodeCity(query);
}
