const { body, param } = require('express-validator');

const transactionIdParamValidator = [param('id').isUUID().withMessage('Invalid transaction id')];

const createTransactionValidator = [
    body('amount').notEmpty().withMessage('Amount is required').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('type').notEmpty().withMessage('Type is required').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Date must be valid')
        .custom((value) => {
            const inputDate = new Date(value);
            if (Number.isNaN(inputDate.getTime())) {
                throw new Error('Date must be valid');
            }
            const today = new Date();
            if (inputDate > today) {
                throw new Error('Date cannot be in the future');
            }
            return true;
        }),
    body('description').optional({ nullable: true }).isString().withMessage('Description must be a string'),
    body('notes').optional({ nullable: true }).isString().withMessage('Notes must be a string'),
    body('category_id').optional({ nullable: true }).isUUID().withMessage('category_id must be UUID'),
    body('user_id').optional().isUUID().withMessage('user_id must be UUID'),
    body('tags').optional().isArray({ max: 10 }).withMessage('tags must be array with max 10 values'),
    body('tags.*').optional().isString().withMessage('Each tag must be a string').isLength({ min: 1, max: 30 }).withMessage('Each tag must be 1-30 chars'),
];

const updateTransactionValidator = [
    body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be valid')
        .custom((value) => {
            const inputDate = new Date(value);
            if (Number.isNaN(inputDate.getTime())) {
                throw new Error('Date must be valid');
            }
            const today = new Date();
            if (inputDate > today) {
                throw new Error('Date cannot be in the future');
            }
            return true;
        }),
    body('description').optional({ nullable: true }).isString().withMessage('Description must be a string'),
    body('notes').optional({ nullable: true }).isString().withMessage('Notes must be a string'),
    body('category_id').optional({ nullable: true }).isUUID().withMessage('category_id must be UUID'),
    body('tags').optional().isArray({ max: 10 }).withMessage('tags must be array with max 10 values'),
    body('tags.*').optional().isString().withMessage('Each tag must be a string').isLength({ min: 1, max: 30 }).withMessage('Each tag must be 1-30 chars'),
];

module.exports = {
    transactionIdParamValidator,
    createTransactionValidator,
    updateTransactionValidator,
};
