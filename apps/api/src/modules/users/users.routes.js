const express = require('express');

const authMiddleware = require('../../middleware/auth.middleware');
const validateRequest = require('../../middleware/validate.middleware');
const { allowRoles } = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles');
const usersController = require('./users.controller');
const {
    userIdParamValidator,
    createUserValidator,
    updateUserValidator,
    updateRoleValidator,
    updateStatusValidator,
} = require('./users.validator');

const router = express.Router();

router.use(authMiddleware, allowRoles(ROLES.ADMIN));

router.get('/', usersController.listUsers);
router.get('/:id', userIdParamValidator, validateRequest, usersController.getUserById);
router.post('/', createUserValidator, validateRequest, usersController.createUser);
router.put('/:id', userIdParamValidator, updateUserValidator, validateRequest, usersController.updateUser);
router.patch('/:id/role', userIdParamValidator, updateRoleValidator, validateRequest, usersController.updateRole);
router.patch('/:id/status', userIdParamValidator, updateStatusValidator, validateRequest, usersController.updateStatus);
router.delete('/:id', userIdParamValidator, validateRequest, usersController.softDeleteUser);
router.delete('/:id/hard', userIdParamValidator, validateRequest, usersController.hardDeleteUser);

module.exports = router;
