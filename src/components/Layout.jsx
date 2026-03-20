import { Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
  return (
    <div style={{minHeight:'100vh', backgroundColor:'#030712'}}>
      <main style={{paddingBottom:'64px'}}>
        <Outlet />
      </main>
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0,
        backgroundColor:'#111827',
        borderTop:'1px solid #1f2937',
        display:'grid', gridTemplateColumns:'repeat(4,1fr)',
        padding:'8px 0 12px',
        zIndex: 50
      }}>
        {[
          { 
            to:'/', 
            label:'Inicio', 
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            )
          },
          { 
            to:'/tareas', 
            label:'Tareas', 
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            )
          },
          { 
            to:'/habitos', 
            label:'Hábitos', 
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )
          },
          { 
            to:'/proyectos', 
            label:'Proyectos', 
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )
          },
        ].map(({to, label, icon}) => (
          <NavLink key={to} to={to} end style={({isActive}) => ({
            display:'flex', flexDirection:'column',
            alignItems:'center', gap:'4px', textDecoration:'none',
            color: isActive ? '#7F77DD' : '#6b7280',
            fontSize:'10px',
            fontWeight: '500'
          })}>
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
