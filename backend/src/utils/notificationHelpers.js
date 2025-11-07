import Notification from '../models/Notification.js';
import { getIo } from '../socketHub.js';

/**
 * Helper functions to create and send notifications
 * Centralized to avoid code duplication across controllers
 */

/**
 * Create and emit a notification
 * @param {string} userId - User ID to send notification to
 * @param {string} type - Notification type 
 * @param {string} message - Notification message
 * @param {Object} meta - Additional metadata (projectId, taskId, etc.)
 */
export async function createNotification(userId, type, message, meta = {}) {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      meta
    });

    // Emit socket event for real-time notifications
    const io = getIo();
    if (io) {
      console.log('Emitting notification via socket to user:', userId, 'Message:', message);
      io.emit('notification:new', { 
        userId: String(userId), 
        item: notification 
      });
    } else {
      console.log('Socket.IO not available, notification will not be sent in real-time');
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * Send notification when a new member joins a project
 * @param {Object} project - Project object
 * @param {Object} newMember - New member user object
 */
export async function notifyMemberJoined(project, newMember) {
  // Notify all admins and the owner about new member
  const adminsAndOwners = project.members.filter(m => 
    m.role === 'owner' || m.role === 'admin'
  );

  const promises = adminsAndOwners.map(member => 
    createNotification(
      String(member.user),
      'member_joined',
      `${newMember.name || newMember.email} joined project "${project.name}"`,
      { 
        projectId: project._id,
        projectName: project.name,
        newMemberId: newMember._id || newMember.id,
        newMemberName: newMember.name || newMember.email
      }
    )
  );

  // Also notify the new member that they joined
  promises.push(
    createNotification(
      String(newMember._id || newMember.id),
      'project_joined',
      `You joined project "${project.name}"`,
      { 
        projectId: project._id,
        projectName: project.name
      }
    )
  );

  await Promise.all(promises);
}

/**
 * Send notification when a member leaves a project voluntarily
 * @param {Object} project - Project object
 * @param {Object} leavingMember - Member who left
 */
export async function notifyMemberLeft(project, leavingMember) {
  const promises = [];
  
  // Notify the user who left
  promises.push(
    createNotification(
      String(leavingMember._id || leavingMember.id),
      'project_left',
      `You left project "${project.name}"`,
      { 
        projectId: project._id,
        projectName: project.name
      }
    )
  );

  // Notify all admins and the owner about member leaving
  const adminsAndOwners = project.members.filter(m => 
    m.role === 'owner' || m.role === 'admin'
  );

  adminsAndOwners.forEach(member => {
    promises.push(
      createNotification(
        String(member.user),
        'member_left',
        `${leavingMember.name || leavingMember.email} left project "${project.name}"`,
        { 
          projectId: project._id,
          projectName: project.name,
          leftMemberId: leavingMember._id || leavingMember.id,
          leftMemberName: leavingMember.name || leavingMember.email
        }
      )
    );
  });

  await Promise.all(promises);
}

/**
 * Send notification when a member is removed by owner
 * @param {Object} project - Project object
 * @param {Object} removedMember - Member who was removed
 * @param {Object} removedBy - Owner who removed the member
 */
export async function notifyMemberRemoved(project, removedMember, removedBy) {
  const promises = [];
  
  // Notify the user who was removed
  promises.push(
    createNotification(
      String(removedMember._id || removedMember.id),
      'removed_from_project',
      `You were removed from project "${project.name}" by ${removedBy.name || removedBy.email}`,
      { 
        projectId: project._id,
        projectName: project.name,
        removedBy: removedBy._id || removedBy.id,
        removedByName: removedBy.name || removedBy.email
      }
    )
  );

  // Notify the owner who removed the member
  promises.push(
    createNotification(
      String(removedBy._id || removedBy.id),
      'member_removed_confirmation',
      `You removed ${removedMember.name || removedMember.email} from project "${project.name}"`,
      { 
        projectId: project._id,
        projectName: project.name,
        removedMemberId: removedMember._id || removedMember.id,
        removedMemberName: removedMember.name || removedMember.email
      }
    )
  );

  await Promise.all(promises);
}

/**
 * Send notification when a task is assigned to a user
 * @param {Object} task - Task object
 * @param {Object} project - Project object  
 * @param {string} assigneeId - ID of user assigned to task
 * @param {Object} assignedBy - User who made the assignment
 */
export async function notifyTaskAssigned(task, project, assigneeId, assignedBy) {
  const promises = [];
  
  // Notify the assignee (user who got the task)
  promises.push(
    createNotification(
      assigneeId,
      'task_assigned',
      `You were assigned task "${task.title}" in project "${project.name}"`,
      { 
        projectId: project._id,
        projectName: project.name,
        taskId: task._id,
        taskTitle: task.title,
        assignedBy: assignedBy._id || assignedBy.id,
        assignedByName: assignedBy.name || assignedBy.email
      }
    )
  );
  
  // Also notify the admin/person who assigned the task (if different from assignee)
  const assignedById = String(assignedBy._id || assignedBy.id);
  if (String(assigneeId) !== assignedById) {
    // Get assignee details to show proper name
    try {
      const User = (await import('../models/User.js')).default;
      const assignee = await User.findById(assigneeId).select('name email');
      const assigneeName = assignee ? (assignee.name || assignee.email) : 'Unknown User';
      
      promises.push(
        createNotification(
          assignedById,
          'task_assigned_confirmation',
          `You assigned task "${task.title}" to ${assigneeName} in project "${project.name}"`,
          { 
            projectId: project._id,
            projectName: project.name,
            taskId: task._id,
            taskTitle: task.title,
            assigneeId: assigneeId,
            assigneeName: assigneeName
          }
        )
      );
    } catch (error) {
      console.error('Failed to get assignee details:', error);
    }
  }
  
  await Promise.all(promises);
}

/**
 * Send notification when a task is due
 * @param {Object} task - Task object with populated project
 * @param {string} assigneeId - ID of user assigned to task
 */
export async function notifyTaskDue(task, assigneeId) {
  const promises = [];
  
  // Notify the assignee that their task is due
  promises.push(
    createNotification(
      assigneeId,
      'task_due',
      `Your task "${task.title}" is due in project "${task.project.name}"`,
      { 
        projectId: task.project._id,
        projectName: task.project.name,
        taskId: task._id,
        taskTitle: task.title,
        dueDate: task.dueDate
      }
    )
  );
  
  // Also notify project admins and owner about the due task
  const adminsAndOwners = task.project.members.filter(m => 
    m.role === 'owner' || m.role === 'admin'
  );
  
  adminsAndOwners.forEach(member => {
    const memberId = String(member.user);
    // Don't notify if admin is the same person as assignee
    if (memberId !== String(assigneeId)) {
      promises.push(
        createNotification(
          memberId,
          'task_due_admin',
          `Task "${task.title}" assigned to ${assigneeId} is due in project "${task.project.name}"`,
          { 
            projectId: task.project._id,
            projectName: task.project.name,
            taskId: task._id,
            taskTitle: task.title,
            assigneeId: assigneeId,
            dueDate: task.dueDate
          }
        )
      );
    }
  });
  
  await Promise.all(promises);
}

/**
 * Send notification when a task status changes
 * @param {Object} task - Task object
 * @param {Object} project - Project object
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {Object} changedBy - User who changed the status
 */
export async function notifyTaskStatusChanged(task, project, oldStatus, newStatus, changedBy) {
  // Only notify if task has assignees and status changed to 'done'
  if (newStatus === 'done' && task.assignees && task.assignees.length > 0) {
    const promises = task.assignees.map(assigneeId => 
      createNotification(
        String(assigneeId),
        'task_completed',
        `Task "${task.title}" was marked as completed in project "${project.name}"`,
        { 
          projectId: project._id,
          projectName: project.name,
          taskId: task._id,
          taskTitle: task.title,
          changedBy: changedBy._id || changedBy.id,
          changedByName: changedBy.name || changedBy.email
        }
      )
    );

    await Promise.all(promises);
  }
}

/**
 * Send notification when user is invited to project
 * @param {Object} project - Project object
 * @param {Object} invite - Invitation object
 * @param {Object} invitedBy - User who created the invite
 */
export async function notifyProjectInvite(project, invite, invitedBy) {
  // This would be used if we had email invitations
  // For now, invites are just codes/links that users can share
  // We could notify when someone uses an invite code
}

/**
 * Bulk delete notifications for a user
 * @param {string} userId - User ID
 * @param {Array} notificationIds - Array of notification IDs to delete
 */
export async function deleteNotifications(userId, notificationIds) {
  try {
    const result = await Notification.deleteMany({
      user: userId,
      _id: { $in: notificationIds }
    });
    return result.deletedCount;
  } catch (error) {
    console.error('Failed to delete notifications:', error);
    throw new Error('Delete failed');
  }
}

/**
 * Delete all notifications for a user
 * @param {string} userId - User ID
 */
export async function deleteAllNotifications(userId) {
  try {
    const result = await Notification.deleteMany({ user: userId });
    return result.deletedCount;
  } catch (error) {
    console.error('Failed to delete all notifications:', error);
    throw new Error('Delete all failed');
  }
}