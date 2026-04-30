import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks');
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="animate-pulse" style={{ height: '2rem', width: '16rem', backgroundColor: 'var(--muted)', borderRadius: '0.25rem' }}></div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse" style={{ height: '8rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem' }}></div>)}
        </div>
        <div className="animate-pulse" style={{ height: '24rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem' }}></div>
      </div>
    );
  }

  const completed = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const overdue = tasks.filter(t => t.isOverdue).length;

  const pieData = [
    { name: 'Completed', value: completed, color: '#10b981' }, 
    { name: 'In Progress', value: inProgress, color: '#3b82f6' }, 
    { name: 'Pending', value: pending, color: '#f59e0b' } 
  ];

  const projectStats = tasks.reduce((acc, task) => {
    const pName = task.projectId?.name || 'Unknown';
    if (!acc[pName]) acc[pName] = { name: pName, tasks: 0 };
    acc[pName].tasks++;
    return acc;
  }, {});
  const barData = Object.values(projectStats);

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass }) => (
    <div className="card stat-card">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold" style={{ marginTop: '0.5rem', color: 'var(--foreground)' }}>{value}</p>
      </div>
      <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: bgColorClass, color: colorClass }}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in animate-slide-in">
      <div className="page-header stagger-1">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground" style={{ marginTop: '0.25rem' }}>Here is an overview of your tasks.</p>
      </div>

      <div className="stats-grid stagger-2">
        <StatCard title="Total Tasks" value={tasks.length} icon={ListTodo} colorClass="var(--primary)" bgColorClass="rgba(37, 99, 235, 0.1)" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} colorClass="#22c55e" bgColorClass="rgba(34, 197, 94, 0.1)" />
        <StatCard title="Pending" value={pending + inProgress} icon={Clock} colorClass="#3b82f6" bgColorClass="rgba(59, 130, 246, 0.1)" />
        <StatCard title="Overdue" value={overdue} icon={AlertCircle} colorClass="#ef4444" bgColorClass="rgba(239, 68, 68, 0.1)" />
      </div>

      <div className="charts-grid">
        <div className="card chart-col-4 stagger-3" style={{ padding: '1.5rem' }}>
          <h3 className="text-lg font-semibold" style={{ marginBottom: '1rem' }}>Tasks by Project</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{fill: 'var(--muted)'}} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                <Bar dataKey="tasks" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-col-3 stagger-4" style={{ padding: '1.5rem' }}>
          <h3 className="text-lg font-semibold" style={{ marginBottom: '1rem' }}>Task Status Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
