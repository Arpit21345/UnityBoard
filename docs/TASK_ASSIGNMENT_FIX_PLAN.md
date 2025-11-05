# Task Assignment Button Fix Plan

## Current Problem Analysis

### Issue:
- "Assign me" button only works when task is unassigned
- When task is already assigned, button should show the assigned member's name
- When unassigned, clicking should assign to current user and show their name

## Desired Behavior

### State 1: Task is Unassigned
- **Display**: "Assign me" button
- **Action**: Click assigns task to current user
- **Result**: Button shows current user's name

### State 2: Task is Assigned to Current User  
- **Display**: Current user's name (e.g., "arpit")
- **Action**: Click unassigns task from current user
- **Result**: Button returns to "Assign me"

### State 3: Task is Assigned to Another User
- **Display**: Other user's name (e.g., "aman mishra")
- **Action**: Click assigns task to current user (reassignment)
- **Result**: Button shows current user's name

## Implementation Plan

### Step 1: Locate Task Assignment Component
- Find the Kanban task component with "Assign me" button
- Identify current assignment logic
- Understand task data structure

### Step 2: Analyze Task Data Structure
- Check how task assignment is stored (user ID, user object, etc.)
- Verify how user names are retrieved
- Understand current user context

### Step 3: Update Assignment Logic
- Add logic to detect current assignment state
- Implement proper assignment/unassignment toggle
- Handle reassignment between users

### Step 4: Update UI Display Logic
- Show assigned user name when task is assigned
- Show "Assign me" when task is unassigned
- Handle loading states and user name display

### Step 5: Test All Scenarios
- Test unassigned → assign to me
- Test assigned to me → unassign
- Test assigned to other → reassign to me
- Test with missing user data

## Technical Requirements

### Backend:
- Ensure task assignment endpoint exists
- Verify user name/data is included in task responses
- Check permission logic for task assignment

### Frontend:
- Update button display logic based on assignment state
- Implement proper assignment/unassignment API calls
- Handle user name display and fallbacks

### API Endpoints Needed:
- `PATCH /api/tasks/:id` - For updating task assignment
- Task data should include assigned user details

## File Investigation Priority

1. **Task Component** - Find the Kanban task card component
2. **Task Service** - Locate API calls for task updates
3. **Task Model** - Check how assignment is stored
4. **User Context** - Verify current user access

## Success Criteria

✅ **Unassigned tasks**: Show "Assign me" button
✅ **My assigned tasks**: Show my name, click to unassign  
✅ **Others' assigned tasks**: Show their name, click to reassign to me
✅ **Proper user names**: Display actual names, not IDs
✅ **Instant updates**: UI updates immediately after assignment change

This plan ensures we implement the assignment logic correctly without breaking existing functionality.
