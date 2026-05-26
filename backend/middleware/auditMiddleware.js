const AuditLog = require('../models/AuditLog');

const TRACKED = [
  { method: 'POST',   path: /\/rides$/,          action: 'CREATE_RIDE' },
  { method: 'DELETE', path: /\/rides\//,          action: 'DELETE_RIDE' },
  { method: 'POST',   path: /\/bookings$/,        action: 'CREATE_BOOKING' },
  { method: 'PUT',    path: /\/bookings\/.+\/accept/, action: 'ACCEPT_BOOKING' },
  { method: 'PUT',    path: /\/bookings\/.+\/refuse/, action: 'REFUSE_BOOKING' },
  { method: 'POST',   path: /\/reports$/,         action: 'CREATE_REPORT' },
  { method: 'PATCH',  path: /\/reports\/.+\/status/, action: 'UPDATE_REPORT' },
  { method: 'POST',   path: /\/reviews$/,         action: 'CREATE_REVIEW' },
];

module.exports = function auditMiddleware(req, res, next) {
  const rule = TRACKED.find(r => r.method === req.method && r.path.test(req.path));
  if (!rule || !req.user) return next();

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (res.statusCode < 400) {
      AuditLog.create({
        userId: req.user.id,
        action: rule.action,
        target: req.params?.id || null,
        details: { body: req.body, status: res.statusCode },
        ip: req.ip || null,
      }).catch(() => {});
    }
    return originalJson(body);
  };
  next();
};
