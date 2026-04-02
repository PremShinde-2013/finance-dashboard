const asyncHandler = require('../../utils/asyncHandler');
const { successResponse } = require('../../utils/apiResponse');
const dashboardService = require('./dashboard.service');

const getSummary = asyncHandler(async (req, res) => {
    const data = await dashboardService.getSummary(req.query);

    return successResponse(res, {
        message: 'Dashboard summary fetched successfully',
        data,
    });
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
    const data = await dashboardService.getCategoryBreakdown(req.query);

    return successResponse(res, {
        message: 'Category breakdown fetched successfully',
        data,
    });
});

const getRecentActivity = asyncHandler(async (req, res) => {
    const data = await dashboardService.getRecentActivity(req.query);

    return successResponse(res, {
        message: 'Recent activity fetched successfully',
        data,
    });
});

const getMonthlyTrends = asyncHandler(async (_req, res) => {
    const data = await dashboardService.getMonthlyTrends();

    return successResponse(res, {
        message: 'Monthly trends fetched successfully',
        data,
    });
});

const getWeeklyTrends = asyncHandler(async (_req, res) => {
    const data = await dashboardService.getWeeklyTrends();

    return successResponse(res, {
        message: 'Weekly trends fetched successfully',
        data,
    });
});

const getTopCategories = asyncHandler(async (req, res) => {
    const data = await dashboardService.getTopCategories(req.query);

    return successResponse(res, {
        message: 'Top categories fetched successfully',
        data,
    });
});

const getComparison = asyncHandler(async (_req, res) => {
    const data = await dashboardService.getComparison();

    return successResponse(res, {
        message: 'Comparison data fetched successfully',
        data,
    });
});

module.exports = {
    getSummary,
    getCategoryBreakdown,
    getRecentActivity,
    getMonthlyTrends,
    getWeeklyTrends,
    getTopCategories,
    getComparison,
};
