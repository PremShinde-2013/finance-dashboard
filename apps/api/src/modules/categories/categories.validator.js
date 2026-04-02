const { body, param } = require('express-validator');

const categoryIdParamValidator = [param('id').isUUID().withMessage('Invalid category id')];

const createCategoryValidator = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('type').notEmpty().withMessage('Type is required').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code'),
    body('icon').optional().isString().withMessage('Icon must be a string'),
    body('is_default').optional().isBoolean().withMessage('is_default must be boolean'),
];

const updateCategoryValidator = [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code'),
    body('icon').optional({ nullable: true }).isString().withMessage('Icon must be a string'),
    body('is_default').optional().isBoolean().withMessage('is_default must be boolean'),
];

module.exports = {
    categoryIdParamValidator,
    createCategoryValidator,
    updateCategoryValidator,
};
