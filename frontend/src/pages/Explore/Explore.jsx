import React, { useEffect, useState, useMemo } from 'react';
import './Explore.css';
import { apiListPublicProjects } from '../../services/projects.js';
import { apiJoinPublicProject } from '../../services/invites.js';
import { categorizeJoinError } from '../../utils/joinErrors.js';
import Footer from '../../components/Footer/Footer.jsx';
import { useToast } from '../../components/Toast/ToastContext.jsx';
import { useUser } from '../../context/UserContext.jsx';

export default function Explore() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningId, setJoiningId] = useState(null);
  const { notify } = useToast();
  const { user: me } = useUser();
  
  // Check if user is authenticated
  const tokenPresent = typeof window !== 'undefined' ? !!localStorage.getItem('token') : false;
  const isAuthed = tokenPresent && !!me;

  useEffect(() => {
    (async () => {
      try {
        const list = await apiListPublicProjects();
        setProjects(list);
        setFilteredProjects(list);
      } catch (e) {
        setError('Failed to load public projects');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  const count = useMemo(() => filteredProjects.length, [filteredProjects]);

  return (
  <main className="explore-page" role="main">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
      <div className="hero-content">
              <h1 className="hero-title">Build together, faster</h1>
              <p className="hero-subtitle">Plan tasks, share resources, and discuss work—with an AI helper and public projects to explore.</p>
              {!isAuthed && (
                <div className="hero-actions">
                  <a className="btn btn-secondary" href="/login">Sign in</a>
                  <a className="btn btn-primary" href="/register">Get started</a>
                </div>
              )}
            </div>
            <div className="hero-visual">
              <img src="/api/assets/hero illustration.png" alt="Platform illustration" onError={(e)=>{ e.currentTarget.src='/api/assets/mainLogo.png'; }} />
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
              <h3 className="feature-title">Organize work in focused workspaces</h3>
              <p className="feature-description">Create projects with public/private visibility controls, centralized dashboards, and role-based access. Keep tasks, resources, and discussions organized in dedicated spaces with clear progress tracking.</p>
              <ul className="feature-list">
                <li>Public and private project visibility</li>
                <li>Member roles and permission management</li>
                <li>Project-specific dashboards with analytics</li>
                <li>Easy invitation system with codes and links</li>
              </ul>
            </div>
            <div className="feature-visual">
              <img src="/api/assets/smartdashboardcard.png" alt="Project dashboard preview" onError={(e)=>{ e.currentTarget.src='/api/assets/attendeceMonitor.png'; }} />
            </div>
          </div>

          {/* Tasks - Image Left, Text Right */}
          <div className="feature-row feature-row-reverse">
            <div className="feature-visual">
              <img 
                src="/api/assets/aipoweredtask.png" 
                alt="AI assisted tasks" 
                onError={(e) => { 
                  // Prevent infinite retry loop
                  if (!e.currentTarget.dataset.retried) {
                    e.currentTarget.dataset.retried = 'true';
                    e.currentTarget.src = '/api/assets/aipoweredtashmanageschedule.png';
                  } else {
                    // If both images fail, hide the image
                    e.currentTarget.style.display = 'none';
                  }
                }} 
              />
            </div>
            <div className="feature-text">
              <div className="feature-kicker">Tasks</div>
              <h3 className="feature-title">Plan, assign, and track work seamlessly</h3>
              <p className="feature-description">Create tasks with priorities, due dates, and detailed descriptions. Assign work to team members and track progress with status updates. AI can help break down complex tasks into manageable subtasks.</p>
              <ul className="feature-list">
                <li>Task creation with priorities and due dates</li>
                <li>Assignment to team members with notifications</li>
                <li>Status tracking and progress updates</li>
                <li>AI-assisted task breakdown and suggestions</li>
              </ul>
            </div>
          </div>

          {/* Resources - Text Left, Image Right */}
          <div className="feature-row">
            <div className="feature-text">
              <div className="feature-kicker">Resources</div>
              <h3 className="feature-title">Centralize files, links, and documentation</h3>
              <p className="feature-description">Upload files, save important links, and organize all project resources in one place. With categories, descriptions, and role-based access, keep everything discoverable and secure.</p>
              <ul className="feature-list">
                <li>File uploads with secure storage</li>
                <li>Link bookmarking with metadata</li>
                <li>Categorized organization system</li>
                <li>Role-based access controls</li>
              </ul>
            </div>
            <div className="feature-visual">
              <img src="/api/assets/resource vault.png" alt="Resources management" onError={(e)=>{ e.currentTarget.src='/api/assets/mainLogo.png'; }} />
            </div>
          </div>

          {/* Discussion - Image Left, Text Right */}
          <div className="feature-row feature-row-reverse">
            <div className="feature-visual">
              <img src="/api/assets/discussion room.png" alt="Discussion threads" onError={(e)=>{ e.currentTarget.src='/api/assets/mainLogo.png'; }} />
            </div>
            <div className="feature-text">
              <div className="feature-kicker">Discussion</div>
              <h3 className="feature-title">Collaborate through focused conversations</h3>
              <p className="feature-description">Create discussion threads for specific topics, decisions, or brainstorming. Get notifications for important updates and let AI provide quick summaries of long conversations to keep everyone in sync.</p>
              <ul className="feature-list">
                <li>Threaded discussions by topic</li>
                <li>Smart notifications for task deadlines and updates</li>
                <li>AI-powered conversation summaries</li>
                <li>Real-time messaging and updates</li>
              </ul>
            </div>
          </div>

          {/* Learning - Text Left, Image Right */}
          <div className="feature-row">
            <div className="feature-text">
              <div className="feature-kicker">Profile & Analytics</div>
              <h3 className="feature-title">Track your growth and showcase achievements</h3>
              <p className="feature-description">View detailed analytics of your contributions, completed tasks, and project involvement. Build a professional profile showcasing your skills, projects, and accomplishments with portfolio-ready presentation.</p>
              <ul className="feature-list">
                <li>Personal analytics dashboard</li>
                <li>Project contribution tracking</li>
                <li>Skills and achievement showcase</li>
                <li>Public and private profile views</li>
              </ul>
            </div>
            <div className="feature-visual">
              <img src="/api/assets/learntrack.png" alt="Learning tracker" onError={(e)=>{ e.currentTarget.src='/api/assets/mainLogo.png'; }} />
            </div>
          </div>

          {/* Snippets - Image Left, Text Right */}
          <div className="feature-row feature-row-reverse">
            <div className="feature-visual">
              <img src="/api/assets/snippets.png" alt="Code snippets" onError={(e)=>{ e.currentTarget.src='/api/assets/mainLogo.png'; }} />
            </div>
            <div className="feature-text">
              <div className="feature-kicker">Solutions</div>
              <h3 className="feature-title">Build a searchable knowledge base</h3>
              <p className="feature-description">Document solutions to problems, create code snippets with syntax highlighting, and build a searchable library that grows with your team. Tag solutions by difficulty and category for easy discovery.</p>
              <ul className="feature-list">
                <li>Rich text editor with code highlighting</li>
                <li>Difficulty levels and category tags</li>
                <li>Searchable solution database</li>
                <li>Link solutions to tasks and projects</li>
              </ul>
            </div>
          </div>

          {/* AI Assistant - Text Left, Image Right */}
          <div className="feature-row">
            <div className="feature-text">
              <div className="feature-kicker">AI Assistant</div>
              <h3 className="feature-title">Get intelligent help with project context</h3>
              <p className="feature-description">Access an AI assistant that understands your project context. Get help with task breakdowns, quick summaries, and answers to project-specific questions, all powered by advanced language models.</p>
              <ul className="feature-list">
                <li>Context-aware project assistance</li>
                <li>Task breakdown suggestions</li>
                <li>Conversation summaries</li>
                <li>Always-available help and Q&A</li>
              </ul>
            </div>
            <div className="feature-visual">
              <img src="/api/assets/solutiondb.png" alt="AI Assistant" onError={(e)=>{ e.currentTarget.src='/api/assets/mainLogo.png'; }} />
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
              <div className="logo-single-showcase">
                <div className="logo-card large">
                  <img src="/api/assets/mainLogo.png" alt="UnityBoard primary logo" onError={(e)=>{ e.currentTarget.src='/api/assets/logo.png'; }} />
                </div>
              </div>
            </div>
            <div className="feature-text">
              <div className="feature-kicker">Benefits</div>
              <h3 className="feature-title">Why choose our platform?</h3>
              <div className="benefits-grid">
                {[
                  {icon:'⚡', title:'AI‑Powered', desc:'Smart assistance and automation with advanced AI.'},
                  {icon:'🤝', title:'Team‑Focused', desc:'Built for collaborative work with role-based access.'},
                  {icon:'🔒', title:'Secure & Reliable', desc:'Privacy controls and data protection by design.'},
                  {icon:'📊', title:'Analytics & Insights', desc:'Track progress and contributions with detailed metrics.'}
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

      {/* Improved CTA Section - Only show for non-authenticated users */}
      {!isAuthed && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <div className="cta-text">
                <h2 className="cta-title">Ready to streamline your project workflow?</h2>
                <p className="cta-subtitle">Join developers and teams who are already using UnityBoard to organize projects, collaborate effectively, and build amazing things together.</p>
                <div className="cta-features">
                  <div className="cta-feature">✅ Free to get started</div>
                  <div className="cta-feature">✅ No setup complexity</div>
                  <div className="cta-feature">✅ Start collaborating immediately</div>
                </div>
              </div>
              <div className="cta-actions">
                <a className="btn btn-cta-primary" href="/register">Get Started Now</a>
                <a className="btn btn-cta-secondary" href="mailto:arpit21345j@gmail.com">Contact Us</a>
              </div>
            </div>
          </div>
        </section>
      )}

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
                  {icon:'💬', title:'Discussion', desc:'Threaded conversations and real-time chat.'},
                  {icon:'🤖', title:'AI Assistant', desc:'Context-aware help and smart suggestions.'},
                  {icon:'✉️', title:'Invitations', desc:'Invite codes, links, and public projects.'},
                  {icon:'📈', title:'Analytics', desc:'Track contributions and project progress.'},
                  {icon:'🔒', title:'Access Control', desc:'Role-based permissions and privacy settings.'}
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
            <div className="feature-visual feature-visual-expanded">
              <div className="public-projects">
                <div className="public-projects-header">
                  <h3 className="public-projects-title">Explore Public Projects {count > 0 ? `(${count})` : ''}</h3>
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="project-search"
                    />
                  </div>
                </div>
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
                  <div className="projects-grid">
                    {filteredProjects.map((project) => (
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
          disabled={joiningId === project._id}
          onClick={async () => {
            if (joiningId) return;
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                localStorage.setItem('postLoginRedirect', `/project/${project._id}`);
                window.location.href = '/login';
                return;
              }
              setJoiningId(project._id);
              const joined = await apiJoinPublicProject(project._id);
              try { window.dispatchEvent(new Event('projects-changed')); } catch {}
              if (!joined || !joined._id) throw new Error('Join failed');
              window.location.href = `/project/${joined._id}`;
            } catch (e) {
              const cat = categorizeJoinError(e?.message);
              if (cat.type === 'unauthorized') {
                localStorage.removeItem('token');
                window.location.href = '/login';
              } else if (cat.type === 'already-member') {
                notify(cat.message,'info');
                setTimeout(()=> window.location.href = `/project/${project._id}`, 500);
              } else {
                notify(cat.message, cat.level === 'warn' ? 'error' : cat.level);
              }
            } finally {
              setJoiningId(null);
            }
          }}
        >
          {joiningId === project._id ? 'Joining…' : 'Join Project'}
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
