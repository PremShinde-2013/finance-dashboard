const { body, param } = require('express-validator');

const userIdParamValidator = [param('id').isUUID().withMessage('Invalid user id')];

const createUserValidator = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 64 })
        .withMessage('Password must be between 8 and 64 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must include at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must include at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must include at least one number'),
    body('role').optional().isIn(['admin', 'analyst', 'viewer']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
];

const updateUserValidator = [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').optional().trim().isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('role').optional().isIn(['admin', 'analyst', 'viewer']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
    body('avatar_url').optional({ nullable: true }).isString().withMessage('Avatar URL must be a string'),
];

const updateRoleValidator = [body('role').notEmpty().withMessage('Role is required').isIn(['admin', 'analyst', 'viewer']).withMessage('Invalid role')];

const updateStatusValidator = [body('status').notEmpty().withMessage('Status is required').isIn(['active', 'inactive']).withMessage('Invalid status')];

module.exports = {
    userIdParamValidator,
    createUserValidator,
    updateUserValidator,
    updateRoleValidator,
    updateStatusValidator,
};
