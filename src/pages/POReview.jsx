import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Download, Edit2, Save, X, AlertTriangle, CheckCircle } from 'lucide-react'
const API = import.meta.env.VITE_API_URL || 'http://88.223.94.1:5000'

export default function POReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [po, setPO] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [products, setProducts] = useState([])
  const [mappingItem, setMappingItem] = useState(null)
  const [selectedPcode, setSelectedPcode] = useState('')
  const [aliasSaved, setAliasSaved] = useState({})

  useEffect(() => {
    axios.get(`${API}/api/po/${id}`).then(r => setPO(r.data)).finally(() => setLoading(false))
    axios.get(`${API}/api/products`).then(r => setProducts(r.data))
  }, [id])

  const matched = po?.items?.filter(i => i.match_status === 'matched') || []
  const unmatched = po?.items?.filter(i => i.match_status === 'unmatched') || []

  function startEdit(item) {
    setEditingId(item.id)
    setEditData({
      quantity: item.quantity,
      unit_price: item.unit_price,
      pname_matched: item.pname_matched,
      pcode_matched: item.pcode_matched,
    })
  }

  async function saveEdit(itemId) {
    await axios.put(`${API}/api/po/item/${itemId}`, editData)
    const r = await axios.get(`${API}/api/po/${id}`)
    setPO(r.data); setEditingId(null)
  }

  async function saveAlias(item) {
    const product = products.find(p => p.pcode === selectedPcode)
    if (!product) return

    await axios.post(`${API}/api/po/alias`, {
      hospital_name: item.product_name,
      pcode: product.pcode,
      pname: product.pname,
      po_item_id: item.id,
    })

    setAliasSaved({ ...aliasSaved, [item.product_name]: product.pname })
    setMappingItem(null)
    setSelectedPcode('')

    // Refresh PO data
    const r = await axios.get(`${API}/api/po/${id}`)
    setPO(r.data)
  }
