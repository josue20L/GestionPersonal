import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useTasks from '../hooks/useTasks'
import useHabits from '../hooks/useHabits'
import useProjects from '../hooks/useProjects'
import db from '../db/dexie'

export default function Dashboard() {
  const navigate = useNavigate()
  const hoy = new Date().toISOString().split('T')[0]
  
  const { tasks, getTasks, addTask, updateTask, deleteTask } = useTasks()
  const { habits, getHabits, toggleHabitLog, getStreak } = useHabits()
  const { getProjects } = useProjects()
  
  const [habitLogs, setHabitLogs] = useState([])
  const [streaks, setStreaks] = useState({})
  const [upcomingProjects, setUpcomingProjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTask, setNewTask] = useState({ title: '' })
  
  // Estado para acordeones
  const [openSections, setOpenSections] = useState({
    tasks: true,
    habits: true,
    projects: true
  })

  const today = new Date()
  const dateISO = today.toISOString().slice(0, 10)

  // Saludo dinámico
  const hour = today.getHours()
  let greeting = 'Buenas noches'
  if (hour >= 5 && hour < 12) greeting = 'Buenos días'
  else if (hour >= 12 && hour < 18) greeting = 'Buenas tardes'

  // Fecha en español
  const options = { weekday: 'long', day: 'numeric', month: 'long' }
  const dateFormatted = today.toLocaleDateString('es-ES', options)
  const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1)

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = async () => {
    await getTasks(hoy)
    const allHabits = await getHabits()
    const logs = await db.habit_logs.where('date').equals(hoy).toArray()
    setHabitLogs(logs)

    // Calcular rachas
    const streakMap = {}
    for (const h of allHabits) {
      streakMap[h.id] = await getStreak(h.id)
    }
    setStreaks(streakMap)

    // Próximos proyectos
    const allProj = await getProjects()
    const next7Days = new Date()
    next7Days.setDate(today.getDate() + 7)
    
    const upcoming = allProj
      .filter(p => !p.completed && new Date(p.due_date) <= next7Days)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 2)
    setUpcomingProjects(upcoming)
  }

  const handleToggleTask = async (task) => {
    await updateTask(task.id, { completed: !task.completed })
    refreshData()
  }

  const handleDeleteTask = async (id) => {
    if (window.confirm('¿Eliminar esta tarea?')) {
      await deleteTask(id)
      refreshData()
    }
  }

  const handleToggleHabit = async (habitId) => {
    await toggleHabitLog(habitId, hoy)
    refreshData()
  }

  const handleSaveTask = async () => {
    if (!newTask.title.trim()) return
    await addTask({ title: newTask.title, date: hoy, completed: false })
    setNewTask({ title: '' })
    setIsModalOpen(false)
    refreshData()
  }

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const getRemainingDays = (dueDate) => {
    const diff = new Date(dueDate) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getBadgeStyle = (days) => {
    if (days <= 1) return { backgroundColor: '#7f1d1d', color: '#fca5a5' }
    if (days <= 3) return { backgroundColor: '#78350f', color: '#fcd34d' }
    return { backgroundColor: '#14532d', color: '#86efac' }
  }

  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const completedHabits = habitLogs.filter(l => l.completed).length
  const totalHabits = habits.length
  const progress = (totalTasks + totalHabits) > 0 ? Math.round(((completedTasks + completedHabits) / (totalTasks + totalHabits)) * 100) : 0

  return (
    <div style={{ padding: '24px 16px 100px', color: '#ffffff', backgroundColor: '#030712', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 4px 0' }}>{capitalizedDate}</p>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{greeting}</h1>
        </div>
        <button 
          onClick={() => navigate('/stats')}
          style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: '#7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>
      </header>

      {/* Progress Bar */}
      <div style={{ margin: '16px 0 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Progreso del día</span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{progress}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#1f2937', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress >= 80 ? '#1D9E75' : progress >= 40 ? '#f59e0b' : '#ef4444', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* SECTION 1: TAREAS */}
      <section style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
        <div 
          onClick={() => toggleSection('tasks')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: openSections.tasks ? '16px' : '0' }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#9ca3af', margin: 0 }}>Tareas de hoy</h2>
          <span style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {completedTasks}/{totalTasks} {openSections.tasks ? '▴' : '▾'}
          </span>
        </div>
        
        {openSections.tasks && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.length === 0 ? (
              <p style={{ color: '#4b5563', textAlign: 'center', margin: '10px 0' }}>No hay tareas para hoy</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#111827', padding: '14px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                  <div 
                    onClick={() => handleToggleTask(task)}
                    style={{ width: '22px', height: '22px', borderRadius: '50%', border: task.completed ? 'none' : '2px solid #4b5563', backgroundColor: task.completed ? '#1D9E75' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  >
                    {task.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <span style={{ flex: 1, fontSize: '15px', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#6b7280' : '#ffffff' }}>
                    {task.title}
                  </span>
                  <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* SECTION 2: HÁBITOS */}
      <section style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
        <div 
          onClick={() => toggleSection('habits')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: openSections.habits ? '16px' : '0' }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#9ca3af', margin: 0 }}>Hábitos de hoy</h2>
          <span style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {completedHabits}/{totalHabits} {openSections.habits ? '▴' : '▾'}
          </span>
        </div>

        {openSections.habits && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {habits.length === 0 ? (
              <p style={{ color: '#4b5563', textAlign: 'center', margin: '10px 0' }}>Sin hábitos configurados</p>
            ) : (
              habits.map(habit => {
                const isDone = habitLogs.find(l => l.habit_id === habit.id)?.completed === 1
                return (
                  <div key={habit.id} onClick={() => handleToggleHabit(habit.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111827', padding: '14px', borderRadius: '12px', border: '1px solid #1f2937', cursor: 'pointer' }}>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 2px 0' }}>{habit.name}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>🔥 {streaks[habit.id] || 0} días</p>
                    </div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: isDone ? 'none' : '2px solid #4b5563', backgroundColor: isDone ? '#1D9E75' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </section>

      {/* SECTION 3: PROYECTOS */}
      {upcomingProjects.length > 0 && (
        <section style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
          <div 
            onClick={() => toggleSection('projects')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: openSections.projects ? '16px' : '0' }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#9ca3af', margin: 0 }}>Proyectos próximos</h2>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>{openSections.projects ? '▴' : '▾'}</span>
          </div>

          {openSections.projects && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingProjects.map(p => {
                const days = getRemainingDays(p.due_date)
                return (
                  <div key={p.id} style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{p.title}</span>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', ...getBadgeStyle(days) }}>
                      {days <= 0 ? 'Vence hoy' : days === 1 ? 'Mañana' : `En ${days} días`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* FAB */}
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{ position: 'fixed', bottom: '80px', right: '20px', width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#7F77DD', color: 'white', border: 'none', fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
      >
        +
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100 }}>
          <div style={{ backgroundColor: '#111827', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '24px', border: '1px solid #1f2937' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Nueva Tarea</h2>
            <input
              type="text" placeholder="¿Qué hay que hacer hoy?" value={newTask.title}
              onChange={e => setNewTask({ title: e.target.value })}
              style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '8px', padding: '12px', color: 'white', marginBottom: '24px', boxSizing: 'border-box' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid #1f2937', color: '#9ca3af', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveTask}
                onTouchEnd={(e) => { e.preventDefault(); handleSaveTask(); }}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#7F77DD', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer' }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
