// src/components/MapaRestaurantes.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "./MapaRestaurantes.css"; // Importando o CSS

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN ?? "";

function getAuthToken() {
  try {
    const saved = JSON.parse(localStorage.getItem("rtx_auth") || "{}");
    return saved?.token || DEV_TOKEN || null;
  } catch {
    return DEV_TOKEN || null;
  }
}

function normalizeRestaurant(x) {
  const lat = x.lat ?? x.latitude ?? x.coord?.lat;
  const lng = x.lng ?? x.longitude ?? x.coord?.lng;

  return {
    id: x.id ?? x.restaurantId ?? crypto.randomUUID(),
    nome: x.nome ?? x.nomeFantasia ?? "Restaurante",
    endereco: x.endereco ?? "",
    telefone: x.telefone ?? "",
    categoria: x.categoria ?? "",
    email: x.email ?? "",
    lat: lat != null ? Number(lat) : undefined,
    lng: lng != null ? Number(lng) : undefined,
  };
}

function FitToMarkers({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !points?.length) return;
    const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    if (!valid.length) return;
    const bounds = L.latLngBounds(valid.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

export default function MapaRestaurantes() {
  const [userPos, setUserPos] = useState(null);
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [centralizando, setCentralizando] = useState(false);
  const defaultCenter = useMemo(() => ({ lat: -26.3045, lng: -48.8487 }), []);
  const mapRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserPos(null),
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function load() {
      setLoading(true);
      setErro("");
      try {
        const r = await fetch(`${API_BASE}/restaurants`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          signal,
        });
        const raw = await r.json();
        const list = Array.isArray(raw) ? raw : raw?.content ?? [];
        const mapped = list.map(normalizeRestaurant).filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lng));
        setRestaurantes(mapped);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar restaurantes da API. Exibindo dados de exemplo.");
        setRestaurantes([
          {
            id: 1,
            nome: "Boteco do Aldrin",
            endereco: "Rua Exemplo, 123 - Joinville/SC",
            telefone: "(47) 99999-9999",
            categoria: "Boteco",
            email: "contato@boteco.com.br",
            lat: -26.3045,
            lng: -48.8487,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const points = useMemo(() => {
    const r = restaurantes.map((r) => ({ lat: r.lat, lng: r.lng }));
    return userPos ? [{ lat: userPos.lat, lng: userPos.lng }, ...r] : r;
  }, [restaurantes, userPos]);

  const center = userPos ?? defaultCenter;

  const handleCentralizar = () => {
    const leafletMap = mapRef.current?.target;
    if (leafletMap?.flyTo) {
      setCentralizando(true);
      leafletMap.flyTo([center.lat, center.lng], 13, { duration: 0.6 });
      setTimeout(() => setCentralizando(false), 700);
    }
  };

  if (loading) return <div className="mapa-loading">Carregando mapa…</div>;

  return (
    <div className="mapa-wrapper">
      <div className="mapa-user-info">
        <div>Bem-vindo, <strong>{JSON.parse(localStorage.getItem("rtx_auth"))?.username ?? "usuário"}</strong></div>
        <div>Pontos acumulados: <strong>125</strong></div>
      </div>

      {!!erro && <div className="mapa-alerta">{erro}</div>}

      <div className="mapa-top">
        <button onClick={handleCentralizar} disabled={centralizando}>
          {centralizando ? "Centralizando..." : "Centralizar"}
        </button>
        <span>
          {restaurantes.length > 0
            ? `${restaurantes.length} restaurantes encontrados`
            : "Nenhum restaurante com coordenadas"}
        </span>
      </div>

      <div className="mapa-container">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          ref={mapRef}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userPos && (
            <Marker position={[userPos.lat, userPos.lng]}>
              <Popup>Você está aqui</Popup>
            </Marker>
          )}
          {restaurantes.map((r) => (
            <Marker key={r.id} position={[r.lat, r.lng]}>
              <Popup>
                <strong>{r.nome}</strong><br />
                {r.categoria && <>Categoria: {r.categoria}<br /></>}
                {r.endereco && <>Endereço: {r.endereco}<br /></>}
                {r.telefone && <>Tel: {r.telefone}<br /></>}
                {r.email && <>Email: {r.email}<br /></>}
              </Popup>
            </Marker>
          ))}
          <FitToMarkers points={points} />
        </MapContainer>
      </div>
    </div>
  );
}
