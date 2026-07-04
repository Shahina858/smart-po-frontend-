import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Eye, FileSpreadsheet } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://88.223.94.1:5000'

const statusStyle = {
  completed:  { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0', label:'COMPLETED' },
  matched:    { bg:'#f0fdfa', color:'#0d9488', border:'#99f6e4', label:'MATCHED' },
  processing: { bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe', label:'PROCESSING' },
  received:   { bg:'#f8fafc', color:'#64748b', border:'#e2e8f0', label:'RECEIVED' },
}

export default function POManagement() {
  const [pos, setPOs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${API}/api/po`).then(r => setPOs(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div style={{width:'36px',height:'36px',border:'3px solid #e2e8f0',
                   borderTop:'3px solid #0d9488',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
    </div>
  )

  return (
    <div className="fade-up" style={{display:'flex',flexDirection:'column',gap:'24px'}}>
      <div>
        <h1 style={{fontSize:'28px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',margin:0}}>
          PO Management
        </h1>
        <p style={{color:'#64748b',fontSize:'13px',marginTop:'4px'}}>
          {pos.length} purchase orders received
        </p>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid #f1f5f9'}}>
          <p style={{fontSize:'15px',fontWeight:700,color:'#0f172a',margin:0}}>All Purchase Orders</p>
        </div>

        {pos.length === 0 ? (
          <div style={{padding:'80px',textAlign:'center'}}>
            <FileSpreadsheet size={48} color="#cbd5e1" style={{margin:'0 auto 16px',display:'block'}} />
            <p style={{color:'#94a3b8',fontSize:'14px',margin:0}}>No purchase orders yet</p>
            <p style={{color:'#cbd5e1',fontSize:'12px',marginTop:'6px'}}>
              Send a PO PDF to the configured Gmail to trigger the pipeline
            </p>
          </div>
        ) : pos.map((po, i) => {
          const s = statusStyle[po.status] || statusStyle.received
          return (
            <div key={po.id}
              style={{
                display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'20px 24px',transition:'background 0.15s',
                borderBottom: i < pos.length-1 ? '1px solid #f8fafc' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'6px'}}>
                  <p style={{fontSize:'15px',fontWeight:700,color:'#1e293b',margin:0}}>
                    {po.customer_name || 'Unknown Hospital'}
                  </p>
                  <span style={{
                    padding:'2px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:700,
                    letterSpacing:'0.5px',background:s.bg,color:s.color,border:`1px solid ${s.border}`
                  }}>
                    {s.label}
                  </span>
                </div>
                <div style={{display:'flex',gap:'20px'}}>
                  <span style={{fontSize:'12px',color:'#94a3b8'}}>
                    PO: <span style={{color:'#475569',fontFamily:'monospace'}}>{po.po_number}</span>
                  </span>
                  <span style={{fontSize:'12px',color:'#94a3b8'}}>Date: {po.po_date}</span>
                  <span style={{fontSize:'12px',color:'#94a3b8'}}>
                    <span style={{color:'#16a34a',fontWeight:600}}>{po.matched_items}</span>/{po.total_items} matched
                    {po.unmatched_items > 0 && (
                      <span style={{color:'#d97706',marginLeft:'6px'}}>· {po.unmatched_items} missing</span>
                    )}
                  </span>
                </div>
                <p style={{fontSize:'11px',color:'#cbd5e1',marginTop:'4px'}}>
                  {new Date(po.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => navigate(`/po/review/${po.id}`)}
                style={{
                  display:'flex',alignItems:'center',gap:'8px',
                  padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,
                  background:'#f0fdfa',color:'#0d9488',
                  border:'1.5px solid #99f6e4',cursor:'pointer',transition:'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='#0d9488'; e.currentTarget.style.color='white' }}
                onMouseLeave={e => { e.currentTarget.style.background='#f0fdfa'; e.currentTarget.style.color='#0d9488' }}
              >
                <Eye size={15} />
                Review & Download
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}