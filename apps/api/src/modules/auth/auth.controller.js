const { StatusCodes } = require('http-status-codes');

const asyncHandler = require('../../utils/asyncHandler');
const { successResponse } = require('../../utils/apiResponse');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
    const data = await authService.register(req.body);

    return successResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: 'Registration successful',
        data,
    });
});

const login = asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);

    return successResponse(res, {
        message: 'Login successful',
        data,
    });
});

const me = asyncHandler(async (req, res) => {
    const data = await authService.getMe(req.user.id);

    return successResponse(res, {
        message: 'Profile fetched successfully',
        data,
    });
});

const updateMe = asyncHandler(async (req, res) => {
    const data = await authService.updateMe(req.user.id, req.body);

    return successResponse(res, {
        message: 'Profile updated successfully',
        data,
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const data = await authService.changePassword(req.user.id, req.body);

    return successResponse(res, {
        message: 'Password changed successfully',
        data,
    });
});

const refresh = asyncHandler(async (req, res) => {
    const data = await authService.refreshAccessToken(req.body.refreshToken);

    return successResponse(res, {
        message: 'Access token refreshed successfully',
        data,
    });
});

const logout = asyncHandler(async (_req, res) => {
    const data = authService.logout();

    return successResponse(res, {
        message: 'Logout successful',
        data,
    });
});

module.exports = {
    register,
    login,
    me,
    updateMe,
    changePassword,
    refresh,
    logout,
};
