import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import GlobalNavbar from '../../components/layout/GlobalNavbar.jsx';
import { apiMe, apiGetUserById } from '../../services/auth.js';
import { apiListProjects, apiListUserProjects } from '../../services/projects.js';
import { apiListSolutions } from '../../services/solutions.js';
import { apiListThreads, apiListMessages } from '../../services/discussion.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import './Profile.css';

const API = import.meta.env.VITE_API_URL || '';

export default function Profile(){
	const { userId } = useParams(); // Get userId from URL params
	const [me, setMe] = useState(null);
	const [viewingUser, setViewingUser] = useState(null); // The user whose profile we're viewing
	const [projects, setProjects] = useState([]);
	const [analytics, setAnalytics] = useState(null);
	const [err, setErr] = useState('');
	const [loading, setLoading] = useState(true);
	const [isOwnProfile, setIsOwnProfile] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				// Get current logged-in user
				const currentUser = await apiMe();
				setMe(currentUser);
				
				// Determine which user's profile to show
				let profileUser;
				let isOwn = true;
				let projectsList = [];
				
				// Ensure consistent string comparison for user IDs
				const currentUserId = String(currentUser.id || currentUser._id);
				const viewingUserId = String(userId || '');
				
				console.log('🔍 Profile Debug:', {
					userId,
					currentUserId,
					viewingUserId,
					isEqual: viewingUserId === currentUserId
				});
				
				if (userId && viewingUserId !== currentUserId) {
					// Viewing someone else's profile
					console.log('Loading other user profile:', userId);
					profileUser = await apiGetUserById(userId);
					isOwn = false;
				} else {
					// Viewing own profile (or no userId specified)
					console.log('Loading own profile');
					profileUser = currentUser;
					isOwn = true;
				}
				
				// Load projects for the profile user (works for both own and others)
				try {
					if (isOwn) {
						// For own profile, use existing API
						console.log('Loading own projects');
						const projectsData = await apiListProjects();
						projectsList = projectsData.projects || projectsData || [];
					} else {
						// For others' profile, use new API
						const targetUserId = profileUser.id || profileUser._id;
						console.log('Loading projects for user:', targetUserId);
						const projectsData = await apiListUserProjects(targetUserId);
						projectsList = projectsData.projects || projectsData || [];
					}
				} catch (projErr) {
					console.error('Failed to load projects:', projErr);
					projectsList = [];
					// Don't fail the entire profile load if projects fail
				}
				
				setViewingUser(profileUser);
				setIsOwnProfile(isOwn);
				setProjects(projectsList);
				
				// Calculate analytics from projects data
				const ownedProjects = projectsList.filter(p => 
					p.members?.some(m => String(m.user) === String(profileUser._id || profileUser.id) && m.role === 'owner')
				);
				const memberProjects = projectsList.filter(p => 
					p.members?.some(m => String(m.user) === String(profileUser._id || profileUser.id) && m.role !== 'owner')
				);
				const activeProjects = projectsList.filter(p => p.status !== 'archived');
				
				// Use permanent analytics from the profile user data if available
				const permanentAnalytics = profileUser.analytics || {};
				
				// Calculate current activity analytics for active projects
				let currentSolutions = 0;
				let currentContributions = 0;
				
				// COMMENTED OUT - Analytics loading can cause auth issues when viewing other profiles
				// Only load analytics for own profile to prevent 403 errors from projects user can't access
				/*
				// Get solutions and discussions for current projects
				const analyticsPromises = projectsList.map(async (project) => {
					try {
						const [solutionsRes, threadsRes] = await Promise.all([
							apiListSolutions(project._id).catch(() => ({ solutions: [] })),
							apiListThreads(project._id).catch(() => ({ threads: [] }))
						]);
						
						// Count user's solutions in current projects
						const userSolutions = (solutionsRes.solutions || []).filter(s => 
							String(s.author || s.createdBy) === String(profileUser._id || profileUser.id)
						);
						currentSolutions += userSolutions.length;
						
						// Count user's thread contributions in current projects
						const userThreads = (threadsRes.threads || []).filter(t => 
							String(t.author || t.createdBy) === String(profileUser._id || profileUser.id)
						);
						currentContributions += userThreads.length;
						
						// Count user's messages in all threads
						const messagePromises = (threadsRes.threads || []).map(async (thread) => {
							try {
								const messagesRes = await apiListMessages(thread._id);
								const userMessages = (messagesRes.messages || []).filter(m => 
									String(m.author || m.createdBy) === String(profileUser._id || profileUser.id)
								);
								return userMessages.length;
							} catch {
								return 0;
							}
						});
						
						const messageCounts = await Promise.all(messagePromises);
						currentContributions += messageCounts.reduce((sum, count) => sum + count, 0);
						
					} catch (error) {
						console.warn(`Failed to load analytics for project ${project.name}:`, error);
					}
				});
				
				// Wait for all analytics to complete
				if (analyticsPromises.length > 0) {
					await Promise.all(analyticsPromises);
				}
				*/
				
				// Simplified analytics - only use permanent data to avoid auth issues
				console.log('Using simplified analytics to prevent auth issues');
				
				setAnalytics({
					// Current state (can decrease when projects deleted)
					totalProjects: projectsList.length,
					ownedProjects: ownedProjects.length,
					memberProjects: memberProjects.length,
					activeProjects: activeProjects.length,
					
					// Permanent lifetime stats (never decrease) - use only stored analytics
					totalProjectsCreated: permanentAnalytics.totalProjectsCreated || 0,
					tasksCompleted: permanentAnalytics.totalTasksCompleted || 0,
					lifetimeSolutions: permanentAnalytics.lifetimeSolutions || 0,
					contributions: permanentAnalytics.totalContributions || 0, // Use stored value only
					
					joinedDate: profileUser.createdAt || profileUser.registeredAt || '2024-01-01'
				});
				
			} catch(e) {
				console.error('Profile data error:', e);
				
				// Don't show auth-related errors to prevent confusion
				if (e.message && (e.message.includes('401') || e.message.includes('Unauthorized'))) {
					setErr('Please log in to view user profiles');
				} else if (e.message && e.message.includes('404')) {
					setErr('User not found');
				} else {
					setErr(`Failed to load profile data: ${e.message || 'Unknown error'}`);
				}
			} finally {
				setLoading(false);
			}
		})();
	}, [userId]);
	function formatDate(dateString) {
		if (!dateString) return 'Recently';
		const date = new Date(dateString);
		const options = { year: 'numeric', month: 'long' };
		return date.toLocaleDateString('en-US', options);
	}



	return (
		<AppLayout sidebar={<Sidebar />} topbar={<GlobalNavbar />}> 
			<div className="container">
				{err && <div className="error-message">{err}</div>}
				{loading && <Spinner />}
				
				{!loading && !err && viewingUser && analytics && (
					<div className="profile-page">
						{/* Profile Header */}
						<div className="profile-header">
							<Avatar user={viewingUser} size="xl" />
							<div className="profile-info">
								<h1 className="profile-name">
									{viewingUser.name || 'Unnamed User'}
									{!isOwnProfile && <span className="profile-badge">Member</span>}
								</h1>
								<p className="profile-email">{isOwnProfile ? viewingUser.email : `${viewingUser.name}'s Profile`}</p>
								<div className="profile-meta">
									<span>Member since {formatDate(analytics.joinedDate)}</span>
									<span>•</span>
									<span>{analytics.totalProjectsCreated} lifetime projects</span>
									<span>•</span>
									<span>{analytics.lifetimeSolutions} lifetime solutions</span>
								</div>
							</div>
						</div>

						{/* Analytics Grid */}
						<div className="analytics-grid">
							<div className="analytics-card">
								<div className="analytics-number">{analytics.totalProjectsCreated}</div>
								<div className="analytics-label">Projects Created</div>
								<div className="analytics-detail">
									Lifetime count • {analytics.totalProjects} active
								</div>
							</div>
							
							<div className="analytics-card">
								<div className="analytics-number">{analytics.lifetimeSolutions}</div>
								<div className="analytics-label">Solutions Created</div>
								<div className="analytics-detail">
									Lifetime count • Never decreases
								</div>
							</div>
							
							<div className="analytics-card">
								<div className="analytics-number">{analytics.tasksCompleted}</div>
								<div className="analytics-label">Tasks Completed</div>
								<div className="analytics-detail">
									Across all projects
								</div>
							</div>
							
							<div className="analytics-card">
								<div className="analytics-number">{analytics.contributions}</div>
								<div className="analytics-label">Contributions</div>
								<div className="analytics-detail">
									Threads & messages
								</div>
							</div>
							
							<div className="analytics-card">
								<div className="analytics-number">{analytics.activeProjects}</div>
								<div className="analytics-label">Active Projects</div>
								<div className="analytics-detail">
									Currently participating
								</div>
							</div>
						</div>

						{/* Projects Portfolio - Show for all profiles (like LeetCode) */}
						<div className="projects-portfolio">
							<h3>{isOwnProfile ? 'Projects Portfolio' : `${viewingUser.name}'s Projects`}</h3>
							{projects.length === 0 ? (
								<div className="empty-state">
									<p>{isOwnProfile ? 'No projects yet. Start by creating or joining a project!' : 'No projects found for this user.'}</p>
								</div>
							) : (
								<div className="projects-grid">
									{projects.slice(0, 6).map(project => {
										const userMember = project.members?.find(m => 
											String(m.user) === String(viewingUser._id || viewingUser.id)
										);
										const role = userMember?.role || 'member';
											
											return (
												<div key={project._id} className="project-card">
												<div className="project-header">
													<h4 className="project-name">{project.name}</h4>
													<span className={`role-badge role-${role}`}>
														{role}
													</span>
												</div>
												<p className="project-description">
													{project.description || 'No description provided'}
												</p>
												<div className="project-meta">
													<span className="project-visibility">{project.visibility}</span>
													<span>•</span>
													<span>{project.members?.length || 0} members</span>
												</div>
											</div>
										);
									})}
								</div>
							)}
							{projects.length > 6 && (
								<div className="view-more">
									<span>And {projects.length - 6} more projects...</span>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</AppLayout>
	);
}
