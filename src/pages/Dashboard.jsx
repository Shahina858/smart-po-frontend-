import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { FileText, CheckCircle, AlertTriangle, TrendingUp, Download, ArrowRight, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'https://smart-po-backend.onrender.com'

export default function Dashboard() {
  const [stats, setStats] = useState({ pos_today:0, xls_generated:0, total_unmatched:0, total_pos:0 })
  const [recentPOs, setRecentPOs] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const navigate = useNavigate()

  const loadData = useCallback(() => {
    Promise.all([
      axios.get(`${API}/api/po/stats/dashboard`),
      axios.get(`${API}/api/po`),
      axios.get(`${API}/api/products?search=`),
    ]).then(([s, p, pr]) => {
      setStats(s.data)
      setRecentPOs(Array.isArray(p.data) ? p.data.slice(0, 8) : [])
      const low = Array.isArray(pr.data) ? pr.data.filter(p => p.stock <= 2) : []
      setLowStock(low)
      setLastUpdated(new Date())
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  const cards = [
    { label:'POs Today',       value: stats.pos_today,       color:'#0d9488', bg:'#f0fdfa', icon: FileText },
    { label:'XLS Generated',   value: stats.xls_generated,   color:'#059669', bg:'#f0fdf4', icon: Download },
    { label:'Unmatched Items', value: stats.total_unmatched, color:'#d97706', bg:'#fffbeb', icon: AlertTriangle },
    { label:'Total POs',       value: stats.total_pos,       color:'#7c3aed', bg:'#faf5ff', icon: TrendingUp },
  ]

  const statusStyle = {
    completed:  { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0', label:'COMPLETED' },
    matched:    { bg:'#f0fdfa', color:'#0d9488', border:'#99f6e4', label:'MATCHED' },
    processing: { bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe', label:'PROCESSING' },
    received:   { bg:'#f8fafc', color:'#64748b', border:'#e2e8f0', label:'RECEIVED' },
  }

  function isNewPO(createdAt) {
    return (new Date() - new Date(createdAt)) < 60 * 60 * 1000
  }

  async function downloadXLS(e, xlsPath) {
    e.stopPropagation()
    if (!xlsPath) return
    const filename = xlsPath.split('\\').pop().split('/').pop()
    const url = `https://smartpo.webishopi.com/outputs/${filename}`
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      window.open(url, '_blank')
    }
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div style={{width:'36px',height:'36px',border:'3px solid #e2e8f0',
                   borderTop:'3px solid #0d9488',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
    </div>
  )

  return (
    <div className="fade-up" style={{display:'flex',flexDirection:'column',gap:'24px'}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:'28px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',margin:0}}>
            Dashboard
          </h1>
          <p style={{color:'#64748b',fontSize:'13px',marginTop:'4px'}}>
            {new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px',
                     background:'#f0fdfa',border:'1px solid #99f6e4',
                     borderRadius:'10px',padding:'6px 14px'}}>
          <div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#10b981',
                       boxShadow:'0 0 6px #10b981'}} />
          <span style={{fontSize:'12px',color:'#0d9488',fontWeight:600}}>
            Auto-refreshing · {lastUpdated.toLocaleTimeString('en-IN')}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px'}}>
        {cards.map(({label,value,color,bg,icon:Icon}) => (
          <div key={label} className="card card-hover" style={{padding:'24px'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
              <div>
                <p style={{fontSize:'12px',color:'#64748b',fontWeight:600,letterSpacing:'0.5px',
                            textTransform:'uppercase',margin:0}}>
                  {label}
                </p>
                <p style={{fontSize:'40px',fontWeight:800,color:'#0f172a',lineHeight:1.1,marginTop:'8px'}}>
                  {value}
                </p>
              </div>
              <div style={{width:'44px',height:'44px',borderRadius:'12px',background:bg,
                           display:'flex',alignItems:'center',justifyContent:'center',
                           border:`1px solid ${color}30`}}>
                <Icon size={20} color={color} />
              </div>
            </div>
            <div style={{height:'3px',background:`linear-gradient(90deg,${color},${color}40)`,
                         borderRadius:'2px',marginTop:'20px'}} />
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div style={{borderRadius:'16px',padding:'20px 24px',
                     background:'#fffbeb',border:'1.5px solid #fde68a'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
            <AlertTriangle size={20} color="#d97706" />
            <p style={{fontSize:'15px',fontWeight:700,color:'#92400e',margin:0}}>
              ⚠️ Low Stock Alert — {lowStock.length} products need restocking
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
            {lowStock.slice(0,9).map(p => (
              <div key={p.id} style={{
                padding:'12px 14px',borderRadius:'10px',
                background:'white',border:'1px solid #fde68a',
                display:'flex',alignItems:'center',justifyContent:'space-between',
              }}>
                <div>
                  <p style={{fontSize:'12px',fontWeight:700,color:'#1e293b',margin:0}}>{p.pname}</p>
                  <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'2px',fontFamily:'monospace'}}>
                    {p.pcode} · {p.packing}
                  </p>
                </div>
                <span style={{
                  padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:800,
                  background: p.stock===0 ? '#fef2f2' : '#fffbeb',
                  color: p.stock===0 ? '#ef4444' : '#d97706',
                  border: `1px solid ${p.stock===0 ? '#fecaca' : '#fde68a'}`,
                }}>
                  {p.stock}
                </span>
              </div>
            ))}
          </div>
          {lowStock.length > 9 && (
            <p style={{fontSize:'12px',color:'#d97706',marginTop:'12px',textAlign:'center',cursor:'pointer'}}
              onClick={() => navigate('/products')}>
              +{lowStock.length - 9} more → View all in Products
            </p>
          )}
        </div>
      )}

      {/* Recent POs */}
      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid #f1f5f9',
                     display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <p style={{fontSize:'15px',fontWeight:700,color:'#0f172a',margin:0}}>
            Recent Purchase Orders
          </p>
          <button onClick={() => navigate('/po')}
            style={{fontSize:'12px',color:'#0d9488',background:'none',border:'none',cursor:'pointer',
                    display:'flex',alignItems:'center',gap:'4px',fontWeight:600}}>
            View all <ArrowRight size={12} />
          </button>
        </div>

        {recentPOs.length === 0 ? (
          <div style={{padding:'48px',textAlign:'center',color:'#94a3b8',fontSize:'14px'}}>
            No POs yet — waiting for incoming purchase orders...
          </div>
        ) : recentPOs.map((po, i) => {
          const s = statusStyle[po.status] || statusStyle.received
          const newPO = isNewPO(po.created_at)
          return (
            <div key={po.id}
              onClick={() => navigate(`/po/review/${po.id}`)}
              style={{
                display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'16px 24px',cursor:'pointer',transition:'background 0.15s',
                borderBottom: i < recentPOs.length-1 ? '1px solid #f8fafc' : 'none',
                background: newPO ? '#f0fdf4' : 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background= newPO ? '#f0fdf4' : 'transparent'}
            >
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <p style={{fontSize:'14px',fontWeight:600,color:'#1e293b',margin:0}}>
                    {po.customer_name || 'Unknown Hospital'}
                  </p>
                  {newPO && (
                    <span style={{
                      padding:'1px 8px',borderRadius:'20px',fontSize:'10px',fontWeight:700,
                      background:'#dcfce7',color:'#16a34a',border:'1px solid #bbf7d0',
                    }}>NEW</span>
                  )}
                </div>
                <p style={{fontSize:'12px',color:'#94a3b8',marginTop:'3px'}}>
                  PO: {po.po_number} · {new Date(po.created_at).toLocaleString('en-IN')}
                </p>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{textAlign:'right'}}>
                  <span style={{fontSize:'13px',color:'#16a34a',fontWeight:600}}>{po.matched_items}</span>
                  <span style={{fontSize:'13px',color:'#94a3b8'}}>/{po.total_items} matched</span>
                  {po.unmatched_items > 0 && (
                    <span style={{fontSize:'12px',color:'#d97706',marginLeft:'8px'}}>
                      ({po.unmatched_items} missing)
                    </span>
                  )}
                </div>

                <span style={{
                  padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:700,
                  letterSpacing:'0.5px',background:s.bg,color:s.color,border:`1px solid ${s.border}`
                }}>
                  {s.label}
                </span>

                {/* Review button */}
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/po/review/${po.id}`) }}
                  style={{
                    padding:'5px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:600,
                    background:'#f0fdfa',color:'#0d9488',
                    border:'1px solid #99f6e4',cursor:'pointer',whiteSpace:'nowrap',
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#0d9488';e.currentTarget.style.color='white'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#f0fdfa';e.currentTarget.style.color='#0d9488'}}
                >
                  Review
                </button>

                {/* XLS Download */}
                {po.xls_path && (
                  <button
                    onClick={e => downloadXLS(e, po.xls_path)}
                    style={{
                      display:'flex',alignItems:'center',gap:'5px',
                      padding:'5px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:600,
                      background:'#f0fdf4',color:'#16a34a',
                      border:'1px solid #bbf7d0',cursor:'pointer',
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.background='#16a34a';e.currentTarget.style.color='white'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='#f0fdf4';e.currentTarget.style.color='#16a34a'}}
                  >
                    <Download size={12}/> XLS
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}