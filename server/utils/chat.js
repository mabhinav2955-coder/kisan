import crypto from 'crypto';

// Generate unique session ID
export const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Clean old chat history (archive sessions older than 30 days)
export const cleanOldChatHistory = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await ChatHistory.updateMany(
      { 
        lastAccessed: { $lt: thirtyDaysAgo },
        isArchived: false 
      },
      { 
        $set: { isArchived: true } 
      }
    );

    console.log(`Archived ${result.modifiedCount} old chat sessions`);
    return result.modifiedCount;
  } catch (error) {
    console.error('Error cleaning old chat history:', error);
    return 0;
  }
};

// Limit chat history size per user (keep only last 50 sessions)
export const limitChatHistory = async (farmerId) => {
  try {
    const sessions = await ChatHistory.find({ farmerId, isArchived: false })
      .sort({ lastAccessed: -1 });

    if (sessions.length > 50) {
      const sessionsToArchive = sessions.slice(50);
      const sessionIds = sessionsToArchive.map(s => s._id);
      
      await ChatHistory.updateMany(
        { _id: { $in: sessionIds } },
        { $set: { isArchived: true } }
      );

      console.log(`Archived ${sessionsToArchive.length} old sessions for user ${farmerId}`);
    }
  } catch (error) {
    console.error('Error limiting chat history:', error);
  }
};
