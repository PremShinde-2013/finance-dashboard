const express = require('express');

const authMiddleware = require('../../middleware/auth.middleware');
const validateRequest = require('../../middleware/validate.middleware');
const { allowRoles } = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles');
const categoriesController = require('./categories.controller');
const { categoryIdParamValidator, createCategoryValidator, updateCategoryValidator } = require('./categories.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', categoriesController.listCategories);
router.get('/:id', categoryIdParamValidator, validateRequest, categoriesController.getCategoryById);
router.post('/', allowRoles(ROLES.ADMIN), createCategoryValidator, validateRequest, categoriesController.createCategory);
router.put('/:id', categoryIdParamValidator, allowRoles(ROLES.ADMIN), updateCategoryValidator, validateRequest, categoriesController.updateCategory);
router.delete('/:id', categoryIdParamValidator, allowRoles(ROLES.ADMIN), validateRequest, categoriesController.deleteCategory);

module.exports = router;
