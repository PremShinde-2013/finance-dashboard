const { body } = require('express-validator');

const registerValidator = [
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
];

const loginValidator = [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

const updateMeValidator = [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('avatar_url').optional({ nullable: true }).isString().withMessage('Avatar URL must be a string').isLength({ max: 500 }).withMessage('Avatar URL is too long'),
];

const changePasswordValidator = [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8, max: 64 })
        .withMessage('New password must be between 8 and 64 characters')
        .matches(/[A-Z]/)
        .withMessage('New password must include at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('New password must include at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('New password must include at least one number')
        .custom((value, { req }) => {
            if (value === req.body.current_password) {
                throw new Error('New password must be different from current password');
            }
            return true;
        }),
];

const refreshValidator = [
    body('refreshToken').notEmpty().withMessage('refreshToken is required').isString().withMessage('refreshToken must be string'),
];

module.exports = {
    registerValidator,
    loginValidator,
    updateMeValidator,
    changePasswordValidator,
    refreshValidator,
};
