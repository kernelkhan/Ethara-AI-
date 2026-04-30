import React, { useState, useEffect, useContext, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Button, Input, Label } from '../components/ui/Components';
import toast from 'react-hot-toast';
import { Plus, Trash2, Calendar, Search, Filter, Edit, LayoutGrid, List } from 'lucide-react';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortByDate, setSortByDate] = useState('asc'); 
  const [viewMode, setViewMode] = useState('board'); // 'list' or 'board'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', projectId: '', assignedTo: '', dueDate: '' });

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'Admin') {
      fetchProjects();
      fetchUsers();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const { data } = await api.get('/projects');
    setProjects(data);
  };

  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      if (editTaskId) {
        await api.put(`/tasks/${editTaskId}`, newTask);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', newTask);
        toast.success('Task created');
      }
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', projectId: '', assignedTo: '', dueDate: '' });
      setEditTaskId(null);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editTaskId ? 'update' : 'create'} task`);
    }
  };

  const openEditModal = (task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      projectId: task.projectId?._id || '',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setEditTaskId(task._id);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        toast.success('Task deleted');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside a droppable area
    if (!destination) return;
    
    // If dropped in the same place
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    // Find the task
    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    // Check permissions
    if (user.role !== 'Admin' && task.assignedTo?._id !== user._id) {
      toast.error('Not authorized to update this task');
      return;
    }

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    setTasks(prevTasks => prevTasks.map(t => 
      t._id === draggableId ? { ...t, status: newStatus } : t
    ));

    // API update
    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
      toast.success('Task status updated');
      // fetchTasks() is not strictly necessary if optimistic update works, but good for sync
    } catch (error) {
      toast.error('Failed to update status');
      fetchTasks(); // Revert on failure
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (search) {
      result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    }

    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.dueDate || '2099-12-31').getTime();
      const dateB = new Date(b.dueDate || '2099-12-31').getTime();
      return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [tasks, search, statusFilter, sortByDate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="animate-pulse" style={{ height: '2rem', width: '12rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}></div>
        <div className="animate-pulse" style={{ height: '3rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse" style={{ height: '6rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem' }}></div>)}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return 'badge-green';
      case 'In Progress': return 'badge-blue';
      default: return 'badge-amber';
    }
  };

  const columns = ['Pending', 'In Progress', 'Completed'];

  return (
    <>
      <div className="animate-fade-in animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="stagger-1" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground" style={{ marginTop: '0.25rem' }}>Manage and track task progress.</p>
        </div>
        {user?.role === 'Admin' && (
          <Button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
            <Plus size={16} /> New Task
          </Button>
        )}
      </div>

      <div className="card task-filters stagger-2" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
          <Search style={{ position: 'absolute', left: '0.625rem', top: '0.625rem', height: '1rem', width: '1rem', color: 'var(--muted-foreground)' }} />
          <Input 
            placeholder="Search tasks..." 
            style={{ paddingLeft: '2.25rem' }} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {viewMode === 'list' && (
            <select 
              className="input-field"
              style={{ width: '100%', maxWidth: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All" style={{ background: 'var(--background)' }}>All Status</option>
              <option value="Pending" style={{ background: 'var(--background)' }}>Pending</option>
              <option value="In Progress" style={{ background: 'var(--background)' }}>In Progress</option>
              <option value="Completed" style={{ background: 'var(--background)' }}>Completed</option>
            </select>
          )}
          {viewMode === 'list' && (
            <Button variant="outline" onClick={() => setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc')} style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <Filter size={16} /> {sortByDate === 'asc' ? 'Oldest First' : 'Newest First'}
            </Button>
          )}
          
          <div style={{ display: 'flex', background: 'var(--muted)', borderRadius: 'var(--radius)', padding: '0.25rem' }}>
            <button 
              onClick={() => setViewMode('list')} 
              style={{ border: 'none', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.5rem', backgroundColor: viewMode === 'list' ? 'var(--background)' : 'transparent', color: viewMode === 'list' ? 'var(--foreground)' : 'var(--muted-foreground)', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center' }}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('board')} 
              style={{ border: 'none', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.5rem', backgroundColor: viewMode === 'board' ? 'var(--background)' : 'transparent', color: viewMode === 'board' ? 'var(--foreground)' : 'var(--muted-foreground)', boxShadow: viewMode === 'board' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center' }}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="task-list stagger-3">
          {filteredAndSortedTasks.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', border: '1px dashed var(--border)', borderRadius: '0.75rem' }}>
            No tasks found.
          </div>
        ) : (
          filteredAndSortedTasks.map(task => (
            <div 
              key={task._id} 
              className={`card task-item ${task.isOverdue ? 'overdue' : ''}`}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {task.isOverdue && <span className="badge badge-red">OVERDUE</span>}
                    <span className={`badge ${getStatusBadge(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}>
                  <span style={{ backgroundColor: 'var(--muted)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>Project: {task.projectId?.name || 'N/A'}</span>
                  <span>Assignee: {task.assignedTo?.name || 'Unassigned'}</span>
                  {task.dueDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: task.isOverdue ? 'var(--destructive)' : 'inherit', fontWeight: task.isOverdue ? 500 : 400 }}>
                      <Calendar size={14} />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem' }} className="md:flex-col md:items-end md:border-t-0 md:border-l md:pt-0 md:pl-4">
                <select 
                  className="input-field"
                  style={{ height: '2.25rem', width: '100%', maxWidth: '140px', padding: '0.25rem 0.75rem' }}
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                >
                  <option value="Pending" style={{ background: 'var(--background)' }}>Pending</option>
                  <option value="In Progress" style={{ background: 'var(--background)' }}>In Progress</option>
                  <option value="Completed" style={{ background: 'var(--background)' }}>Completed</option>
                </select>
                {user?.role === 'Admin' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '0.25rem' }} onMouseOver={e=>e.currentTarget.style.color='var(--primary)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted-foreground)'} onClick={() => openEditModal(task)}>
                      <Edit size={16} />
                    </button>
                    <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '0.25rem' }} onMouseOver={e=>e.currentTarget.style.color='var(--destructive)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted-foreground)'} onClick={() => handleDelete(task._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board stagger-3">
            {columns.map(column => {
              const columnTasks = filteredAndSortedTasks.filter(t => t.status === column);
              return (
                <div key={column} className="kanban-column">
                  <div className="kanban-column-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: column === 'Pending' ? '#f59e0b' : column === 'In Progress' ? '#3b82f6' : '#10b981' }}></span>
                      {column}
                    </div>
                    <span style={{ backgroundColor: 'var(--muted)', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>{columnTasks.length}</span>
                  </div>
                  
                  <Droppable droppableId={column}>
                    {(provided) => (
                      <div 
                        className="kanban-droppable"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`kanban-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                                style={{
                                  ...provided.draggableProps.style,
                                  borderColor: task.isOverdue ? 'rgba(239, 68, 68, 0.4)' : 'var(--border)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                  <h4 className="font-semibold text-sm" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.title}</h4>
                                  {task.isOverdue && <span style={{ color: 'var(--destructive)' }}><Calendar size={14} /></span>}
                                </div>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '1rem' }}>
                                  {task.projectId && <span style={{ backgroundColor: 'var(--muted)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>{task.projectId.name}</span>}
                                  {task.assignedTo && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>@{task.assignedTo.name.split(' ')[0]}</span>}
                                </div>

                                {user?.role === 'Admin' && (
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                    <button onClick={() => openEditModal(task)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.25rem', color: 'var(--muted-foreground)' }} onMouseOver={e=>e.currentTarget.style.color='var(--primary)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted-foreground)'}>
                                      <Edit size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(task._id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.25rem', color: 'var(--muted-foreground)' }} onMouseOver={e=>e.currentTarget.style.color='var(--destructive)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted-foreground)'}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      </div>
      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content animate-zoom-in">
            <h2 className="text-xl font-semibold" style={{ marginBottom: '1rem' }}>{editTaskId ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="input-field"
                  style={{ minHeight: '80px', resize: 'vertical', paddingTop: '0.5rem' }}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Label htmlFor="project">Project</Label>
                  <select
                    id="project"
                    required
                    className="input-field"
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                  >
                    <option value="" disabled style={{ background: 'var(--background)' }}>Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id} style={{ background: 'var(--background)' }}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <select
                    id="assignedTo"
                    className="input-field"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  >
                    <option value="" style={{ background: 'var(--background)' }}>Unassigned</option>
                    {users.map(u => <option key={u._id} value={u._id} style={{ background: 'var(--background)' }}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem' }}>
                <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditTaskId(null); setNewTask({ title: '', description: '', projectId: '', assignedTo: '', dueDate: '' }); }}>Cancel</Button>
                <Button type="submit">{editTaskId ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Tasks;
