import { useState, useEffect } from 'react'
import useHabits from '../hooks/useHabits'
import db from '../db/dexie'

export default function Habitos() {
  const { habits, getHabits, addHabit, deleteHabit, toggleHabitLog, getStreak } = useHabits()
  const [activeTab, setActiveTab] = useState('hoy') // 'hoy' o 'gestionar'
  const [habitLogs, setHabitLogs] = useState([])
  const [streaks, setStreaks] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = async () => {
    const allHabits = await getHabits()
    const logs = await db.habit_logs.where('date').equals(today).toArray()
    setHabitLogs(logs)

    const streakMap = {}
    for (const h of allHabits) {
      streakMap[h.id] = await getStreak(h.id)
    }
    setStreaks(streakMap)
  }

  const handleToggle = async (habitId) => {
    await toggleHabitLog(habitId, today)
    refreshData()
  }

  const handleSave = async () => {
    if (!newHabitName.trim()) return
    await addHabit({ name: newHabitName })
    setNewHabitName('')
    setIsModalOpen(false)
    refreshData()
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este hábito y todos sus registros?')) {
      await deleteHabit(id)
      refreshData()
    }
  }

  return (
    <div style={{
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      backgroundColor: '#030712',
      minHeight: '100%'
    }}>
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 24px 0' }}>Hábitos</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        backgroundColor: '#111827',
        padding: '4px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('hoy')}
          style={{
            padding: '10px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: activeTab === 'hoy' ? '#7F77DD' : 'transparent',
            color: activeTab === 'hoy' ? '#ffffff' : '#9ca3af'
          }}
        >
          Hoy
        </button>
        <button
          onClick={() => setActiveTab('gestionar')}
          style={{
            padding: '10px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: activeTab === 'gestionar' ? '#7F77DD' : 'transparent',
            color: activeTab === 'gestionar' ? '#ffffff' : '#9ca3af'
          }}
        >
          Gestionar
        </button>
      </div>

      {activeTab === 'hoy' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {habits.length === 0 ? (
            <p style={{ color: '#4b5563', textAlign: 'center', marginTop: '40px' }}>No tienes hábitos creados</p>
          ) : (
            habits.map(habit => {
              const isDone = habitLogs.find(l => l.habit_id === habit.id)?.completed === 1
              return (
                <div
                  key={habit.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#111827',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #1f2937'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>{habit.name}</h3>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                      🔥 {streaks[habit.id] || 0} días
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(habit.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: isDone ? 'none' : '2px solid #4b5563',
                      backgroundColor: isDone ? '#1D9E75' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {isDone && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {habits.map(habit => (
            <div
              key={habit.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#111827',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #1f2937'
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>{habit.name}</h3>
              <button
                onClick={() => handleDelete(habit.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}

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
              fontSize: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            +
          </button>
        </div>
      )}

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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Nuevo Hábito</h2>
            <input
              type="text"
              placeholder="Nombre del hábito"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
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
                  color: '#9ca3af'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                onTouchEnd={(e) => { e.preventDefault(); handleSave(); }}
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