function downloadXLS() {
  if (po?.xls_path) {
    const filename = po.xls_path.split('\\').pop().split('/').pop()
   window.open(`https://smartpo.webishopi.com/outputs/${filename}`, '_blank')
  } else {
    alert('XLS not generated yet')
  }
}

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div style={{width:'36px',height:'36px',border:'3px solid #e2e8f0',
                   borderTop:'3px solid #0d9488',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
    </div>
  )

  const inp = {
    background:'#f8fafc',border:'1.5px solid #e2e8f0',color:'#1e293b',
    borderRadius:'6px',padding:'5px 8px',fontSize:'13px',outline:'none',
  }

  return (
    <div className="fade-up" style={{display:'flex',flexDirection:'column',gap:'24px'}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <button onClick={() => navigate('/po')}
            style={{width:'36px',height:'36px',borderRadius:'10px',background:'white',
                    border:'1.5px solid #e2e8f0',display:'flex',alignItems:'center',
                    justifyContent:'center',cursor:'pointer',color:'#64748b',
                    boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{fontSize:'24px',fontWeight:800,color:'#0f172a',margin:0,letterSpacing:'-0.3px'}}>
              PO Review
            </h1>
            <p style={{color:'#64748b',fontSize:'13px',marginTop:'2px'}}>
              {po?.customer_name} · {po?.po_number}
            </p>
          </div>
        </div>
        <button onClick={downloadXLS}
          style={{
            display:'flex',alignItems:'center',gap:'8px',padding:'10px 22px',
            borderRadius:'10px',fontSize:'13px',fontWeight:700,cursor:'pointer',
            background:'linear-gradient(135deg,#0d9488,#0891b2)',color:'white',
            border:'none',boxShadow:'0 4px 14px rgba(13,148,136,0.35)',
          }}>
          <Download size={16} />
          Download XLS
        </button>
      </div>

      {/* PO Info + Matched Items */}
      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:'20px'}}>

        {/* PO Details */}
        <div className="card" style={{padding:'20px',height:'fit-content'}}>
          <p style={{fontSize:'11px',letterSpacing:'1.5px',color:'#94a3b8',textTransform:'uppercase',
                     fontWeight:700,margin:'0 0 16px'}}>PO Details</p>
          {[
            ['Customer', po?.customer_name],
            ['PO Number', po?.po_number],
            ['PO Date', po?.po_date],
            ['Status', po?.status?.toUpperCase()],
            ['Total Items', po?.total_items],
            ['Matched', po?.matched_items],
            ['Missing', po?.unmatched_items],
          ].map(([k,v]) => (
            <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                                  padding:'10px 0',borderBottom:'1px solid #f8fafc'}}>
              <span style={{fontSize:'12px',color:'#94a3b8'}}>{k}</span>
              <span style={{fontSize:'12px',fontWeight:600,color:'#1e293b',
                             fontFamily: k==='PO Number' ? 'monospace' : 'inherit'}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Matched Items Table */}
        <div className="card" style={{overflow:'hidden'}}>
          <div style={{padding:'18px 24px',borderBottom:'1px solid #f1f5f9',
                       display:'flex',alignItems:'center',gap:'10px'}}>
            <CheckCircle size={18} color="#16a34a" />
            <p style={{fontSize:'14px',fontWeight:700,color:'#0f172a',margin:0}}>
              Matched Items — XLS Preview
            </p>
            <span style={{fontSize:'12px',color:'#94a3b8'}}>({matched.length} items)</span>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f8fafc'}}>
                  {['PCode','Product Name','Packing','Qty','Unit Price','Total',''].map(h => (
                    <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'11px',
                                        fontWeight:700,color:'#94a3b8',letterSpacing:'0.8px',
                                        textTransform:'uppercase'}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matched.map(item => (
                  <tr key={item.id} style={{borderTop:'1px solid #f8fafc'}}>
                    <td style={{padding:'14px 16px',fontSize:'12px',color:'#64748b',fontFamily:'monospace'}}>
                      {item.pcode_matched || '—'}
                    </td>
                    <td style={{padding:'14px 16px'}}>
                      {editingId === item.id ? (
                        <input style={inp} value={editData.pname_matched}
                          onChange={e => setEditData({...editData, pname_matched: e.target.value})} />
                      ) : (
                        <span style={{fontSize:'13px',fontWeight:600,color:'#1e293b'}}>
                          {item.pname_matched || item.product_name}
                        </span>
                      )}
                    </td>
                    <td style={{padding:'14px 16px',fontSize:'12px',color:'#64748b'}}>
                      {item.packing || '—'}
                    </td>
                    <td style={{padding:'14px 16px'}}>
                      {editingId === item.id ? (
                        <input type="number" style={{...inp,width:'70px'}}
                          value={editData.quantity}
                          onChange={e => setEditData({...editData, quantity: e.target.value})} />
                      ) : (
                        <span style={{fontSize:'13px',color:'#1e293b',fontWeight:500}}>
                          {item.quantity}
                        </span>
                      )}
                    </td>
                    <td style={{padding:'14px 16px'}}>
                      {editingId === item.id ? (
                        <input type="number" style={{...inp,width:'90px'}}
                          value={editData.unit_price}
                          onChange={e => setEditData({...editData, unit_price: e.target.value})} />
                      ) : (
                        <span style={{fontSize:'13px',color:'#1e293b'}}>
                          {item.unit_price > 0 ? `₹${item.unit_price}` : '—'}
                        </span>
                      )}
                    </td>
                    <td style={{padding:'14px 16px',fontSize:'13px',color:'#16a34a',fontWeight:700}}>
                      {item.unit_price > 0 ? `₹${(item.quantity * item.unit_price).toFixed(2)}` : '—'}
                    </td>
                    <td style={{padding:'14px 16px'}}>
                      {editingId === item.id ? (
                        <div style={{display:'flex',gap:'6px'}}>
                          <button onClick={() => saveEdit(item.id)}
                            style={{padding:'5px 10px',borderRadius:'6px',background:'#f0fdf4',
                                    color:'#16a34a',border:'1px solid #bbf7d0',cursor:'pointer'}}>
                            <Save size={13} />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{padding:'5px 10px',borderRadius:'6px',background:'#fef2f2',
                                    color:'#ef4444',border:'1px solid #fecaca',cursor:'pointer'}}>
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(item)}
                          style={{padding:'6px',borderRadius:'6px',background:'#f8fafc',
                                  color:'#94a3b8',border:'1px solid #e2e8f0',cursor:'pointer',
                                  transition:'all 0.15s'}}
                          onMouseEnter={e=>{e.currentTarget.style.color='#0d9488';e.currentTarget.style.borderColor='#99f6e4'}}
                          onMouseLeave={e=>{e.currentTarget.style.color='#94a3b8';e.currentTarget.style.borderColor='#e2e8f0'}}>
                          <Edit2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {matched.length === 0 && (
              <div style={{padding:'40px',textAlign:'center',color:'#94a3b8',fontSize:'13px'}}>
                No matched items
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unmatched Items with Map to Product */}
      {unmatched.length > 0 && (
        <div style={{borderRadius:'16px',padding:'20px 24px',
                     background:'#fef2f2',border:'1.5px solid #fecaca'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
            <AlertTriangle size={18} color="#ef4444" />
            <p style={{fontSize:'14px',fontWeight:700,color:'#dc2626',margin:0}}>
              Not Available Products ({unmatched.length}) — Excluded from XLS
            </p>
          </div>

          {unmatched.map(item => (
            <div key={item.id} style={{
              padding:'12px 16px',borderRadius:'10px',
              background:'white',border:'1px solid #fecaca',
              marginBottom:'10px',
            }}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <p style={{fontSize:'13px',fontWeight:600,color:'#dc2626',margin:0}}>
                    {item.product_name}
                  </p>
                  <p style={{fontSize:'11px',color:'#f87171',marginTop:'2px'}}>
                    Qty: {item.quantity} · Not in DB
                    {aliasSaved[item.product_name] && (
                      <span style={{color:'#16a34a',marginLeft:'8px',fontWeight:600}}>
                        ✅ Mapped to {aliasSaved[item.product_name]} — will match 100% next time
                      </span>
                    )}
                  </p>
                </div>
                {!aliasSaved[item.product_name] && (
                  <button
                    onClick={() => {
                      setMappingItem(mappingItem === item.product_name ? null : item.product_name)
                      setSelectedPcode('')
                    }}
                    style={{
                      padding:'6px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:700,
                      background:'#fffbeb',color:'#d97706',
                      border:'1.5px solid #fde68a',cursor:'pointer',whiteSpace:'nowrap',
                    }}>
                    🔗 Map to Product
                  </button>
                )}
              </div>

              {/* Mapping dropdown */}
              {mappingItem === item.product_name && (
                <div style={{marginTop:'12px',padding:'12px',borderRadius:'8px',
                             background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                  <p style={{fontSize:'11px',color:'#64748b',fontWeight:600,
                              textTransform:'uppercase',letterSpacing:'0.5px',margin:'0 0 8px'}}>
                    Select the correct Medi Sync product:
                  </p>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <select
                      className="light-input"
                      style={{flex:1}}
                      value={selectedPcode}
                      onChange={e => setSelectedPcode(e.target.value)}
                    >
                      <option value="">Search and select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.pcode}>
                          {p.pcode} — {p.pname} ({p.packing})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => saveAlias(item)}
                      disabled={!selectedPcode}
                      style={{
                        padding:'9px 18px',borderRadius:'8px',fontSize:'13px',fontWeight:700,
                        cursor: selectedPcode ? 'pointer' : 'not-allowed',
                        background: selectedPcode ? 'linear-gradient(135deg,#0d9488,#0891b2)' : '#e2e8f0',
                        color: selectedPcode ? 'white' : '#94a3b8',
                        border:'none',whiteSpace:'nowrap',
                      }}>
                      Save Mapping
                    </button>
                    <button
                      onClick={() => { setMappingItem(null); setSelectedPcode('') }}
                      style={{padding:'9px',borderRadius:'8px',background:'#f8fafc',
                              color:'#94a3b8',border:'1px solid #e2e8f0',cursor:'pointer'}}>
                      <X size={14}/>
                    </button>
                  </div>
                  <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'8px'}}>
                    💡 Once saved, this mapping is remembered permanently. 
                    Next time "{item.product_name}" appears, it will match 100% automatically.
                  </p>
                </div>
              )}
            </div>
          ))}

          <p style={{fontSize:'12px',color:'#f87171',marginTop:'8px'}}>
            Use "Map to Product" to link hospital product names to Medi Sync products for 100% accuracy.
          </p>
        </div>
      )}
    </div>
  )
}