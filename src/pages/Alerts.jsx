import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Bell, FileText, CheckCircle, ArrowRight } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://88.223.94.1:5000'
export default function Alerts() {
  const [pos, setPOs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(()=>{
    axios.get(`${API}/api/po`).then(r=>setPOs(r.data)).finally(()=>setLoading(false))
  },[])

  const statusStyle = {
    completed:  {bg:'#f0fdf4',color:'#16a34a',border:'#bbf7d0',label:'COMPLETED'},
    matched:    {bg:'#f0fdfa',color:'#0d9488',border:'#99f6e4',label:'MATCHED'},
    processing: {bg:'#eff6ff',color:'#2563eb',border:'#bfdbfe',label:'PROCESSING'},
    received:   {bg:'#f8fafc',color:'#64748b',border:'#e2e8f0',label:'RECEIVED'},
  }

  if(loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div style={{width:'36px',height:'36px',border:'3px solid #e2e8f0',
                   borderTop:'3px solid #0d9488',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
    </div>
  )

  return (
    <div className="fade-up" style={{display:'flex',flexDirection:'column',gap:'24px'}}>
      <div>
        <h1 style={{fontSize:'28px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',margin:0}}>
          Alerts & Logs
        </h1>
        <p style={{color:'#64748b',fontSize:'13px',marginTop:'4px'}}>
          Full processing history and system notifications
        </p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
        {[
          {label:'Total POs',value:pos.length,color:'#0d9488',bg:'#f0fdfa',icon:FileText},
          {label:'Completed',value:pos.filter(p=>p.status==='completed').length,color:'#059669',bg:'#f0fdf4',icon:CheckCircle},
          {label:'With Missing Items',value:pos.filter(p=>p.unmatched_items>0).length,color:'#d97706',bg:'#fffbeb',icon:Bell},
        ].map(({label,value,color,bg,icon:Icon})=>(
          <div key={label} className="card" style={{padding:'20px',display:'flex',alignItems:'center',gap:'16px'}}>
            <div style={{width:'48px',height:'48px',borderRadius:'12px',flexShrink:0,
                         background:bg,border:`1.5px solid ${color}30`,
                         display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon size={22} color={color}/>
            </div>
            <div>
              <p style={{fontSize:'11px',color:'#94a3b8',margin:0,textTransform:'uppercase',
                          letterSpacing:'0.5px',fontWeight:700}}>{label}</p>
              <p style={{fontSize:'32px',fontWeight:800,color:'#0f172a',margin:'4px 0 0',lineHeight:1}}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid #f1f5f9'}}>
          <p style={{fontSize:'15px',fontWeight:700,color:'#0f172a',margin:0}}>PO Processing Log</p>
        </div>
        {pos.length===0 ? (
          <div style={{padding:'60px',textAlign:'center',color:'#94a3b8',fontSize:'13px'}}>
            No POs processed yet
          </div>
        ) : pos.map((po,i)=>{
          const s = statusStyle[po.status]||statusStyle.received
          return (
            <div key={po.id}
              style={{
                padding:'18px 24px',cursor:'pointer',transition:'background 0.15s',
                borderBottom: i<pos.length-1?'1px solid #f8fafc':'none',
              }}
              onClick={()=>navigate(`/po/review/${po.id}`)}
              onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
                    <p style={{fontSize:'14px',fontWeight:700,color:'#1e293b',margin:0}}>
                      {po.customer_name||'Unknown'}
                    </p>
                    <span style={{padding:'2px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:700,
                                   letterSpacing:'0.5px',background:s.bg,color:s.color,border:`1px solid ${s.border}`}}>
                      {s.label}
                    </span>
                  </div>
                  <p style={{fontSize:'12px',color:'#94a3b8',margin:0,fontFamily:'monospace'}}>
                    {po.po_number} · {po.po_date} · {new Date(po.created_at).toLocaleString('en-IN')}
                  </p>
                  {po.xls_path && (
                    <p style={{fontSize:'11px',color:'#0d9488',marginTop:'4px',display:'flex',alignItems:'center',gap:'4px'}}>
                      <CheckCircle size={11}/> XLS generated
                    </p>
                  )}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                  <div style={{textAlign:'right'}}>
                    <p style={{fontSize:'13px',margin:0}}>
                      <span style={{color:'#16a34a',fontWeight:700}}>{po.matched_items}</span>
                      <span style={{color:'#94a3b8'}}> / {po.total_items} matched</span>
                    </p>
                    {po.unmatched_items>0 && (
                      <p style={{fontSize:'12px',color:'#d97706',margin:'2px 0 0'}}>
                        {po.unmatched_items} items missing
                      </p>
                    )}
                  </div>
                  <ArrowRight size={16} color="#cbd5e1"/>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}