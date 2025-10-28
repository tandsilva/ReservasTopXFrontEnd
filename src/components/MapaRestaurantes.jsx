// src/components/MapaRestaurantes.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Corrige ícones do Leaflet no Vite
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

// Util: pega token salvo no login (localStorage) ou cai no token de dev
function getAuthToken() {
  try {
    const saved = JSON.parse(localStorage.getItem("rtx_auth") || "{}");
    return saved?.token || DEV_TOKEN || null;
  } catch {
    return DEV_TOKEN || null;
  }
}

// Ajusta qualquer formato de restaurante para o esperado pelo mapa
function normalizeRestaurant(x) {
  const lat =
    x.lat ??
    x.latitude ??
    (typeof x.coord === "object" ? x.coord.lat : undefined);
  const lng =
    x.lng ??
    x.longitude ??
    (typeof x.coord === "object" ? x.coord.lng : undefined);

  return {
    id: x.id ?? x.restaurantId ?? crypto.randomUUID(),
    nome: x.nome ?? x.nomeFantasia ?? x.fantasia ?? "Restaurante",
    endereco: x.endereco ?? x.address ?? "",
    telefone: x.telefone ?? x.phone ?? "",
    categoria: x.categoria ?? x.category ?? "",
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

  // Centro padrão (Joinville-SC) caso geolocalização falhe
  const defaultCenter = useMemo(() => ({ lat: -26.3045, lng: -48.8487 }), []);
  const mapRef = useRef(null);

  // Geolocalização do usuário
  useEffect(() => {
    let cancelled = false;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) {
            setUserPos({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          }
        },
        () => {
          if (!cancelled) setUserPos(null); // silencioso se negar permissão
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Carregar restaurantes do backend (com token)
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function load() {
      setLoading(true);
      setErro("");
      try {
        const url = `${API_BASE}/restaurants`;
        const token = getAuthToken();
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const r = await fetch(url, { headers, signal });
        if (!r.ok) {
          const txt = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} ${r.statusText} ${txt}`);
        }
        const raw = await r.json();

        // Suporta array direto ou paginação com { content: [...] }
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.content)
          ? raw.content
          : [];

        const mapped = list
          .map(normalizeRestaurant)
          .filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lng));

        setRestaurantes(mapped);
      } catch (e) {
        console.error(e);
        setErro(
          "Não foi possível carregar restaurantes da API. Exibindo dados de exemplo."
        );
        // Mock simples se a API não estiver pronta ou faltam coords
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
          {
            id: 2,
            nome: "Sushi do Jerry",
            endereco: "Av. Central, 500 - Joinville/SC",
            telefone: "(47) 98888-8888",
            categoria: "Japonês",
            email: "hello@sushijerry.com",
            lat: -26.3005,
            lng: -48.8462,
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
    const map = mapRef.current;
    if (!map) return;
    try {
      setCentralizando(true);
      const m = map;
      // react-leaflet expõe a instância via ref.current quando é MapContainer
      const inst = m?.target || m; // fallback
      const leafletMap = inst?.flyTo ? inst : inst?.leafletElement || null;
      const to = [center.lat, center.lng];
      (leafletMap || inst)?.flyTo(to, 13, { duration: 0.6 });
    } finally {
      setTimeout(() => setCentralizando(false), 700);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 12 }}>
        Carregando mapa…
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {!!erro && (
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffeeba",
            color: "#856404",
            padding: 8,
            marginBottom: 8,
            borderRadius: 8,
          }}
        >
          {erro}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button
          onClick={handleCentralizar}
          disabled={centralizando}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          {centralizando ? "Centralizando..." : "Centralizar"}
        </button>
        <div style={{ fontSize: 12, color: "#666" }}>
          {restaurantes.length
            ? `${restaurantes.length} restaurantes`
            : "Nenhum restaurante com coordenadas"}
        </div>
      </div>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: "70vh", width: "100%", borderRadius: 12 }}
        // react-leaflet v4: ref já aponta p/ instância do mapa
        ref={mapRef}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Posição do usuário */}
        {userPos && Number.isFinite(userPos.lat) && Number.isFinite(userPos.lng) && (
          <Marker position={[userPos.lat, userPos.lng]}>
            <Popup>Você está aqui</Popup>
          </Marker>
        )}

        {/* Restaurantes */}
        {restaurantes.map((r) => (
          <Marker key={r.id} position={[r.lat, r.lng]}>
            <Popup>
              <strong>{r.nome}</strong>
              <br />
              {r.categoria && (
                <>
                  Categoria: {r.categoria}
                  <br />
                </>
              )}
              {r.endereco && (
                <>
                  Endereço: {r.endereco}
                  <br />
                </>
              )}
              {r.telefone && (
                <>
                  Tel: {r.telefone}
                  <br />
                </>
              )}
              {r.email && (
                <>
                  Email: {r.email}
                  <br />
                </>
              )}
            </Popup>
          </Marker>
        ))}

        <FitToMarkers points={points} />
      </MapContainer>
    </div>
  );
}
