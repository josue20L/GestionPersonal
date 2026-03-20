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
        padding:'8px 0 12px'
      }}>
        {[
          {to:'/', label:'Inicio', icon:'⊞'},
          {to:'/tareas', label:'Tareas', icon:'☰'},
          {to:'/habitos', label:'Hábitos', icon:'◈'},
          {to:'/stats', label:'Stats', icon:'↑'},
        ].map(({to, label, icon}) => (
          <NavLink key={to} to={to} end style={({isActive}) => ({
            display:'flex', flexDirection:'column',
            alignItems:'center', gap:'2px', textDecoration:'none',
            color: isActive ? '#7F77DD' : '#6b7280',
            fontSize:'11px'
          })}>
            <span style={{fontSize:'20px'}}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
