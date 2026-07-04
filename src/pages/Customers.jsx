import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit2, Trash2, Save, X, Users } from 'lucide-react'

const API = import.meta.env.VITE_API_URL
const empty = { name:'', gmail:'', ccode:'', contact_person:'', drug_license:'' }
const colors = ['#0d9488','#7c3aed','#2563eb','#ea580c','#059669','#d97706']
const colorBgs = ['#f0fdfa','#faf5ff','#eff6ff','#fff7ed','#f0fdf4','#fffbeb']

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)

  function load() { axios.get(`${API}/api/customers`).then(r=>setCustomers(r.data)) }
  useEffect(()=>{ load() },[])

  async function save() {
    if(editingId) await axios.put(`${API}/api/customers/${editingId}`,form)
    else await axios.post(`${API}/api/customers`,form)
    setForm(empty); setShowForm(false); setEditingId(null); load()
  }

  async function del(id) {
    if(!confirm('Delete?')) return
    await axios.delete(`${API}/api/customers/${id}`); load()
  }

  function edit(c) { setForm(c); setEditingId(c.id); setShowForm(true) }

  return (
    <div className="fade-up" style={{display:'flex',flexDirection:'column',gap:'24px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:'28px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',margin:0}}>
            Customers
          </h1>
          <p style={{color:'#64748b',fontSize:'13px',marginTop:'4px'}}>
            Hospital accounts linked to PO emails
          </p>
        </div>
        <button onClick={()=>{setForm(empty);setEditingId(null);setShowForm(true)}}
          style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',
                  borderRadius:'10px',fontSize:'13px',fontWeight:700,cursor:'pointer',
                  background:'linear-gradient(135deg,#0d9488,#0891b2)',color:'white',
                  border:'none',boxShadow:'0 4px 12px rgba(13,148,136,0.3)'}}>
          <Plus size={16}/> Add Customer
        </button>
      </div>

      {showForm && (
        <div className="card" style={{padding:'24px'}}>
          <p style={{fontSize:'15px',fontWeight:700,color:'#0f172a',margin:'0 0 16px'}}>
            {editingId ? 'Edit' : 'Add'} Customer
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'14px'}}>
            {[['name','Hospital Name'],['gmail','Gmail Address (PO emails)'],
              ['ccode','Customer Code'],['contact_person','Contact Person'],
              ['drug_license','Drug License No']].map(([key,label])=>(
              <div key={key}>
                <label style={{fontSize:'11px',color:'#64748b',fontWeight:700,letterSpacing:'0.5px',
                                textTransform:'uppercase',display:'block',marginBottom:'6px'}}>
                  {label}
                </label>
                <input className="light-input" value={form[key]} placeholder={label}
                  onChange={e=>setForm({...form,[key]:e.target.value})} />
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'18px'}}>
            <button onClick={save}
              style={{display:'flex',alignItems:'center',gap:'6px',padding:'9px 20px',
                      borderRadius:'8px',fontSize:'13px',fontWeight:700,cursor:'pointer',
                      background:'linear-gradient(135deg,#0d9488,#0891b2)',color:'white',border:'none'}}>
              <Save size={14}/> Save
            </button>
            <button onClick={()=>setShowForm(false)}
              style={{display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',
                      borderRadius:'8px',fontSize:'13px',cursor:'pointer',
                      background:'#f8fafc',color:'#64748b',border:'1.5px solid #e2e8f0',fontWeight:500}}>
              <X size={14}/> Cancel
            </button>
          </div>
        </div>
      )}

      {customers.length===0 ? (
        <div className="card" style={{padding:'80px',textAlign:'center'}}>
          <Users size={48} color="#cbd5e1" style={{margin:'0 auto 16px',display:'block'}}/>
          <p style={{color:'#94a3b8',fontSize:'14px',margin:0}}>No customers yet</p>
          <p style={{color:'#cbd5e1',fontSize:'12px',marginTop:'6px'}}>
            Add hospital customers to link their Gmail to incoming POs
          </p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'16px'}}>
          {customers.map((c,i)=>(
            <div key={c.id} className="card card-hover" style={{padding:'20px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
                <div style={{display:'flex',gap:'14px',flex:1}}>
                  <div style={{
                    width:'46px',height:'46px',borderRadius:'12px',flexShrink:0,
                    background:colorBgs[i%colorBgs.length],
                    border:`1.5px solid ${colors[i%colors.length]}30`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:'20px',fontWeight:800,color:colors[i%colors.length],
                  }}>
                    {c.name[0]}
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:'15px',fontWeight:700,color:'#0f172a',margin:0}}>{c.name}</p>
                    <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'2px',fontFamily:'monospace'}}>
                      {c.ccode}
                    </p>
                    <div style={{marginTop:'12px',display:'flex',flexDirection:'column',gap:'5px'}}>
                      <p style={{fontSize:'12px',color:'#64748b',margin:0}}>📧 {c.gmail}</p>
                      {c.contact_person && <p style={{fontSize:'12px',color:'#64748b',margin:0}}>👤 {c.contact_person}</p>}
                      {c.drug_license && <p style={{fontSize:'12px',color:'#64748b',margin:0}}>📋 {c.drug_license}</p>}
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',gap:'6px',marginLeft:'12px'}}>
                  <button onClick={()=>edit(c)}
                    style={{padding:'7px',borderRadius:'8px',background:'#f8fafc',
                            color:'#94a3b8',border:'1px solid #e2e8f0',cursor:'pointer',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.color='#0d9488';e.currentTarget.style.background='#f0fdfa'}}
                    onMouseLeave={e=>{e.currentTarget.style.color='#94a3b8';e.currentTarget.style.background='#f8fafc'}}>
                    <Edit2 size={14}/>
                  </button>
                  <button onClick={()=>del(c.id)}
                    style={{padding:'7px',borderRadius:'8px',background:'#f8fafc',
                            color:'#94a3b8',border:'1px solid #e2e8f0',cursor:'pointer',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.color='#ef4444';e.currentTarget.style.background='#fef2f2'}}
                    onMouseLeave={e=>{e.currentTarget.style.color='#94a3b8';e.currentTarget.style.background='#f8fafc'}}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}