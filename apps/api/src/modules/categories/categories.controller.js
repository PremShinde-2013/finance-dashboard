const { StatusCodes } = require('http-status-codes');

const asyncHandler = require('../../utils/asyncHandler');
const { successResponse } = require('../../utils/apiResponse');
const categoriesService = require('./categories.service');
const { logAudit, extractRequestMeta } = require('../../services/auditLog.service');

const listCategories = asyncHandler(async (_req, res) => {
    const data = await categoriesService.listCategories();

    return successResponse(res, {
        message: 'Categories fetched successfully',
        data,
    });
});

const getCategoryById = asyncHandler(async (req, res) => {
    const data = await categoriesService.getCategoryById(req.params.id);

    return successResponse(res, {
        message: 'Category fetched successfully',
        data,
    });
});

const createCategory = asyncHandler(async (req, res) => {
    const data = await categoriesService.createCategory(req.body, req.user.id);

    await logAudit({
        userId: req.user.id,
        action: 'CREATE_CATEGORY',
        entity: 'categories',
        entityId: data.id,
        newData: data,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: 'Category created successfully',
        data,
    });
});

const updateCategory = asyncHandler(async (req, res) => {
    const previous = await categoriesService.getCategoryById(req.params.id);
    const data = await categoriesService.updateCategory(req.params.id, req.body);

    await logAudit({
        userId: req.user.id,
        action: 'UPDATE_CATEGORY',
        entity: 'categories',
        entityId: data.id,
        oldData: previous,
        newData: data,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'Category updated successfully',
        data,
    });
});

const deleteCategory = asyncHandler(async (req, res) => {
    const previous = await categoriesService.deleteCategory(req.params.id);

    await logAudit({
        userId: req.user.id,
        action: 'DELETE_CATEGORY',
        entity: 'categories',
        entityId: previous.id,
        oldData: previous,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'Category deleted successfully',
        data: { id: previous.id },
    });
});

module.exports = {
    listCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
