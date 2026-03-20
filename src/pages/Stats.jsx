import { useState, useEffect } from 'react'
import db from '../db/dexie'

export default function Stats() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [stats, setStats] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    loadStats()
  }, [currentMonth])

  const loadStats = async () => {
    const allTasks = await db.tasks.toArray()
    const allHabits = await db.habits.toArray()
    const allLogs = await db.habit_logs.toArray()

    const getDayInfo = (dateStr) => {
      const dayTasks = allTasks.filter(t => t.date === dateStr)
      const dayLogs = allLogs.filter(l => l.date === dateStr)
      
      const total = dayTasks.length + allHabits.length
      if (total === 0) return { progress: null, tasks: 0, habits: 0 }
      
      const completedTasks = dayTasks.filter(t => t.completed).length
      const completedHabits = dayLogs.filter(l => l.completed).length
      const progress = Math.round(((completedTasks + completedHabits) / total) * 100)
      
      return { progress, tasks: completedTasks, habits: completedHabits }
    }

    // --- SECCIÓN 1: Calendario ---
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const calendarGrid = []
    // Días vacíos iniciales
    for (let i = 0; i < firstDay; i++) {
      calendarGrid.push(null)
    }
    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const iso = date.toISOString().slice(0, 10)
      calendarGrid.push({
        date: iso,
        dayNum: d,
        ...getDayInfo(iso)
      })
    }

    // --- SECCIÓN 2: Resumen ---
    const uniqueDates = [...new Set([...allTasks.map(t => t.date), ...allLogs.map(l => l.date)])]
    const perfectDays = uniqueDates.filter(d => getDayInfo(d).progress === 100).length

    const today = new Date()
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      return d.toISOString().slice(0, 10)
    })
    const tasksThisWeek = allTasks.filter(t => last7Days.includes(t.date) && t.completed).length
    const habitsThisWeek = allLogs.filter(l => last7Days.includes(l.date) && l.completed).length

    // Mejor racha global
    let currentGlobalStreak = 0
    let maxGlobalStreak = 0
    let checkDate = new Date(today)
    for (let i = 0; i < 365; i++) {
      const dStr = checkDate.toISOString().slice(0, 10)
      const info = getDayInfo(dStr)
      if (info.progress !== null && info.progress > 0) {
        currentGlobalStreak++
        maxGlobalStreak = Math.max(maxGlobalStreak, currentGlobalStreak)
      } else if (i > 0) break
      checkDate.setDate(checkDate.getDate() - 1)
    }

    // --- SECCIÓN 3: Hábitos Detalle ---
    const habitsDetail = allHabits.map(h => {
      const logs = allLogs.filter(l => l.habit_id === h.id && l.completed)
      const logDates = new Set(logs.map(l => l.date))
      let streak = 0, maxStreak = 0, tempStreak = 0
      let d = new Date(today)
      for(let i=0; i<365; i++) {
        const dStr = d.toISOString().slice(0, 10)
        if (logDates.has(dStr)) {
          tempStreak++; maxStreak = Math.max(maxStreak, tempStreak)
          if (i === streak) streak++
        } else tempStreak = 0
        d.setDate(d.getDate() - 1)
      }
      const last30 = logs.filter(l => (today - new Date(l.date)) / 86400000 <= 30).length
      return { ...h, streak, maxStreak, successRate: Math.round((last30 / 30) * 100) }
    })

    // --- SECCIÓN 4: Gráfica ---
    const chartData = last7Days.reverse().map(date => ({
      label: date.slice(8, 10),
      value: allTasks.filter(t => t.date === date && t.completed).length
    }))

    setStats({ calendarGrid, perfectDays, maxGlobalStreak, tasksThisWeek, habitsThisWeek, habitsDetail, chartData })
  }

  const changeMonth = (offset) => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
    setCurrentMonth(next)
    setSelectedDay(null)
  }

  if (!stats) return <div style={{ color: 'white', padding: '20px' }}>Cargando estadísticas...</div>

  const getCellColor = (progress) => {
    if (progress === null) return '#1f2937'
    if (progress === 100) return '#1D9E75'
    if (progress >= 80) return '#14532d'
    if (progress >= 40) return '#78350f'
    if (progress > 0) return '#7f1d1d'
    return '#1f2937'
  }

  const todayISO = new Date().toISOString().slice(0, 10)
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '24px 16px 80px', color: '#ffffff', backgroundColor: '#030712', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '24px' }}>Estadísticas</h1>

      {/* Calendario Real */}
      <section style={{ marginBottom: '32px', backgroundColor: '#111827', padding: '16px', borderRadius: '16px', border: '1px solid #1f2937' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}>{'<'}</button>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'capitalize', margin: 0 }}>{monthName}</h2>
          <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}>{'>'}</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
            <span key={d} style={{ fontSize: '10px', color: '#4b5563', fontWeight: '600' }}>{d}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {stats.calendarGrid.map((day, i) => (
            <div 
              key={i} 
              onClick={() => day && setSelectedDay(day)}
              style={{
                aspectRatio: '1/1',
                backgroundColor: day ? getCellColor(day.progress) : 'transparent',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '600',
                cursor: day ? 'pointer' : 'default',
                border: day?.date === todayISO ? '2px solid #ffffff' : 'none',
                opacity: day ? 1 : 0
              }}
            >
              {day?.dayNum}
            </div>
          ))}
        </div>

        {selectedDay && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#1f2937', borderRadius: '8px', fontSize: '12px', border: '1px solid #374151' }}>
            <p style={{ margin: 0, fontWeight: '600' }}>
              Día {selectedDay.dayNum}: {selectedDay.progress === null ? 'Sin datos' : `${selectedDay.progress}% completado`}
            </p>
            <p style={{ margin: '4px 0 0 0', color: '#9ca3af' }}>
              ({selectedDay.tasks} tareas, {selectedDay.habits} hábitos)
            </p>
          </div>
        )}
      </section>

      {/* Resumen General */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Días perfectos', val: stats.perfectDays, icon: '⭐' },
          { label: 'Mejor racha', val: `${stats.maxGlobalStreak}d`, icon: '🔥' },
          { label: 'Tareas / sem', val: stats.tasksThisWeek, icon: '✓' },
          { label: 'Hábitos / sem', val: stats.habitsThisWeek, icon: '◈' }
        ].map((item, i) => (
          <div key={i} style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>{item.label}</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Hábitos Detalle */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#9ca3af' }}>Rendimiento de hábitos</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats.habitsDetail.map(habit => (
            <div key={habit.id} style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '15px' }}>{habit.name}</span>
                <span style={{ color: '#7F77DD', fontSize: '13px', fontWeight: 'bold' }}>🔥 {habit.streak}d</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>
                <span>Éxito (30d): {habit.successRate}%</span>
                <span>Récord: {habit.maxStreak}d</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#1f2937', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${habit.successRate}%`, height: '100%', backgroundColor: '#7F77DD', borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gráfica Tareas */}
      <section style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '16px', border: '1px solid #1f2937' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#9ca3af', marginBottom: '20px' }}>Tareas completadas (7d)</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '100px', paddingBottom: '20px' }}>
          {stats.chartData.map((d, i) => {
            const max = Math.max(...stats.chartData.map(x => x.value), 1)
            const height = (d.value / max) * 100
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30px', position: 'relative' }}>
                <div style={{ width: '12px', height: `${height}%`, backgroundColor: '#7F77DD', borderRadius: '4px 4px 0 0', minHeight: d.value > 0 ? '4px' : '0' }} />
                <span style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px' }}>{d.label}</span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
