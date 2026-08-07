import React, { useContext, useRef, useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdTrendingUp, MdAlbum, MdPerson, MdMovie, MdPlayArrow, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdPause, MdMoreVert, MdMusicNote, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { PlayerContext } from "../../context/PlayerContext";
import { AuthContext } from "../../context/AuthContext";
import AddToPlaylistModal from "../AddToPlaylistModal";
import { toast } from "react-toastify";
import SEO from '../SEO';
import Footer from '../Layout/Footer';
import { API_BASE_URL } from '../../utils/api';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000;
const cachedData = {
  songs: null,
  movieAlbums: null,
  artists: null,
  trendingSongs: null,
  lastFetch: null
};

// Premium Theme Colors
const THEME_COLORS = Object.freeze(['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']);

const DisplayHome = () => {
  const navigate = useNavigate();
  const { 
    songsData, 
    albumsData, 
    playWithId, 
    toggleFavorite, 
    favorites, 
    setSongsData, 
    addToQueue,
    track, 
    playStatus 
  } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);
  
  // Refs
  const trendingRef = useRef(null);
  const albumRowRef = useRef(null);
  const artistsRowRef = useRef(null);
  const movieAlbumRowRef = useRef(null);
  
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(12); // Grid fits 4, 6 or 12 nicely
  const [loading, setLoading] = useState(true);
  const [movieAlbums, setMovieAlbums] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [mainColor, setMainColor] = useState(THEME_COLORS[0]);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Pagination Math
  const { currentSongs, totalPages } = useMemo(() => {
    const indexOfLast = currentPage * songsPerPage;
    const indexOfFirst = indexOfLast - songsPerPage;
    const current = songsData.slice(indexOfFirst, indexOfLast);
    const total = Math.ceil(songsData.length / songsPerPage);
    return { currentSongs: current, totalPages: total };
  }, [currentPage, songsPerPage, songsData]);

  // Data Fetching
  const fetchData = useCallback(async () => {
    try {
      const now = Date.now();
      if (cachedData.lastFetch && (now - cachedData.lastFetch < CACHE_DURATION)) {
        setSongsData(cachedData.songs || []);
        setMovieAlbums(cachedData.movieAlbums || []);
        setArtists(cachedData.artists || []);
        setTrendingSongs(cachedData.trendingSongs || []);
        setLoading(false);
        return;
      }

      setLoading(true);
      const backendUrl = API_BASE_URL;
      
      const [movieRes, songsRes, artistsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/moviealbum/list`),
        axios.get(`${backendUrl}/api/song/list?all=true`),
        axios.get(`${backendUrl}/api/artist/list`)
      ]);

      if (movieRes.data.success) {
        setMovieAlbums(movieRes.data.movieAlbums);
        cachedData.movieAlbums = movieRes.data.movieAlbums;
      }

      if (songsRes.data.success) {
        setSongsData(songsRes.data.songs);
        cachedData.songs = songsRes.data.songs;
        
        // Pick random trending songs
        const sorted = [...songsRes.data.songs].sort(() => Math.random() - 0.5).slice(0, 10);
        setTrendingSongs(sorted);
        cachedData.trendingSongs = sorted;
      }

      if (artistsRes.data.success) {
        setArtists(artistsRes.data.artists);
        cachedData.artists = artistsRes.data.artists;
      }

      cachedData.lastFetch = Date.now();
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  }, [setSongsData]);

  useEffect(() => {
    fetchData();
    // Rotate accent color periodically
    const interval = setInterval(() => {
      setMainColor(THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)]);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const scrollContainer = (ref, dir) => {
    if (ref.current) {
      const scrollAmount = window.innerWidth > 768 ? 600 : 300;
      ref.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handlePlaySong = (e, id) => {
    e.stopPropagation();
    if (track && track._id === id) {
      // Toggle play/pause
    } else {
      playWithId(id);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] pt-16 px-6 relative">
        <div className="h-64 bg-neutral-900 animate-pulse rounded-2xl mb-8"></div>
        <div className="flex gap-4 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-40 w-40 bg-neutral-900 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] pb-24 relative overflow-hidden" style={{ '--soundlink-primary': mainColor }}>
      <SEO 
        title="SoundLink | Listen to Trending Music & Audio"
        description="Stream millions of songs and albums. Discover trending hits, top artists, and exclusive playlists only on SoundLink."
      />
      
      {/* Background Gradient Blob */}
      <div 
        className="absolute top-0 left-0 w-full h-[50vh] opacity-20 pointer-events-none transition-colors duration-1000 ease-in-out"
        style={{
          background: `radial-gradient(circle at 30% 0%, ${mainColor}, transparent 60%)`
        }}
      />

      <div className="relative z-10 px-4 md:px-8 pt-4 md:pt-6">
        {/* Welcome Section */}
        <div className="hero-welcome mb-8">
          <h1 className="hero-greeting">
            {getGreeting()}, <span className="hero-greeting-name">{user ? user.name?.split(' ')[0] || user.username : 'Guest'}</span>
          </h1>
          <p className="hero-subtext">Let's discover your next favorite track.</p>
        </div>

        {/* Trending Horizontal Shelf */}
        {trendingSongs.length > 0 && (
          <section className="mb-10">
            <div className="section-header">
              <h2 className="section-title">
                <MdTrendingUp className="section-title-icon" /> Trending Right Now
              </h2>
            </div>
            
            <div className="relative group">
              <button onClick={() => scrollContainer(trendingRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block backdrop-blur border border-white/10 ml-2">
                <MdKeyboardArrowLeft size={24} />
              </button>
              
              <div className="h-scroll" ref={trendingRef}>
                {trendingSongs.map(song => (
                  <div 
                    key={`trend-${song._id}`} 
                    className="trending-item group"
                    onClick={() => playWithId(song._id)}
                  >
                    <div className="trending-item-inner">
                      <div className="trending-thumb">
                        <img src={song.image} alt={song.name} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <MdPlayArrow size={24} className="text-white" />
                        </div>
                      </div>
                      <div className="trending-meta">
                        <h4 className="trending-name">{song.name}</h4>
                        <p className="trending-desc">{song.desc || 'Trending Audio'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => scrollContainer(trendingRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block backdrop-blur border border-white/10 mr-2">
                <MdKeyboardArrowRight size={24} />
              </button>
            </div>
          </section>
        )}

        {/* Promo Banner */}
        <div className="promo-banner my-12 group cursor-pointer" onClick={() => navigate('/premium')}>
          <img src="https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=2000&auto=format&fit=crop" alt="Premium Music" className="promo-banner-bg" />
          <div className="promo-banner-gradient" />
          <div className="promo-badge">AD-FREE</div>
          <div className="promo-content">
            <span className="promo-eyebrow">Upgrade Experience</span>
            <h2 className="promo-title">Listen Without <br/><span className="promo-title-accent">Interruptions.</span></h2>
            <p className="promo-subtitle">Enjoy offline mode, high fidelity audio, and zero ads.</p>
            <button className="promo-cta">Get Premium Now</button>
          </div>
        </div>

        {/* Recommended Songs Grid */}
        <section className="mb-12">
          <div className="section-header">
            <h2 className="section-title">
              <MdMusicNote className="section-title-icon" /> Made For You
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                Grid
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                List
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {currentSongs.map((item, index) => {
                const isPlaying = track && track._id === item._id && playStatus;
                const isFavorite = favorites.some(fav => fav._id === item._id);
                return (
                  <div key={item._id} className="song-card" onClick={() => playWithId(item._id)}>
                    <div className="song-card-image">
                      <img src={item.image} alt={item.name} loading={index < 4 ? "eager" : "lazy"} />
                      <div className={`song-card-overlay ${track && track._id === item._id ? 'opacity-100 bg-black/60' : ''}`}>
                        <button className="song-card-play" onClick={(e) => handlePlaySong(e, item._id)}>
                          {isPlaying ? <MdPause size={28} color="#fff" /> : <MdPlayArrow size={28} color="#fff" />}
                        </button>
                      </div>
                    </div>
                    <div className="song-card-info">
                      <h3 className={`song-card-title ${track && track._id === item._id ? 'text-[#a855f7]' : ''}`}>{item.name}</h3>
                      <p className="song-card-artist">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="song-list-container">
              {currentSongs.map((item, index) => {
                const isPlaying = track && track._id === item._id && playStatus;
                const isFavorite = favorites.some(fav => fav._id === item._id);
                return (
                  <div 
                    key={item._id} 
                    className={`song-list-item ${track && track._id === item._id ? 'song-active' : ''}`}
                    onClick={() => playWithId(item._id)}
                  >
                    <div className="song-list-num">
                      {isPlaying ? <span className="playing-indicator" /> : (indexOfFirstSong + index + 1)}
                    </div>
                    <div className="song-list-thumb">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="song-list-meta">
                      <h4 className={`song-list-name ${track && track._id === item._id ? 'active' : ''}`}>{item.name}</h4>
                      <p className="song-list-desc">{item.desc}</p>
                    </div>
                    <div className="song-list-actions">
                      {user && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(item._id); }}
                          className="p-2 text-neutral-400 hover:text-pink-500 transition-colors"
                        >
                          {isFavorite ? <MdFavorite className="text-pink-500" /> : <MdFavoriteBorder />}
                        </button>
                      )}
                      <span className="song-list-duration">{item.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrap">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(num => num === 1 || num === totalPages || Math.abs(num - currentPage) <= 1)
                .map((num, i, arr) => (
                  <React.Fragment key={num}>
                    {i > 0 && arr[i - 1] !== num - 1 && <span className="text-neutral-600 px-1">...</span>}
                    <button
                      className={`pagination-btn ${currentPage === num ? 'active' : ''}`}
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  </React.Fragment>
                ))}
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </section>

        {/* Featured Artists */}
        {artists.length > 0 && (
          <section className="mb-12">
            <div className="section-header">
              <h2 className="section-title">
                <MdPerson className="section-title-icon" /> Popular Artists
              </h2>
              <button className="section-see-all" onClick={() => navigate('/artists')}>Show All</button>
            </div>
            
            <div className="h-scroll pb-4" ref={artistsRowRef}>
              {artists.slice(0, 10).map(artist => (
                <div key={artist._id} className="artist-card" onClick={() => navigate(`/artist/${artist._id}`)}>
                  <div className="artist-avatar">
                    <img src={artist.image} alt={artist.name} loading="lazy" />
                  </div>
                  <h4 className="artist-name">{artist.name}</h4>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Movie Soundtracks */}
        {movieAlbums.length > 0 && (
          <section className="mb-12">
            <div className="section-header">
              <h2 className="section-title">
                <MdMovie className="section-title-icon" /> Cinematic Soundtracks
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movieAlbums.slice(0, 5).map(album => (
                <div key={album._id} className="song-card" onClick={() => navigate(`/movie/${album._id}`)}>
                  <div className="song-card-image">
                    <img src={album.image} alt={album.name} loading="lazy" />
                  </div>
                  <div className="song-card-info">
                    <h3 className="song-card-title">{album.name}</h3>
                    <p className="song-card-artist">{album.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
      
      <Footer />

      {showPlaylistModal && selectedSongId && (
        <AddToPlaylistModal 
          songId={selectedSongId}
          onClose={() => {
            setShowPlaylistModal(false);
            setSelectedSongId(null);
          }}
        />
      )}
    </div>
  );
};

export default DisplayHome;
