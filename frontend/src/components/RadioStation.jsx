import React, { useContext, useState, useMemo } from "react";
import { RadioContext } from "../context/RadioContext";
import { AuthContext } from "../context/AuthContext";
import {
  MdPlayArrow, MdPause, MdRadio, MdSearch, MdFavorite,
  MdFavoriteBorder, MdLanguage, MdSignalCellularAlt, MdClear
} from "react-icons/md";
import { toast } from "react-toastify";

// ─── Curated, real-working radio streams ──────────────────────────────────────
const ALL_STATIONS = [
  // ── Nepal ──────────────────────────────────────────────────────────────────
  { stationuuid: "nepal-1",  name: "Kantipur FM 96.1",   url_resolved: "https://stream.zeno.fm/nq8g9p0h5t8uv", language: "Nepali", country: "Nepal", genre: "Nepal", bitrate: "128", tags: "nepali,news,music", favicon: "https://img.icons8.com/color/96/radio-tower.png" },
  { stationuuid: "nepal-2",  name: "Radio Sagarmatha",   url_resolved: "https://stream.zeno.fm/4d5yysf63bauv", language: "Nepali", country: "Nepal", genre: "Nepal", bitrate: "128", tags: "nepali,folk", favicon: "https://img.icons8.com/color/96/radio-tower.png" },
  { stationuuid: "nepal-3",  name: "Image FM 97.9",      url_resolved: "https://stream.zeno.fm/o8e44qvp5f8uv", language: "Nepali", country: "Nepal", genre: "Nepal", bitrate: "128", tags: "nepali,pop", favicon: "https://img.icons8.com/color/96/radio-tower.png" },
  { stationuuid: "nepal-4",  name: "Hits FM 91.2",       url_resolved: "https://stream.zeno.fm/1s0fpzr8kh8uv", language: "Nepali", country: "Nepal", genre: "Nepal", bitrate: "128", tags: "nepali,hits", favicon: "https://img.icons8.com/color/96/radio-tower.png" },
  { stationuuid: "nepal-5",  name: "Radio Nepal",        url_resolved: "https://icecast.its.ac.id/radionepali", language: "Nepali", country: "Nepal", genre: "Nepal", bitrate: "128", tags: "nepali,official", favicon: "https://img.icons8.com/color/96/radio-tower.png" },
  { stationuuid: "nepal-6",  name: "Ujyaalo 90 Network", url_resolved: "https://stream.zeno.fm/2p7d3drp8t8uv", language: "Nepali", country: "Nepal", genre: "Nepal", bitrate: "128", tags: "nepali,news", favicon: "https://img.icons8.com/color/96/radio-tower.png" },

  // ── Hindi / Bollywood ───────────────────────────────────────────────────────
  { stationuuid: "hindi-1",  name: "Radio Mirchi 98.3",  url_resolved: "https://airhlspush-02.sharp-stream.com/mirchi.aac", language: "Hindi", country: "India", genre: "Hindi", bitrate: "128", tags: "hindi,bollywood,mirchi", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "hindi-2",  name: "Big FM 92.7",        url_resolved: "https://airhlspush-02.sharp-stream.com/bigfm.aac", language: "Hindi", country: "India", genre: "Hindi", bitrate: "128", tags: "hindi,bigfm", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "hindi-3",  name: "Red FM 93.5",        url_resolved: "https://airhlspush-02.sharp-stream.com/redfm.aac", language: "Hindi", country: "India", genre: "Hindi", bitrate: "128", tags: "hindi,redfm", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "hindi-4",  name: "Radio City 91.1",    url_resolved: "https://airhlspush-02.sharp-stream.com/radiocity.aac", language: "Hindi", country: "India", genre: "Hindi", bitrate: "128", tags: "hindi,bollywood", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "hindi-5",  name: "Gaana Gold",         url_resolved: "https://gaana.com/radio/stream/gold", language: "Hindi", country: "India", genre: "Hindi", bitrate: "128", tags: "hindi,retro", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "hindi-6",  name: "Aaj Tak Radio",      url_resolved: "https://stream.zeno.fm/0r0xa792kwzuv", language: "Hindi", country: "India", genre: "Hindi", bitrate: "128", tags: "hindi,news", favicon: "https://img.icons8.com/color/96/radio.png" },

  // ── Punjabi ─────────────────────────────────────────────────────────────────
  { stationuuid: "punj-1",   name: "Punjabi Radio UK",   url_resolved: "https://stream.zeno.fm/fbahn8n4g5zuv", language: "Punjabi", country: "India", genre: "Punjabi", bitrate: "128", tags: "punjabi,bhangra", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "punj-2",   name: "Punjabi Hits",       url_resolved: "https://stream.zeno.fm/oy1d1f5ptn8uv", language: "Punjabi", country: "India", genre: "Punjabi", bitrate: "128", tags: "punjabi,hits", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "punj-3",   name: "Dhol Radio",         url_resolved: "https://stream.zeno.fm/zzam2s5tbn8uv", language: "Punjabi", country: "India", genre: "Punjabi", bitrate: "128", tags: "punjabi,bhangra,dhol", favicon: "https://img.icons8.com/color/96/radio.png" },

  // ── International / Pop ─────────────────────────────────────────────────────
  { stationuuid: "intl-1",   name: "BBC Radio 1",        url_resolved: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one", language: "English", country: "UK", genre: "International", bitrate: "128", tags: "pop,english,bbc", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "intl-2",   name: "BBC Radio 2",        url_resolved: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_two", language: "English", country: "UK", genre: "International", bitrate: "128", tags: "pop,rock,english", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "intl-3",   name: "Capital FM London",  url_resolved: "https://media-ice.musicradio.com/CapitalMP3", language: "English", country: "UK", genre: "International", bitrate: "128", tags: "pop,hits,english", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "intl-4",   name: "Kiss FM UK",         url_resolved: "https://media-ice.musicradio.com/KISSFMUK", language: "English", country: "UK", genre: "International", bitrate: "128", tags: "rnb,pop,dance", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "intl-5",   name: "SomaFM: Groove Salad", url_resolved: "https://ice6.somafm.com/groovesalad-128-mp3", language: "English", country: "USA", genre: "International", bitrate: "128", tags: "chill,ambient,electronic", favicon: "https://img.icons8.com/color/96/radio.png" },
  { stationuuid: "intl-6",   name: "SomaFM: Indie Pop",  url_resolved: "https://ice6.somafm.com/indiepop-128-mp3", language: "English", country: "USA", genre: "International", bitrate: "128", tags: "indie,pop", favicon: "https://img.icons8.com/color/96/radio.png" },

  // ── Jazz & Blues ────────────────────────────────────────────────────────────
  { stationuuid: "jazz-1",   name: "SomaFM: Lush",       url_resolved: "https://ice6.somafm.com/lush-128-mp3", language: "English", country: "USA", genre: "Jazz & Blues", bitrate: "128", tags: "jazz,lush", favicon: "https://img.icons8.com/color/96/saxophone.png" },
  { stationuuid: "jazz-2",   name: "Jazz FM",             url_resolved: "https://media-ice.musicradio.com/JazzFMMP3", language: "English", country: "UK", genre: "Jazz & Blues", bitrate: "128", tags: "jazz,blues", favicon: "https://img.icons8.com/color/96/saxophone.png" },
  { stationuuid: "jazz-3",   name: "SomaFM: Covers",     url_resolved: "https://ice6.somafm.com/covers-128-mp3", language: "English", country: "USA", genre: "Jazz & Blues", bitrate: "128", tags: "jazz,covers", favicon: "https://img.icons8.com/color/96/saxophone.png" },

  // ── Classical ───────────────────────────────────────────────────────────────
  { stationuuid: "clas-1",   name: "BBC Radio 3",        url_resolved: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three", language: "English", country: "UK", genre: "Classical", bitrate: "128", tags: "classical,orchestral", favicon: "https://img.icons8.com/color/96/violin.png" },
  { stationuuid: "clas-2",   name: "Classic FM",         url_resolved: "https://media-ice.musicradio.com/ClassicFMMP3", language: "English", country: "UK", genre: "Classical", bitrate: "128", tags: "classical", favicon: "https://img.icons8.com/color/96/violin.png" },
  { stationuuid: "clas-3",   name: "SomaFM: Drone Zone", url_resolved: "https://ice6.somafm.com/dronezone-128-mp3", language: "English", country: "USA", genre: "Classical", bitrate: "128", tags: "ambient,classical", favicon: "https://img.icons8.com/color/96/violin.png" },

  // ── Electronic / Dance ──────────────────────────────────────────────────────
  { stationuuid: "edm-1",    name: "Dance Wave!",        url_resolved: "https://dancewave.online/dance.mp3", language: "English", country: "International", genre: "Electronic", bitrate: "128", tags: "dance,edm", favicon: "https://img.icons8.com/color/96/dj.png" },
  { stationuuid: "edm-2",    name: "SomaFM: Synphaera",  url_resolved: "https://ice6.somafm.com/synphaera-128-mp3", language: "English", country: "USA", genre: "Electronic", bitrate: "128", tags: "electronic,synth", favicon: "https://img.icons8.com/color/96/dj.png" },
  { stationuuid: "edm-3",    name: "SomaFM: Illinois Street Lounge", url_resolved: "https://ice6.somafm.com/illstreet-128-mp3", language: "English", country: "USA", genre: "Electronic", bitrate: "128", tags: "lounge,electronic", favicon: "https://img.icons8.com/color/96/dj.png" },
];

const GENRE_COLORS = {
  "Nepal":         { from: "#1e40af", to: "#7c3aed", badge: "bg-blue-600" },
  "Hindi":         { from: "#dc2626", to: "#ea580c", badge: "bg-red-600" },
  "Punjabi":       { from: "#b45309", to: "#ca8a04", badge: "bg-amber-600" },
  "International": { from: "#059669", to: "#0891b2", badge: "bg-emerald-600" },
  "Jazz & Blues":  { from: "#7c3aed", to: "#6d28d9", badge: "bg-violet-700" },
  "Classical":     { from: "#1f2937", to: "#4b5563", badge: "bg-gray-600" },
  "Electronic":    { from: "#0e7490", to: "#4338ca", badge: "bg-cyan-700" },
};

const GENRES = Object.keys(GENRE_COLORS);

// ─── Station Card ─────────────────────────────────────────────────────────────
const StationCard = ({ station, isActive, isLoading, onPlay, onFavorite, favorited }) => (
  <div
    onClick={() => onPlay(station)}
    className={`group relative cursor-pointer rounded-2xl p-4 transition-all duration-300 border
      ${isActive
        ? "border-fuchsia-500/60 bg-fuchsia-950/40 shadow-lg shadow-fuchsia-500/10"
        : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
  >
    {/* LIVE badge */}
    {isActive && (
      <span className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
        <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
        LIVE
      </span>
    )}

    <div className="flex items-center gap-3">
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
        ${isActive ? "bg-fuchsia-500" : "bg-white/10 group-hover:bg-fuchsia-500/30"}`}>
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isActive ? (
          <MdPause className="text-white" size={22} />
        ) : (
          <MdPlayArrow className="text-white" size={22} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{station.name}</p>
        <div className="flex items-center gap-2 mt-1 text-neutral-400 text-xs">
          <MdLanguage size={12} />
          <span>{station.language}</span>
          <span>·</span>
          <MdSignalCellularAlt size={12} />
          <span>{station.bitrate}kbps</span>
        </div>
      </div>

      {/* Favourite */}
      <button
        onClick={e => { e.stopPropagation(); onFavorite(station); }}
        className="p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
      >
        {favorited
          ? <MdFavorite className="text-fuchsia-400" size={18} />
          : <MdFavoriteBorder className="text-neutral-500 group-hover:text-neutral-300" size={18} />
        }
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RadioStation = () => {
  const radioCtx = useContext(RadioContext);
  const { token } = useContext(AuthContext);
  const { currentStation, isPlaying, playStation, stopStation, isLoading, toggleFavorite, isFavorite, favorites } = radioCtx || {};

  const [searchQuery, setSearchQuery]   = useState("");
  const [activeGenre, setActiveGenre]   = useState("All");

  const tabs = ["All", ...GENRES];

  const filtered = useMemo(() => {
    let list = ALL_STATIONS;
    if (activeGenre !== "All") list = list.filter(s => s.genre === activeGenre);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.tags.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeGenre, searchQuery]);

  const grouped = useMemo(() => {
    if (activeGenre !== "All") return { [activeGenre]: filtered };
    return GENRES.reduce((acc, g) => {
      const list = filtered.filter(s => s.genre === g);
      if (list.length) acc[g] = list;
      return acc;
    }, {});
  }, [filtered, activeGenre]);

  const handlePlay = (station) => {
    if (currentStation?.stationuuid === station.stationuuid && isPlaying) {
      stopStation();
    } else {
      playStation(station);
    }
  };

  const handleFav = (station) => {
    if (!token) { toast.info("Please log in to save favorites."); return; }
    toggleFavorite(station);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a] pb-36 px-4 pt-6">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-600 flex items-center justify-center">
              <MdRadio className="text-white" size={22} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Live Radio</h1>
          </div>
          <p className="text-neutral-400 text-sm ml-13 pl-0">
            Stream live stations from Nepal, India &amp; around the world
          </p>
        </div>

        {/* ── Now Playing Banner ── */}
        {currentStation && isPlaying && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-fuchsia-900/60 to-purple-900/60 border border-fuchsia-500/30 p-4 flex items-center gap-4 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-fuchsia-500 flex items-center justify-center flex-shrink-0 animate-pulse">
              <MdRadio className="text-white" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-fuchsia-300 uppercase tracking-widest font-semibold">Now Playing</p>
              <p className="text-white font-bold truncate">{currentStation.name}</p>
              <p className="text-neutral-400 text-xs">{currentStation.language} · {currentStation.country}</p>
            </div>
            <button
              onClick={stopStation}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <MdPause className="text-white" size={20} />
            </button>
          </div>
        )}

        {/* ── Favourites Strip ── */}
        {favorites && favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2">
              <MdFavorite className="text-fuchsia-400" size={18} /> Favourites
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {favorites.map(station => (
                <button
                  key={station.stationuuid}
                  onClick={() => handlePlay(station)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all
                    ${currentStation?.stationuuid === station.stationuuid && isPlaying
                      ? "bg-fuchsia-600 border-fuchsia-600 text-white"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:border-fuchsia-500/40"
                    }`}
                >
                  {currentStation?.stationuuid === station.stationuuid && isPlaying
                    ? <MdPause size={14} /> : <MdPlayArrow size={14} />}
                  {station.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Search ── */}
        <div className="relative mb-5">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search by station, language, genre…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-neutral-500 focus:outline-none focus:border-fuchsia-500/50 text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white">
              <MdClear size={18} />
            </button>
          )}
        </div>

        {/* ── Genre Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveGenre(tab)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border
                ${activeGenre === tab
                  ? "bg-fuchsia-600 border-fuchsia-600 text-white"
                  : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Station Grid by Genre ── */}
        {Object.entries(grouped).length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <MdRadio size={48} className="mx-auto mb-4 opacity-30" />
            <p>No stations found for "{searchQuery}"</p>
          </div>
        ) : (
          Object.entries(grouped).map(([genre, stations]) => {
            const colors = GENRE_COLORS[genre] || GENRE_COLORS["International"];
            return (
              <div key={genre} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${colors.badge}`}>{genre}</span>
                  <span className="text-neutral-500 text-sm">{stations.length} station{stations.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stations.map(station => (
                    <StationCard
                      key={station.stationuuid}
                      station={station}
                      isActive={currentStation?.stationuuid === station.stationuuid && isPlaying}
                      isLoading={isLoading && currentStation?.stationuuid === station.stationuuid}
                      onPlay={handlePlay}
                      onFavorite={handleFav}
                      favorited={isFavorite ? isFavorite(station) : false}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RadioStation;