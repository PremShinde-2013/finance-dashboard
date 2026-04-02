const express = require('express');

const authMiddleware = require('../../middleware/auth.middleware');
const { allowRoles } = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles');
const dashboardController = require('./dashboard.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', dashboardController.getSummary);
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/monthly-trends', allowRoles(ROLES.ADMIN, ROLES.ANALYST), dashboardController.getMonthlyTrends);
router.get('/weekly-trends', allowRoles(ROLES.ADMIN, ROLES.ANALYST), dashboardController.getWeeklyTrends);
router.get('/top-categories', allowRoles(ROLES.ADMIN, ROLES.ANALYST), dashboardController.getTopCategories);
router.get('/comparison', allowRoles(ROLES.ADMIN, ROLES.ANALYST), dashboardController.getComparison);

module.exports = router;
