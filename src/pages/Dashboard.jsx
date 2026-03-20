import { useState, useEffect } from 'react'
import useTasks from '../hooks/useTasks'
import useHabits from '../hooks/useHabits'
import db from '../db/dexie'

export default function Dashboard() {
  const { tasks, getTasks, addTask, updateTask } = useTasks()
  const { habits, getHabits, toggleHabitLog, getStreak } = useHabits()
  const [habitLogs, setHabitLogs] = useState([])
  const [streaks, setStreaks] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTask, setNewTask] = useState({ title: '' })

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
    await getTasks(dateISO)
    const allHabits = await getHabits()
    const logs = await db.habit_logs.where('date').equals(dateISO).toArray()
    setHabitLogs(logs)

    // Calcular rachas
    const streakMap = {}
    for (const h of allHabits) {
      streakMap[h.id] = await getStreak(h.id)
    }
    setStreaks(streakMap)
  }

  const handleToggleTask = async (task) => {
    await updateTask(task.id, { completed: !task.completed })
    refreshData()
  }

  const handleToggleHabit = async (habitId) => {
    await toggleHabitLog(habitId, dateISO)
    refreshData()
  }

  const handleSaveTask = async () => {
    if (!newTask.title.trim()) return
    await addTask({
      title: newTask.title,
      date: dateISO,
      completed: false
    })
    setNewTask({ title: '' })
    setIsModalOpen(false)
    refreshData()
  }

  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const completedHabits = habitLogs.filter(l => l.completed).length
  const totalHabits = habits.length

  const totalItems = totalTasks + totalHabits
  const totalCompleted = completedTasks + completedHabits
  const progress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0

  let progressColor = '#ef4444'
  if (progress > 40 && progress < 80) progressColor = '#f59e0b'
  else if (progress >= 80) progressColor = '#1D9E75'

  return (
    <div style={{
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      backgroundColor: '#030712',
      minHeight: '100%'
    }}>
      {/* Header */}
      <header style={{ marginBottom: '24px' }}>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 4px 0' }}>{capitalizedDate}</p>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{greeting}</h1>
      </header>

      {/* Progress Bar */}
      <div style={{ margin: '16px 0' }}>
        <p style={{ 
          fontSize: '12px', 
          color: '#9ca3af', 
          textAlign: 'right', 
          margin: '0 0 8px 0',
          fontWeight: '500'
        }}>
          Progreso del día — {progress}%
        </p>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#1f2937', 
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            backgroundColor: progressColor,
            transition: 'width 0.4s ease',
            borderRadius: '999px'
          }} />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#111827',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #1f2937'
        }}>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 8px 0' }}>Tareas hoy</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            <span style={{ color: '#1D9E75' }}>{completedTasks}</span>
            <span style={{ color: '#4b5563', fontSize: '18px' }}> / {totalTasks}</span>
          </p>
        </div>
        <div style={{
          backgroundColor: '#111827',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #1f2937'
        }}>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 8px 0' }}>Hábitos hoy</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            <span style={{ color: '#7F77DD' }}>{completedHabits}</span>
            <span style={{ color: '#4b5563', fontSize: '18px' }}> / {totalHabits}</span>
          </p>
        </div>
      </div>

      {/* Tasks List */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#9ca3af' }}>Tareas pendientes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.length === 0 ? (
            <p style={{ color: '#4b5563', textAlign: 'center', marginTop: '10px' }}>No hay tareas para hoy</p>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => handleToggleTask(task)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#111827',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #1f2937',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: task.completed ? 'none' : '2px solid #4b5563',
                  backgroundColor: task.completed ? '#1D9E75' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {task.completed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontSize: '15px', 
                    margin: 0,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#6b7280' : '#ffffff'
                  }}>
                    {task.title}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Habits Section */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#9ca3af' }}>Hábitos de hoy</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {habits.length === 0 ? (
            <p style={{ color: '#4b5563', textAlign: 'center', marginTop: '10px' }}>No hay hábitos configurados</p>
          ) : (
            habits.map(habit => {
              const isDone = habitLogs.find(l => l.habit_id === habit.id)?.completed === 1
              return (
                <div 
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#111827',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #1f2937',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 2px 0' }}>{habit.name}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                      🔥 {streaks[habit.id] || 0} días
                    </p>
                  </div>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: isDone ? 'none' : '2px solid #4b5563',
                    backgroundColor: isDone ? '#1D9E75' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isDone && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#7F77DD',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          fontSize: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        +
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#111827',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #1f2937'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Nueva Tarea</h2>
            <input 
              type="text"
              placeholder="Título de la tarea"
              value={newTask.title}
              onChange={(e) => setNewTask({ title: e.target.value })}
              style={{
                width: '100%',
                backgroundColor: '#030712',
                border: '1px solid #1f2937',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                marginBottom: '24px',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: '1px solid #1f2937',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveTask}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#7F77DD',
                  border: 'none',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
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
