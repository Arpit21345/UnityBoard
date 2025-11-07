# UnityBoard Roles System Analysis

## Current Roles Structure

### 1. **Project Member Schema** (Backend: `models/Project.js`)
```javascript
const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' }
}, { _id: false });
```

### 2. **Role Definitions**
- **owner**: Project creator, full control (1 per project)
- **admin**: Elevated member, can moderate discussions
- **member**: Standard collaborator, basic access

### 3. **Permission Matrix**

| Action | Owner | Admin | Member | Notes |
|--------|-------|-------|--------|-------|
| **Project Management** |
| Edit project settings | ✅ | ❌ | ❌ | Name, description, visibility, password |
| Delete project | ✅ | ❌ | ❌ | Cascades all data |
| Archive/Unarchive | ✅ | ❌ | ❌ | Hide from active lists |
| **Member Management** |
| View members | ✅ | ✅ | ✅ | All can see member list |
| Change member roles | ✅ | ❌ | ❌ | member ↔ admin only |
| Remove members | ✅ | ❌ | ❌ | Cannot remove owner |
| Leave project | ❌ | ✅ | ✅ | Owner must transfer ownership first |
| **Content Creation** |
| Tasks/Resources/etc | ✅ | ✅ | ✅ | All members can create |
| Discussion moderation | ✅ | ✅ | ❌ | Pin/lock/delete messages |

### 4. **Backend Implementation Patterns**

#### Permission Check Functions:
```javascript
// In controllers/project.controller.js
const isOwner = project.members.some(m => 
  String(m.user) === String(req.user.id) && m.role === 'owner'
);

// In controllers/threads.controller.js  
function isOwnerOrAdmin(project, userId){
  return project.members?.some(m => {
    const memberId = typeof m.user === 'object' ? m.user._id : m.user;
    return String(memberId) === String(userId) && (m.role === 'owner' || m.role === 'admin');
  });
}
```

#### Key Controllers:
- `updateProjectSettings()`: Owner only
- `removeMember()`: Owner only, cannot remove owner
- `updateMemberRole()`: Owner only, member ↔ admin only
- `leaveProject()`: Non-owners only
- `deleteProject()`: Owner only

### 5. **Frontend Role Detection** (Project.jsx)
```javascript
const userId = me?.id || me?._id;
const myRole = project?.members?.find(m => 
  String(m.user) === String(userId)
)?.role;
const amOwner = project?.members?.some(m => 
  String(m.user) === String(userId) && m.role === 'owner'
);
const amPrivileged = project?.members?.some(m => 
  String(m.user) === String(userId) && (m.role === 'owner' || m.role === 'admin')
);
```

### 6. **Current Settings Interface**
- Shows: Project name (read-only), Password (read-only), Leave Project button
- Available to: All members (same interface)
- **Issue**: No role-based differentiation

## Required Implementation

### For **Members** (current interface + leave functionality)
- ✅ View project name (read-only)
- ✅ View project password (read-only) 
- ✅ Leave project button
- ❌ No edit capabilities

### For **Owners** (enhanced interface)
- ✅ Edit project name + save button
- ✅ Edit project password + save button
- ✅ Remove members section
- ✅ Delete project button
- ❌ No leave button (must transfer ownership first)

### API Endpoints Used
- `GET /api/projects/:id/members` - List members
- `PATCH /api/projects/:id` - Update project settings (owner only)
- `DELETE /api/projects/:id/members/:userId` - Remove member (owner only)  
- `DELETE /api/projects/:id` - Delete project (owner only)
- `POST /api/projects/:id/leave` - Leave project (non-owners)

### Notification System
- Member removal triggers notification to removed user
- Project changes (name/password) should notify all members
- Uses existing toast notification system

## Security Notes
- All permission checks use consistent `String()` conversion for ID comparison
- Backend enforces all restrictions regardless of frontend UI
- Owner role cannot be modified or removed via API
- Project deletion cascades to all related data