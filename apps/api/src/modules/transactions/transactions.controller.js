const { StatusCodes } = require('http-status-codes');

const asyncHandler = require('../../utils/asyncHandler');
const { successResponse } = require('../../utils/apiResponse');
const transactionsService = require('./transactions.service');
const { logAudit, extractRequestMeta } = require('../../services/auditLog.service');

const listTransactions = asyncHandler(async (req, res) => {
    const result = await transactionsService.listTransactions(req.query, req.user);

    return successResponse(res, {
        message: 'Transactions fetched successfully',
        data: result.data,
        meta: result.meta,
    });
});

const getTransactionById = asyncHandler(async (req, res) => {
    const data = await transactionsService.getTransactionById(req.params.id, true);

    return successResponse(res, {
        message: 'Transaction fetched successfully',
        data,
    });
});

const createTransaction = asyncHandler(async (req, res) => {
    const data = await transactionsService.createTransaction(req.body, req.user);

    await logAudit({
        userId: req.user.id,
        action: 'CREATE_TRANSACTION',
        entity: 'transactions',
        entityId: data.id,
        newData: data,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: 'Transaction created successfully',
        data,
    });
});

const updateTransaction = asyncHandler(async (req, res) => {
    const previous = await transactionsService.getTransactionById(req.params.id, true);
    const data = await transactionsService.updateTransaction(req.params.id, req.body, req.user);

    await logAudit({
        userId: req.user.id,
        action: 'UPDATE_TRANSACTION',
        entity: 'transactions',
        entityId: data.id,
        oldData: previous,
        newData: data,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'Transaction updated successfully',
        data,
    });
});

const softDeleteTransaction = asyncHandler(async (req, res) => {
    const previous = await transactionsService.getTransactionById(req.params.id, true);
    const data = await transactionsService.softDeleteTransaction(req.params.id, req.user);

    await logAudit({
        userId: req.user.id,
        action: 'SOFT_DELETE_TRANSACTION',
        entity: 'transactions',
        entityId: data.id,
        oldData: previous,
        newData: data,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'Transaction deleted successfully',
        data,
    });
});

const hardDeleteTransaction = asyncHandler(async (req, res) => {
    const previous = await transactionsService.hardDeleteTransaction(req.params.id);

    await logAudit({
        userId: req.user.id,
        action: 'HARD_DELETE_TRANSACTION',
        entity: 'transactions',
        entityId: previous.id,
        oldData: previous,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'Transaction permanently deleted',
        data: { id: previous.id },
    });
});

const restoreTransaction = asyncHandler(async (req, res) => {
    const previous = await transactionsService.getTransactionById(req.params.id, true);
    const data = await transactionsService.restoreTransaction(req.params.id, req.user);

    await logAudit({
        userId: req.user.id,
        action: 'RESTORE_TRANSACTION',
        entity: 'transactions',
        entityId: data.id,
        oldData: previous,
        newData: data,
        ...extractRequestMeta(req),
    });

    return successResponse(res, {
        message: 'Transaction restored successfully',
        data,
    });
});

module.exports = {
    listTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    softDeleteTransaction,
    hardDeleteTransaction,
    restoreTransaction,
};
