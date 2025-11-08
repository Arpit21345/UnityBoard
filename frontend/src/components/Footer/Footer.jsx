import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
  <footer className="ub-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <a className="brand" href="/">
            <img className="brand-logo" src="/api/assets/logo.png" alt="UnityBoard logo" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
            <span>UnityBoard</span>
          </a>
          <p className="footer-tag">Organize projects, tasks, and resources with a little AI help.</p>
        </div>

    <nav className="footer-links" aria-label="Footer">
          <div>
            <div className="footer-title">Product</div>
            <ul>
              <li><a href="/">Explore</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-title">Resources</div>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">API Reference</a></li>
              <li><a href="#">Help Center</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-title">Contact</div>
            <ul>
              <li>
                <a href="mailto:arpit21345j@gmail.com">arpit21345j@gmail.com</a>
              </li>
              <li>
                <a href="#">+91 8090113505</a>
              </li>
            </ul>
          </div>
          <div>
            <div className="footer-title">Company</div>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} UnityBoard</span>
          <span className="muted">Built with love and efficiency.</span>
        </div>
      </div>
    </footer>
  );
}
