import { useState, useEffect } from 'react'
import useTasks from '../hooks/useTasks'

export default function Tareas() {
  const { tasks, getTasks, addTask, updateTask, deleteTask } = useTasks()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const dateISO = selectedDate.toISOString().slice(0, 10)

  // Formato de fecha: "Jue 19 mar"
  const formatDate = (date) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short' }
    let formatted = date.toLocaleDateString('es-ES', options)
    // Quitar puntos y capitalizar
    return formatted.replace('.', '').charAt(0).toUpperCase() + formatted.slice(1)
  }

  useEffect(() => {
    getTasks(dateISO)
  }, [dateISO])

  const changeDate = (offset) => {
    const next = new Date(selectedDate)
    next.setDate(selectedDate.getDate() + offset)
    setSelectedDate(next)
  }

  const handleToggle = async (task) => {
    await updateTask(task.id, { completed: !task.completed })
    getTasks(dateISO)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta tarea?')) {
      await deleteTask(id)
      getTasks(dateISO)
    }
  }

  const handleSave = async () => {
    if (!newTitle.trim()) return
    await addTask({
      title: newTitle,
      date: dateISO,
      completed: false
    })
    setNewTitle('')
    setIsModalOpen(false)
    getTasks(dateISO)
  }

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
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Tareas</h1>
        
        {/* Selector de fecha */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#111827',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid #1f2937'
        }}>
          <button 
            onClick={() => changeDate(-1)}
            style={{ 
              background: 'none', border: 'none', color: '#9ca3af', 
              fontSize: '20px', padding: '0 10px', cursor: 'pointer' 
            }}
          >
            {'<'}
          </button>
          <span style={{ fontSize: '15px', fontWeight: '500' }}>
            {formatDate(selectedDate)}
          </span>
          <button 
            onClick={() => changeDate(1)}
            style={{ 
              background: 'none', border: 'none', color: '#9ca3af', 
              fontSize: '20px', padding: '0 10px', cursor: 'pointer' 
            }}
          >
            {'>'}
          </button>
        </div>
      </header>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tasks.length === 0 ? (
          <p style={{ color: '#4b5563', textAlign: 'center', marginTop: '40px' }}>Sin tareas para este día</p>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#111827',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #1f2937',
                opacity: task.completed ? 0.6 : 1
              }}
            >
              <div 
                onClick={() => handleToggle(task)}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: task.completed ? 'none' : '2px solid #4b5563',
                  backgroundColor: task.completed ? '#1D9E75' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  cursor: 'pointer'
                }}
              >
                {task.completed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              
              <span style={{ 
                flex: 1, 
                fontSize: '15px',
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? '#6b7280' : '#ffffff'
              }}>
                {task.title}
              </span>

              <button 
                onClick={() => handleDelete(task.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
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
              placeholder="¿Qué hay que hacer?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
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
                onClick={handleSave}
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
