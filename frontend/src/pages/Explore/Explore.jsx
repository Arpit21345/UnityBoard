import React, { useEffect, useState, useMemo } from 'react';
import './Explore.css';
import { apiListPublicProjects } from '../../services/projects.js';
import { apiJoinPublicProject } from '../../services/invites.js';
import Footer from '../../components/Footer/Footer.jsx';

export default function Explore() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const list = await apiListPublicProjects();
        setProjects(list);
      } catch (e) {
        setError('Failed to load public projects');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const count = useMemo(() => projects.length, [projects]);

  return (
    <main className="explore-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">Build together, faster</h1>
              <p className="hero-subtitle">Plan tasks, share resources, and discuss work—with an AI helper and public projects to explore.</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="/register">Get started</a>
                <a className="btn btn-secondary" href="/login">Sign in</a>
              </div>
            </div>
            <div className="hero-visual">
              <img src="/api/assets/hero illustration.png" alt="UnityBoard" onError={(e)=>{ e.currentTarget.src='/api/assets/mainLogo.png'; }} />
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-section">
        <div className="container">
          <div className="tech-badge">
            <span className="pill">AI‑Powered Collaboration</span>
          </div>
          <p className="tech-subtitle">Built with modern technology</p>
          <div className="tech-logos">
            {[
              { name:'MongoDB', key:'mdb' },
              { name:'Express', key:'express' },
              { name:'React', key:'react' },
              { name:'Node.js', key:'node' },
              { name:'Cohere AI', key:'cohere' },
            ].map(l => (
              <div className="logo-badge" key={l.key}>{l.name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternating Feature Sections */}
      <section className="features-section">
        <div className="container">
          
          {/* Projects - Text Left, Image Right */}
          <div className="feature-row">
            <div className="feature-text">
              <div className="feature-kicker">Projects</div>
              <h3 className="feature-title">Organize work in focused spaces</h3>
              <p className="feature-description">Create projects with visibility controls, keep everything in one place, and get a clear picture of progress at a glance.</p>
              <ul className="feature-list">
                <li>Central dashboards with KPIs</li>
                <li>Friendly defaults, fine‑grained settings</li>
                <li>Invite your team in seconds</li>
              </ul>
            </div>
            <div className="feature-visual">
              <img src="/api/assets/smartdashboardcard.png" alt="Project dashboard" onError={(e)=>{ e.currentTarget.src='/api/assets/attendeceMonitor.png'; }} />
            </div>
          </div>

          {/* Tasks - Image Left, Text Right */}
          <div className="feature-row feature-row-reverse">
            <div className="feature-visual">
              <img src="/api/assets/aipoweredtask.png" alt="AI tasks" onError={(e)=>{ e.currentTarget.src='/api/assets/aipoweredtashmanageschedule.png'; }} />
            </div>
            <div className="feature-text">
              <div className="feature-kicker">Tasks</div>
              <h3 className="feature-title">Plan sprints and ship predictably</h3>
              <p className="feature-description">Break work down, assign owners, and track status. Let AI suggest subtasks and next steps from context.</p>
              <ul className="feature-list">
                <li>Kanban and list views</li>
                <li>Dependencies and due dates</li>
                <li>AI‑assisted breakdowns</li>
              </ul>
            </div>
          </div>

          {/* Resources - Text Left, Image Right */}
          <div className="feature-row">
            <div className="feature-text">
              <div className="feature-kicker">Resources</div>
              <h3 className="feature-title">Share files, links, and docs</h3>
              <p className="feature-description">Keep everything discoverable with tidy organization, access controls, and versioning.</p>
              <ul className="feature-list">
                <li>File and link attachments</li>
                <li>Resource previews</li>
                <li>Access & roles</li>
              </ul>
            </div>
            <div className="feature-visual">
              <img src="/api/assets/resource vault.png" alt="Resources" />
            </div>
          </div>

          {/* Discussion - Image Left, Text Right */}
          <div className="feature-row feature-row-reverse">
            <div className="feature-visual">
              <img src="/api/assets/discussion room.png" alt="Discussion" />
            </div>
            <div className="feature-text">
              <div className="feature-kicker">Discussion</div>
              <h3 className="feature-title">Decide faster with focused threads</h3>
              <p className="feature-description">Lightweight discussions with mentions and quick summaries help unblock teams without noisy chats.</p>
              <ul className="feature-list">
                <li>Threaded comments</li>
                <li>@mentions and notifications</li>
                <li>AI summaries</li>
              </ul>
            </div>
          </div>

          {/* Learning - Text Left, Image Right */}
          <div className="feature-row">
            <div className="feature-text">
              <div className="feature-kicker">Learning</div>
              <h3 className="feature-title">Track growth with journals and timelines</h3>
              <p className="feature-description">Capture learnings, milestones, and progress to build a visible record of improvement.</p>
              <ul className="feature-list">
                <li>Personal journals</li>
                <li>Milestones & timelines</li>
                <li>Portfolio‑ready exports</li>
              </ul>
            </div>
            <div className="feature-visual">
              <img src="/api/assets/learntrack.png" alt="Learning tracker" />
            </div>
          </div>

          {/* Snippets - Image Left, Text Right */}
          <div className="feature-row feature-row-reverse">
            <div className="feature-visual">
              <img src="/api/assets/snippets.png" alt="Code snippets" />
            </div>
            <div className="feature-text">
              <div className="feature-kicker">Snippets</div>
              <h3 className="feature-title">Share solutions with clean code snippets</h3>
              <p className="feature-description">Create a searchable library of examples with syntax highlighting and comments.</p>
              <ul className="feature-list">
                <li>Dark editor styling</li>
                <li>Comments and reactions</li>
                <li>Collections & tags</li>
              </ul>
            </div>
          </div>

          {/* Solutions - Text Left, Image Right */}
          <div className="feature-row">
            <div className="feature-text">
              <div className="feature-kicker">Solutions</div>
              <h3 className="feature-title">Build a knowledge base that grows with you</h3>
              <p className="feature-description">Capture solved problems and best practices so your team never solves the same issue twice.</p>
              <ul className="feature-list">
                <li>Searchable library of solutions</li>
                <li>Difficulty and tags</li>
                <li>Link tasks and references</li>
              </ul>
            </div>
            <div className="feature-visual">
              <img src="/api/assets/solutiondb.png" alt="Solution database" />
            </div>
          </div>

        </div>
      </section>

  {/** Core Features Grid removed per request **/}

      {/* Benefits Section - Image Left, Text Right */}
      <section className="benefits-section">
        <div className="container">
          <div className="feature-row feature-row-reverse">
            <div className="feature-visual">
              <div className="theme-showcase">
                <div className="theme-card">
                  <img src="/api/assets/mode-light.png" alt="Light mode" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
                </div>
                <div className="theme-card">
                  <img src="/api/assets/mode-dark.png" alt="Dark mode" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
                </div>
              </div>
            </div>
            <div className="feature-text">
              <div className="feature-kicker">Benefits</div>
              <h3 className="feature-title">Why choose our platform?</h3>
              <div className="benefits-grid">
                {[
                  {icon:'⚡', title:'AI‑Powered', desc:'Insights and automation with Cohere AI.'},
                  {icon:'🤝', title:'Team‑Focused', desc:'Built for collaborative work with clarity.'},
                  {icon:'📱', title:'Mobile Ready', desc:'Responsive and touch‑friendly.'},
                  {icon:'🔒', title:'Secure & Reliable', desc:'Role‑based access and safe by default.'}
                ].map((benefit, idx) => (
                  <div className="benefit-item" key={idx}>
                    <div className="benefit-icon">{benefit.icon}</div>
                    <div className="benefit-content">
                      <h5 className="benefit-title">{benefit.title}</h5>
                      <p className="benefit-description">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Improved CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2 className="cta-title">Ready to transform your team collaboration?</h2>
              <p className="cta-subtitle">Join thousands of teams using UnityBoard to manage projects, track learning, and collaborate more effectively than ever before.</p>
              <div className="cta-features">
                <div className="cta-feature">✅ Free 14-day trial</div>
                <div className="cta-feature">✅ No credit card required</div>
                <div className="cta-feature">✅ Setup in under 5 minutes</div>
              </div>
            </div>
            <div className="cta-actions">
              <a className="btn btn-cta-primary" href="/register">Start Free Trial</a>
              <a className="btn btn-cta-secondary" href="mailto:arpit21345j@gmail.com">Schedule Demo</a>
            </div>
          </div>
        </div>
      </section>

      {/* Final Features & Public Projects - Text Left, Content Right */}
      <section className="final-section">
        <div className="container">
          <div className="feature-row">
            <div className="feature-text">
              <div className="feature-kicker">Features</div>
              <h3 className="feature-title">Everything you need to succeed</h3>
              <div className="mini-features-grid">
                {[
                  {icon:'📂', title:'Projects', desc:'Organize workspaces with visibility controls.'},
                  {icon:'✅', title:'Tasks', desc:'Plan sprints, assign work, track progress.'},
                  {icon:'📎', title:'Resources', desc:'Share files, links, and documentation.'},
                  {icon:'💬', title:'Discussion', desc:'Lightweight threads for decisions.'},
                  {icon:'🤖', title:'AI helper', desc:'Summaries, suggestions, and Q&A with context.'},
                  {icon:'✉️', title:'Invites', desc:'Codes, links, and public join for teams.'}
                ].map((feature, i) => (
                  <div className="mini-feature" key={i}>
                    <div className="mini-feature-header">
                      <span className="mini-feature-icon">{feature.icon}</span>
                      <span className="mini-feature-title">{feature.title}</span>
                    </div>
                    <p className="mini-feature-desc">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="feature-visual">
              <div className="public-projects">
                <h3 className="public-projects-title">Public Projects {count > 0 ? `(${count})` : ''}</h3>
                {error && <p className="error-message">{error}</p>}
                {loading ? (
                  <div className="loading-grid">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div className="skeleton-card" key={i} />
                    ))}
                  </div>
                ) : count === 0 ? (
                  <div className="empty-projects">
                    <div className="empty-projects-content">
                      <h4>No public projects yet</h4>
                      <p>Check back soon or login to create your own.</p>
                    </div>
                  </div>
                ) : (
                  <div className="projects-list">
                    {projects.slice(0,4).map((project) => (
                      <div className="project-card" key={project._id}>
                        <div className="project-content">
                          <h4 className="project-name">{project.name}</h4>
                          {project.description ? (
                            <p className="project-description">{project.description}</p>
                          ) : (
                            <p className="project-description project-description-empty">No description</p>
                          )}
                          <button
                            className="btn btn-project-join"
                            onClick={async () => {
                              const token = localStorage.getItem('token');
                              if (!token) { window.location.href = '/login'; return; }
                              const joined = await apiJoinPublicProject(project._id);
                              window.location.href = `/project/${joined._id}`;
                            }}
                          >
                            Join Project
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
