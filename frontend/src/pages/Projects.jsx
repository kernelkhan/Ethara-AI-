import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Button, Input, Label } from '../components/ui/Components';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users, Edit } from 'lucide-react';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', members: [] });

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      if (editProjectId) {
        await api.put(`/projects/${editProjectId}`, newProject);
        toast.success('Project updated');
      } else {
        await api.post('/projects', newProject);
        toast.success('Project created');
      }
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', members: [] });
      setEditProjectId(null);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editProjectId ? 'update' : 'create'} project`);
    }
  };

  const openEditModal = (project) => {
    setNewProject({
      name: project.name,
      description: project.description,
      members: project.members.map(m => m._id)
    });
    setEditProjectId(project._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Project deleted');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const toggleMember = (userId) => {
    setNewProject(prev => {
      const members = prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members };
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="animate-pulse" style={{ height: '2rem', width: '12rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}></div>
        <div className="project-grid">
          {[1,2,3].map(i => <div key={i} className="animate-pulse" style={{ height: '12rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem' }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground" style={{ marginTop: '0.25rem' }}>Manage your team projects.</p>
        </div>
        {user?.role === 'Admin' && (
          <Button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={16} /> New Project
          </Button>
        )}
      </div>

      <div className="project-grid stagger-2">
        {projects.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', border: '1px dashed var(--border)', borderRadius: '0.75rem' }}>
            No projects found.
          </div>
        ) : (
          projects.map(project => (
            <div key={project._id} className="card project-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 className="text-xl font-semibold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={project.name}>{project.name}</h3>
                {user?.role === 'Admin' && (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => openEditModal(project)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.25rem', color: 'var(--muted-foreground)' }} onMouseOver={e=>e.currentTarget.style.color='var(--primary)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted-foreground)'}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(project._id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.25rem', color: 'var(--muted-foreground)' }} onMouseOver={e=>e.currentTarget.style.color='var(--destructive)'} onMouseOut={e=>e.currentTarget.style.color='var(--muted-foreground)'}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm flex-1" style={{ marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {project.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                <Users size={16} />
                <span>{project.members?.length || 0} Members</span>
              </div>
            </div>
          ))
        )}
      </div>

      </div>
      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content animate-zoom-in">
            <h2 className="text-xl font-semibold" style={{ marginBottom: '1rem' }}>{editProjectId ? 'Edit Project' : 'Create New Project'}</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="input-field"
                  style={{ minHeight: '100px', resize: 'vertical', paddingTop: '0.5rem' }}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div style={{ maxHeight: '10rem', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.375rem', padding: '0.5rem' }}>
                <Label style={{ marginBottom: '0.5rem' }}>Assign Members</Label>
                {users.filter(u => u.role !== 'Admin').length === 0 ? (
                  <p className="text-sm text-muted-foreground" style={{ padding: '0.5rem' }}>No team members found. Create a 'Member' account to assign them here.</p>
                ) : (
                  users.filter(u => u.role !== 'Admin').map(u => (
                    <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem', cursor: 'pointer', borderRadius: '0.25rem' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--muted)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                      <input
                        type="checkbox"
                        checked={newProject.members.includes(u._id)}
                        onChange={() => toggleMember(u._id)}
                      />
                      <span className="text-sm">{u.name} ({u.email})</span>
                    </label>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem' }}>
                <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditProjectId(null); setNewProject({ name: '', description: '', members: [] }); }}>Cancel</Button>
                <Button type="submit">{editProjectId ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
