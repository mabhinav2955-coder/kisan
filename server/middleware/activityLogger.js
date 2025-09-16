import Activity from '../models/Activity.js';

export const logActivity = (type) => async (req, _res, next) => {
  try {
    if (!req.user?.userId) return next();
    const payload = {
      farmerId: req.user.userId,
      type: type || 'spraying',
      title: req.method + ' ' + req.originalUrl,
      description: (req.body && JSON.stringify(req.body).slice(0, 300)) || '',
      date: new Date(),
      status: 'completed'
    };
    await Activity.create(payload);
  } catch (e) {
    // No-op on logging errors
  } finally {
    next();
  }
};

export default logActivity;


