import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FaFire, FaRegClock, FaUser, FaVideo, FaMusic, FaChartBar, FaThLarge, FaHeart, FaStar, FaPodcast, FaPlus, FaListUl, FaBars, FaTimes, FaHome, FaCog } from 'react-icons/fa';
import { MdRadio } from 'react-icons/md';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const url = import.meta.env.VITE_BACKEND_URL;

  // Function to handle navigation and close sidebar on mobile
  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      setLoadingPlaylists(true);
      axios.get(`${url}/api/playlist/my`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        setPlaylists(res.data.playlists || []);
        setLoadingPlaylists(false);
      }).catch(() => setLoadingPlaylists(false));
    }
  }, [user, token]);

  // Sidebar classes for mobile/desktop
  const sidebarClass = `fixed top-0 left-0 h-screen w-64 bg-black text-white flex flex-col shadow-lg z-40 transition-transform duration-300
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:h-auto md:max-h-screen md:overflow-hidden safe-area-padding`;

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={sidebarClass}
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Close button for mobile */}
        <button
          className="md:hidden absolute right-3 z-50 bg-black/80 p-2 rounded-full border border-neutral-800 mt-3 "
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
          style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
        >
          <FaTimes size={28} />
        </button>
        {/* Logo */}
        <div 
          className="flex items-center px-4 py-4 cursor-pointer relative md:hidden"
          onClick={() => handleNavigate('/')}
        >
          {/* Logo separator removed for cleaner look */}
          <img 
            src="/icons/soundlink-icon.svg?v=2" 
            alt="SoundLink Logo" 
            className="h-10 w-10 mr-3" 
          />
          <span className="text-xl font-bold text-white">SoundLink</span>
        </div>
        {/* Spacer for large screens */}
        <div className="hidden md:block" style={{ height: '56px' }}></div>
        {/* Menu */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="mb-4">
            <div className="text-xs text-neutral-400 mb-2">Music</div>
            
            <SidebarItem 
              icon={<FaHome />} 
              label="Home" 
              active={location.pathname === '/'} 
              onClick={() => handleNavigate('/')} 
              highlight={true}
            />
            <SidebarItem 
              icon={<FaFire />} 
              label="Trending" 
              active={location.pathname === '/trending'} 
              onClick={() => handleNavigate('/trending')} 
            />
            <SidebarItem 
              icon={<FaUser />} 
              label="Artists" 
              active={location.pathname === '/artists'} 
              onClick={() => handleNavigate('/artists')}
            />
            <SidebarItem 
              icon={<FaMusic />} 
              label="Playlists" 
              active={location.pathname === '/playlists'} 
              onClick={() => handleNavigate('/playlists')} 
            />
            {/* Radio Section */}
            <SidebarItem 
              icon={<MdRadio />} 
              label="Radio" 
              active={location.pathname === '/radio'} 
              onClick={() => handleNavigate('/radio')} 
            />
          </div>
          {/* Playlists Section */}
          {user && (
            <div className="mb-4">
              <div className="text-xs text-neutral-400 mb-2 flex items-center gap-2"><FaListUl /> Playlists</div>
              {loadingPlaylists ? (
                <div className="text-neutral text-sm px-3">Loading...</div>
              ) : (
                playlists.length === 0 ? (
                  <div className="text-neutral text-xs px-3">No playlists yet</div>
                ) : (
                  playlists.map(pl => (
                    <div
                      key={pl._id}
                      onClick={() => handleNavigate(`/playlist/${pl._id}`)}
                      className="flex items-center gap-4 px-3 py-3 rounded-md cursor-pointer text-neutral hover:text-white font-medium transition-all duration-200 group"
                    >
                      <FaMusic className="text-xl" />
                      <span className="truncate text-sm">{pl.name}</span>
                    </div>
                  ))
                )
              )}
            </div>
          )}
          <div className="mb-4">
            <div className="text-xs text-neutral-400 mb-2">Library</div>
            <SidebarItem 
              icon={<FaHeart />} 
              label="Favorites" 
              active={location.pathname === '/favorites'} 
              onClick={() => handleNavigate('/favorites')} 
            />
          </div>

          {/* Add Settings Section */}
          <div className="mb-4 mt-auto">
            <div className="text-xs text-neutral-400 mb-2">Options</div>
            <SidebarItem 
              icon={<FaCog />} 
              label="Settings" 
              active={location.pathname === '/settings'} 
              onClick={() => handleNavigate('/settings')} 
            />
          </div>
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-4 px-3 py-3 rounded-md cursor-pointer transition-all duration-200
        ${active ? 'text-white bg-base-300/40 font-bold' : 'text-neutral font-medium hover:text-white'}
      `}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default Sidebar;