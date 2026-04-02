const { StatusCodes } = require('http-status-codes');

const asyncHandler = require('../../utils/asyncHandler');
const { successResponse } = require('../../utils/apiResponse');
const usersService = require('./users.service');
const { logAudit, extractRequestMeta } = require('../../services/auditLog.service');

const listUsers = asyncHandler(async (req, res) => {
    const result = await usersService.listUsers(req.query);

    return successResponse(res, {
        message: 'Users fetched successfully',
        data: result.data,
        meta: result.meta,
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await usersService.getUserById(req.params.id);

    return successResponse(res, {
        message: 'User fetched successfully',
        data: user,
    });
});

const createUser = asyncHandler(async (req, res) => {
    const user = await usersService.createUser(req.body);

    await logAudit({
        userId: req.user.id,
        action: 'CREATE_USER',
        entity: 'users',
        entityId: user.id,
        newData: user,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: 'User created successfully',
        data: user,
    });
});

const updateUser = asyncHandler(async (req, res) => {
    const existing = await usersService.getUserById(req.params.id);
    const user = await usersService.updateUser(req.params.id, req.body);

    await logAudit({
        userId: req.user.id,
        action: 'UPDATE_USER',
        entity: 'users',
        entityId: user.id,
        oldData: existing,
        newData: user,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'User updated successfully',
        data: user,
    });
});

const updateRole = asyncHandler(async (req, res) => {
    const existing = await usersService.getUserById(req.params.id);
    const user = await usersService.updateRole(req.params.id, req.body.role);

    await logAudit({
        userId: req.user.id,
        action: 'UPDATE_USER_ROLE',
        entity: 'users',
        entityId: user.id,
        oldData: existing,
        newData: user,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'User role updated successfully',
        data: user,
    });
});

const updateStatus = asyncHandler(async (req, res) => {
    const existing = await usersService.getUserById(req.params.id);
    const user = await usersService.updateStatus(req.params.id, req.body.status);

    await logAudit({
        userId: req.user.id,
        action: 'UPDATE_USER_STATUS',
        entity: 'users',
        entityId: user.id,
        oldData: existing,
        newData: user,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'User status updated successfully',
        data: user,
    });
});

const softDeleteUser = asyncHandler(async (req, res) => {
    const existing = await usersService.getUserById(req.params.id);
    const user = await usersService.softDeleteUser(req.params.id);

    await logAudit({
        userId: req.user.id,
        action: 'SOFT_DELETE_USER',
        entity: 'users',
        entityId: user.id,
        oldData: existing,
        newData: user,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'User deleted successfully',
        data: user,
    });
});

const hardDeleteUser = asyncHandler(async (req, res) => {
    const existing = await usersService.getUserById(req.params.id);
    const user = await usersService.hardDeleteUser(req.params.id);

    await logAudit({
        userId: req.user.id,
        action: 'HARD_DELETE_USER',
        entity: 'users',
        entityId: existing.id,
        oldData: existing,
        newData: null,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'User permanently deleted successfully',
        data: user,
    });
});

module.exports = {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    updateRole,
    updateStatus,
    softDeleteUser,
    hardDeleteUser,
};
