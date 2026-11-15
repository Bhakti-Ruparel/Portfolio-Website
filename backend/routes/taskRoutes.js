// routes/taskRoutes.js
// URL map for the Task resource. Handlers live in controllers/taskController.js.
// Every route is protected by the JWT auth middleware; create/update also run
// validation middleware first:   request → protect → validateTask → controller

const express = require('express');
const protect = require('../middleware/auth');
const validateTask = require('../middleware/validateTask');
const tasks = require('../controllers/taskController');

const router = express.Router();

// Any request without a valid Bearer token is rejected before reaching a handler.
router.use(protect);

// Static paths BEFORE '/:id', otherwise "stats" would be treated as an id.
router.get('/stats', tasks.getTaskStats);
router.delete('/completed', tasks.clearCompleted);

router.get('/', tasks.listTasks);
router.post('/', validateTask, tasks.createTask);

router.get('/:id', tasks.getTask);
router.put('/:id', validateTask.partial, tasks.updateTask);
router.patch('/:id', validateTask.partial, tasks.updateTask);
router.delete('/:id', tasks.deleteTask);

module.exports = router;
