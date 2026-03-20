import { useState, useEffect } from 'react'
import useProjects from '../hooks/useProjects'

export default function Proyectos() {
  const { getProjects, addProject, completeProject, deleteProject } = useProjects()
  const [activeTab, setActiveTab] = useState('pendientes')
  const [projectList, setProjectList] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProject, setNewProject] = useState({ title: '', description: '', due_date: '' })

  useEffect(() => {
    refresh()
  }, [])

  const refresh = async () => {
    const data = await getProjects()
    setProjectList(data)
  }

  const handleSave = async () => {
    if (!newProject.title || !newProject.due_date) return
    await addProject(newProject)
    setNewProject({ title: '', description: '', due_date: '' })
    setIsModalOpen(false)
    refresh()
  }

  const handleComplete = async (id) => {
    await completeProject(id)
    refresh()
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este proyecto?')) {
      await deleteProject(id)
      refresh()
    }
  }

  const getRemainingDays = (dueDate) => {
    const diff = new Date(dueDate) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getBadgeStyle = (days) => {
    if (days <= 1) return { backgroundColor: '#7f1d1d', color: '#fca5a5' }
    if (days <= 4) return { backgroundColor: '#78350f', color: '#fcd34d' }
    return { backgroundColor: '#14532d', color: '#86efac' }
  }

  const filtered = projectList.filter(p => activeTab === 'pendientes' ? !p.completed : p.completed)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

  return (
    <div style={{ padding: '24px 16px 80px', color: '#ffffff', backgroundColor: '#030712', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '24px' }}>Proyectos</h1>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#111827', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
        {['pendientes', 'completados'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              backgroundColor: activeTab === tab ? '#7F77DD' : 'transparent',
              color: activeTab === tab ? '#ffffff' : '#9ca3af',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(p => {
          const days = getRemainingDays(p.due_date)
          return (
            <div key={p.id} style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{p.title}</h3>
                  {p.description && <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 12px 0' }}>{p.description}</p>}
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#1f2937', color: '#9ca3af' }}>
                      Vence el {new Date(p.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                    {!p.completed && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', ...getBadgeStyle(days) }}>
                        {days < 0 ? 'Vencido' : days === 0 ? 'Vence hoy' : days === 1 ? 'Vence mañana' : `Faltan ${days} días`}
                      </span>
                    )}
                  </div>
                </div>

                {activeTab === 'pendientes' ? (
                  <button
                    onClick={() => handleComplete(p.id)}
                    style={{ marginLeft: '12px', backgroundColor: '#7F77DD', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Completar
                  </button>
                ) : (
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* FAB */}
      {activeTab === 'pendientes' && (
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ position: 'fixed', bottom: '80px', right: '20px', width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#7F77DD', color: 'white', border: 'none', fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, cursor: 'pointer' }}
        >
          +
        </button>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100 }}>
          <div style={{ backgroundColor: '#111827', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '24px', border: '1px solid #1f2937' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Nuevo Proyecto</h2>
            <input
              type="text" placeholder="Título" value={newProject.title}
              onChange={e => setNewProject({...newProject, title: e.target.value})}
              style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '8px', padding: '12px', color: 'white', marginBottom: '16px', boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="Descripción (opcional)" value={newProject.description}
              onChange={e => setNewProject({...newProject, description: e.target.value})}
              style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '8px', padding: '12px', color: 'white', marginBottom: '16px', minHeight: '80px', boxSizing: 'border-box' }}
            />
            <input
              type="date" value={newProject.due_date}
              onChange={e => setNewProject({...newProject, due_date: e.target.value})}
              style={{ width: '100%', backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '8px', padding: '12px', color: 'white', marginBottom: '24px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid #1f2937', color: '#9ca3af', cursor: 'pointer' }}>Cancelar</button>
              <button 
                onClick={handleSave}
                onTouchEnd={(e) => { e.preventDefault(); handleSave(); }}
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
