# Dashboard UI/UX Changes

## Overview
Simplifying the dashboard UI to align with the new GitHub-style unique project name system. Removing unnecessary features and improving user experience for project joining.

---

## Changes Required

### 1. **Fix "New Project" Button Hover CSS** ✅
**Issue:** Button color disappears on hover/click  
**Location:** Dashboard.jsx line 116, uses `btn primary` class  
**Current Implementation:**
```css
.btn-primary, .btn.primary {
  background: linear-gradient(135deg,var(--primary-600),var(--accent-500));
  color:#fff;
}
.btn-primary:hover, .btn.primary:hover {
  background: linear-gradient(135deg,var(--primary-700),var(--accent-600));
  color:#fff;
}
```
**Required Change:** Ensure text color stays black and visible on hover/click  
**Solution:** Update hover state to maintain `color: #000;` or ensure gradient remains visible

---

### 2. **Remove Invite Code Input Box** ✅
**Issue:** Invite code system is deprecated with unique project names  
**Location:** Dashboard.jsx lines 119-121  
**Current Code:**
```jsx
<div className="join-inline">
  <input value={joinCode} onChange={(e)=>setJoinCode(e.target.value)} placeholder="Join Code" />
  <button className="btn" onClick={handleJoinWithCode}>Join</button>
</div>
```
**Required Change:** Remove entire invite code form section  
**Reason:** Projects now join by unique name, not invite codes

---

### 3. **Fix Role Badges & Remove Unnecessary Buttons** ✅
**Issues:**
- All projects show "owner" tag incorrectly
- Archive button not needed
- Invite button not needed

**Location:** Dashboard.jsx lines 183-218 (project cards)

**Current Issues:**
```jsx
// Line 188: Shows role for ALL projects
<span className={`role-badge role-${myRole(p)}`}>{myRole(p)}</span>

// Line 196: Invite button unnecessary
<button onClick={...}>Invite</button>

// Line 197: Archive button unnecessary  
<button onClick={...}>Archive</button>
```

**myRole() Logic Issue (lines 56-60):**
```jsx
function myRole(proj){
  // Only checks ownerId, doesn't check members array
  if(proj.ownerId===user._id) return 'owner';
  const m = proj.members?.find(x=>x.userId===user._id);
  return m?.role || 'member';
}
```

**Required Changes:**
1. Fix `myRole()` logic to correctly identify owner vs member
2. Show "Owner" badge only for projects user owns
3. Show "Member" badge only for projects user is a member of (not owner)
4. Remove "Invite" button completely
5. Remove "Archive" button completely

---

### 4. **Simplify Project Joining Flow** ✅
**Current:** ProjectSearch component (separate component)  
**Location:** Referenced in Dashboard.jsx line 273

**Required Changes:**
1. Single input field for project name
2. When user enters project name:
   - Check if project exists
   - If not found: Show alert "Project not found"
   - If found & public: Join immediately
   - If found & private: Prompt for password, then join
3. Remove invite code logic
4. Use backend endpoint: `POST /api/projects/join-private` with `{ name, projectPassword }`

**Current ProjectSearch Component:**
```jsx
// Needs to be simplified to single-input flow
// Auto-detect if password needed based on visibility
```

---

## Implementation Order

1. ✅ **Change #1:** Fix "New Project" button CSS
2. ✅ **Change #2:** Remove invite code input
3. ✅ **Change #3:** Fix role badges, remove archive/invite buttons
4. ✅ **Change #4:** Update ProjectSearch component for simplified joining

---

## Files to Modify

### Primary Files:
- `frontend/src/pages/Dashboard/Dashboard.jsx` - Main dashboard logic
- `frontend/src/pages/Dashboard/Dashboard.css` - Dashboard styles
- `frontend/src/styles/global-buttons.css` - Button hover states
- `frontend/src/pages/Dashboard/ProjectSearch.jsx` - Project joining component

### Related Backend:
- `backend/src/controllers/project.controller.js` - Already supports unique name joining
- Endpoint: `POST /api/projects/join-private` with `{ name, projectPassword }`

---

## Testing Checklist

- [ ] "New Project" button maintains black text on hover
- [ ] Invite code input removed from dashboard header
- [ ] Owner projects show "Owner" badge correctly
- [ ] Member projects show "Member" badge correctly
- [ ] Archive button removed from all project cards
- [ ] Invite button removed from all project cards
- [ ] ProjectSearch accepts single project name input
- [ ] ProjectSearch shows "Project not found" for invalid names
- [ ] ProjectSearch joins public projects immediately
- [ ] ProjectSearch prompts for password on private projects
- [ ] ProjectSearch successfully joins private projects with correct password

---

## Notes

- Backend already supports unique name joining via `/api/projects/join-private`
- No database changes needed - schema already updated
- Frontend cleanup only - removing deprecated invite code system
- Improved UX with single-input joining flow
