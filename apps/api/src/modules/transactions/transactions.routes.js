const express = require('express');

const authMiddleware = require('../../middleware/auth.middleware');
const validateRequest = require('../../middleware/validate.middleware');
const { allowRoles } = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles');
const transactionsController = require('./transactions.controller');
const { transactionIdParamValidator, createTransactionValidator, updateTransactionValidator } = require('./transactions.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', transactionsController.listTransactions);
router.get('/:id', transactionIdParamValidator, validateRequest, transactionsController.getTransactionById);
router.post('/', allowRoles(ROLES.ADMIN, ROLES.ANALYST), createTransactionValidator, validateRequest, transactionsController.createTransaction);
router.put('/:id', transactionIdParamValidator, allowRoles(ROLES.ADMIN, ROLES.ANALYST), updateTransactionValidator, validateRequest, transactionsController.updateTransaction);
router.delete('/:id/hard', transactionIdParamValidator, allowRoles(ROLES.ADMIN), validateRequest, transactionsController.hardDeleteTransaction);
router.patch('/:id/restore', transactionIdParamValidator, allowRoles(ROLES.ADMIN), validateRequest, transactionsController.restoreTransaction);
router.delete('/:id', transactionIdParamValidator, allowRoles(ROLES.ADMIN, ROLES.ANALYST), validateRequest, transactionsController.softDeleteTransaction);

module.exports = router;
