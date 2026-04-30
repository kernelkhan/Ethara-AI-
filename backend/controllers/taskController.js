import Task from '../models/Task.js';
import Project from '../models/Project.js';

// Admin: Create Task
export const createTask = async (req, res) => {
  const { title, description, projectId, assignedTo, dueDate } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = new Task({
      title,
      description,
      projectId,
      assignedTo,
      dueDate
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all tasks, Member: Get assigned tasks
export const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin') {
      tasks = await Task.find({}).populate('projectId', 'name').populate('assignedTo', 'name email');
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('projectId', 'name').populate('assignedTo', 'name email');
    }
    
    // Dynamically flag overdue tasks in response but don't mutate DB status to avoid triggering hooks unnecessarily
    const tasksWithOverdueFlag = tasks.map(task => {
        const isOverdue = task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date();
        return {
            ...task._doc,
            isOverdue
        };
    });

    res.json(tasksWithOverdueFlag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Member/Admin: Update Task
export const updateTask = async (req, res) => {
  const { status, title, description, projectId, assignedTo, dueDate } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      if (req.user.role !== 'Admin') {
        if (task.assignedTo.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized to update this task' });
        }
        // Members can only update status
        task.status = status || task.status;
      } else {
        // Admins can update all fields
        task.status = status || task.status;
        task.title = title || task.title;
        task.description = description || task.description;
        task.projectId = projectId || task.projectId;
        task.assignedTo = assignedTo || task.assignedTo;
        task.dueDate = dueDate || task.dueDate;
      }

      const updatedTask = await task.save();
      
      const isOverdue = updatedTask.status !== 'Completed' && updatedTask.dueDate && new Date(updatedTask.dueDate) < new Date();
      
      res.json({ ...updatedTask._doc, isOverdue });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete Task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      await Task.deleteOne({ _id: req.params.id });
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
