import User from '../models/User.js';

export const incrementUserAnalytics = async (userId, field, count = 1) => {
  try {
    const updateField = `analytics.${field}`;
    await User.findByIdAndUpdate(
      userId,
      { $inc: { [updateField]: count } },
      { new: true }
    );
  } catch (error) {
    console.error('Error incrementing user analytics:', error);
  }
};

export const getUserAnalytics = async (userId) => {
  try {
    const user = await User.findById(userId).select('analytics');
    return user?.analytics || {
      totalProjectsCreated: 0,
      totalTasksCompleted: 0,
      totalContributions: 0,
      lifetimeSolutions: 0
    };
  } catch (error) {
    console.error('Error getting user analytics:', error);
    return {
      totalProjectsCreated: 0,
      totalTasksCompleted: 0,
      totalContributions: 0,
      lifetimeSolutions: 0
    };
  }
};