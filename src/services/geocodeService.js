export async function reverseGeocode(lat, lon) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("zoom", "10");

  const res = await fetch(url.toString(), {
    headers: { "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" },
  });
  if (!res.ok) throw new Error("Falha no reverse geocode");
  const data = await res.json();
  const a = data.address || {};
  return (
    a.city || a.town || a.village || a.municipality || a.county || "Cidade desconhecida"
  );
}

export async function geocodeCity(query) {
  if (!query?.trim()) return null;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" },
  });
  if (!res.ok) return null;
  const arr = await res.json();
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) };
}
