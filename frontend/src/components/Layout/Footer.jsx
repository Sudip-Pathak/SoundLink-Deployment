import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdKeyboardArrowUp, MdMusicNote, MdHeadphones, MdTrendingUp, MdPeople, MdStar } from 'react-icons/md';
import { FaFacebookF, FaTwitter, FaInstagram, FaSpotify } from 'react-icons/fa';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    const selectors = ['.content-container', '#main-content', 'main', 'body'];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { text: 'Trending Songs', path: '/trending', icon: <MdTrendingUp size={14} /> },
    { text: 'Artists', path: '/artists', icon: <MdPeople size={14} /> },
    { text: 'My Favorites', path: '/favorites', icon: <MdStar size={14} /> },
    { text: 'Premium', path: '/premium', icon: <MdHeadphones size={14} /> }
  ];

  const companyLinks = [
    { text: 'About Us', path: '/about' },
    { text: 'Terms of Service', path: '/terms' },
    { text: 'Privacy Policy', path: '/privacy' },
    { text: 'Contact Us', path: '/contact' }
  ];

  const supportLinks = [
    { text: 'Help Center', path: '/contact' },
    { text: 'FAQ', path: '/contact' },
    { text: 'Send Feedback', path: '/contact' }
  ];

  const socialLinks = [
    { icon: <FaFacebookF size={16} />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <FaTwitter size={16} />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <FaInstagram size={16} />, href: 'https://instagram.com', label: 'Instagram' }
  ];

  return (
    <footer className="footer-root">
      {/* Gradient divider */}
      <div className="footer-divider" />

      <div className="footer-inner">
        {/* Back to Top */}
        <div className="footer-top-btn-wrap">
          <button onClick={scrollToTop} className="footer-top-btn" aria-label="Back to top">
            <MdKeyboardArrowUp size={22} />
            <span>Back to Top</span>
          </button>
        </div>

        {/* Main Grid */}
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-brand-logo">
              <MdMusicNote className="footer-brand-icon" size={26} />
              <h3 className="footer-brand-name">SoundLink</h3>
            </div>
            <p className="footer-brand-desc">
              Your ultimate music streaming platform. Discover curated playlists, trending charts, and personalized recommendations — all in one place.
            </p>
            <div className="footer-socials">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Explore</h4>
            <ul className="footer-col-list">
              {quickLinks.map((item) => (
                <li key={item.text}>
                  <button onClick={() => navigate(item.path)} className="footer-link">
                    {item.icon && <span className="footer-link-icon">{item.icon}</span>}
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-col-list">
              {companyLinks.map((item) => (
                <li key={item.text}>
                  <button onClick={() => navigate(item.path)} className="footer-link">
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4 className="footer-col-title">Support</h4>
            <ul className="footer-col-list">
              {supportLinks.map((item) => (
                <li key={item.text}>
                  <button onClick={() => navigate(item.path)} className="footer-link">
                    {item.text}
                  </button>
                </li>
              ))}
              <li>
                <a href="mailto:support@soundlink.com" className="footer-link">
                  Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} SoundLink. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <button onClick={() => navigate('/terms')} className="footer-bottom-link">Terms</button>
            <span className="footer-bottom-sep">·</span>
            <button onClick={() => navigate('/privacy')} className="footer-bottom-link">Privacy</button>
            <span className="footer-bottom-sep">·</span>
            <button onClick={() => navigate('/contact')} className="footer-bottom-link">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;