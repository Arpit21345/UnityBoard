import Task from '../models/Task.js';
import { notifyTaskDue } from '../utils/notificationHelpers.js';

/**
 * Check for due tasks and send notifications
 * This should be called periodically (e.g., via cron job)
 */
export async function checkDueTasks() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Find tasks that are due tomorrow and haven't been notified yet
    const dueTasks = await Task.find({
      dueDate: {
        $gte: now,
        $lt: tomorrow
      },
      status: { $ne: 'done' },
      // Add a field to track if notification was sent
      dueDateNotificationSent: { $ne: true }
    }).populate({
      path: 'project',
      select: 'name members',
      populate: {
        path: 'members.user',
        select: 'name email'
      }
    });

    console.log(`Found ${dueTasks.length} tasks due tomorrow`);

    for (const task of dueTasks) {
      if (task.assignees && task.assignees.length > 0) {
        // Send notification to each assignee
        for (const assigneeId of task.assignees) {
          await notifyTaskDue(task, String(assigneeId));
        }
        
        // Mark task as notified
        await Task.updateOne(
          { _id: task._id },
          { $set: { dueDateNotificationSent: true } }
        );
      }
    }

    console.log(`Sent due date notifications for ${dueTasks.length} tasks`);
  } catch (error) {
    console.error('Error checking due tasks:', error);
  }
}

/**
 * Start the task scheduler
 * Checks for due tasks every hour
 */
export function startTaskScheduler() {
  console.log('Starting task due date scheduler...');
  
  // Check immediately on startup
  checkDueTasks();
  
  // Then check every hour
  setInterval(checkDueTasks, 60 * 60 * 1000); // 1 hour
}