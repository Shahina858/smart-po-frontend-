import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Search, Edit2, Trash2, Save, X, Package, Upload } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://88.223.94.1:5000'
const empty = { pcode:'', pname:'', packing:'', manufacturer:'', stock:0, mrp:0 }

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')

  function load(q='') {
    axios.get(`${API}/api/products?search=${q}`)
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(() => load(search), 400)
    return () => clearTimeout(t)
  }, [search])

  async function save() {
    if (editingId) await axios.put(`${API}/api/products/${editingId}`, form)
    else await axios.post(`${API}/api/products`, form)
    setForm(empty); setShowForm(false); setEditingId(null); load(search)
  }

  async function del(id) {
    if (!confirm('Delete this product?')) return
    await axios.delete(`${API}/api/products/${id}`); load(search)
  }

  function edit(p) { setForm(p); setEditingId(p.id); setShowForm(true) }

  async function importExcel(e) {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    setImportMsg('Importing products...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(`${API}/api/products/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImportMsg(`✅ Imported ${res.data.count} products successfully`)
      load()
    } catch (err) {
      setImportMsg(`❌ Import failed: ${err.response?.data?.error || err.message}`)
    }
    setImporting(false)
    // Reset input
    e.target.value = ''
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
            Product Database
          </h1>
          <p style={{color:'#64748b',fontSize:'13px',marginTop:'4px'}}>{products.length} products</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>

          {/* Import Excel button */}
          <label style={{
            display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',
            borderRadius:'10px',fontSize:'13px',fontWeight:700,cursor:'pointer',
            background:'#f0fdf4',color:'#16a34a',
            border:'1.5px solid #bbf7d0',transition:'all 0.15s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='#16a34a';e.currentTarget.style.color='white'}}
            onMouseLeave={e=>{e.currentTarget.style.background='#f0fdf4';e.currentTarget.style.color='#16a34a'}}
          >
            <Upload size={15}/>
            {importing ? 'Importing...' : 'Import STS Excel'}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={importExcel}
              style={{display:'none'}}
              disabled={importing}
            />
          </label>

          {/* Add Product button */}
          <button
            onClick={() => { setForm(empty); setEditingId(null); setShowForm(true) }}
            style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',
                    borderRadius:'10px',fontSize:'13px',fontWeight:700,cursor:'pointer',
                    background:'linear-gradient(135deg,#0d9488,#0891b2)',color:'white',
                    border:'none',boxShadow:'0 4px 12px rgba(13,148,136,0.3)'}}>
            <Plus size={16}/> Add Product
          </button>
        </div>
      </div>

      {/* Import status message */}
      {importMsg && (
        <div style={{
          padding:'12px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:500,
          background: importMsg.includes('✅') ? '#f0fdf4' : '#fef2f2',
          color: importMsg.includes('✅') ? '#16a34a' : '#ef4444',
          border: `1px solid ${importMsg.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
          display:'flex',alignItems:'center',justifyContent:'space-between',
        }}>
          {importMsg}
          <button onClick={() => setImportMsg('')}
            style={{background:'none',border:'none',cursor:'pointer',
                    color:'inherit',fontSize:'16px',padding:'0 4px'}}>×</button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{padding:'24px'}}>
          <p style={{fontSize:'15px',fontWeight:700,color:'#0f172a',margin:'0 0 16px'}}>
            {editingId ? 'Edit' : 'Add'} Product
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px'}}>
            {[['pcode','Product Code'],['pname','Product Name'],['packing','Packing'],
              ['manufacturer','Manufacturer'],['stock','Stock Qty'],['mrp','MRP (₹)']].map(([key,label]) => (
              <div key={key}>
                <label style={{fontSize:'11px',color:'#64748b',fontWeight:700,letterSpacing:'0.5px',
                                textTransform:'uppercase',display:'block',marginBottom:'6px'}}>
                  {label}
                </label>
                <input className="light-input" value={form[key]} placeholder={label}
                  onChange={e => setForm({...form,[key]:e.target.value})} />
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
            <button onClick={() => setShowForm(false)}
              style={{display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',
                      borderRadius:'8px',fontSize:'13px',cursor:'pointer',
                      background:'#f8fafc',color:'#64748b',border:'1.5px solid #e2e8f0',fontWeight:500}}>
              <X size={14}/> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{position:'relative'}}>
        <Search size={15} color="#94a3b8"
          style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)'}} />
        <input className="light-input" style={{paddingLeft:'40px'}}
          placeholder="Search by product name or code..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card" style={{overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f8fafc',borderBottom:'1px solid #f1f5f9'}}>
              {['PCode','Product Name','Packing','Manufacturer','Stock','MRP',''].map(h => (
                <th key={h} style={{padding:'13px 16px',textAlign:'left',fontSize:'11px',
                                     fontWeight:700,color:'#94a3b8',letterSpacing:'0.8px',
                                     textTransform:'uppercase'}}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id}
                style={{borderBottom:'1px solid #f8fafc',transition:'background 0.1s'}}
                onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <td style={{padding:'14px 16px',fontSize:'12px',color:'#64748b',fontFamily:'monospace'}}>
                  {p.pcode}
                </td>
                <td style={{padding:'14px 16px',fontSize:'13px',fontWeight:700,color:'#1e293b'}}>
                  {p.pname}
                </td>
                <td style={{padding:'14px 16px',fontSize:'13px',color:'#64748b'}}>{p.packing}</td>
                <td style={{padding:'14px 16px',fontSize:'13px',color:'#64748b'}}>{p.manufacturer}</td>
                <td style={{padding:'14px 16px'}}>
                  <span style={{
                    padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700,
                    background: p.stock>50 ? '#f0fdf4' : p.stock>0 ? '#fffbeb' : '#fef2f2',
                    color: p.stock>50 ? '#16a34a' : p.stock>0 ? '#d97706' : '#ef4444',
                    border: `1px solid ${p.stock>50 ? '#bbf7d0' : p.stock>0 ? '#fde68a' : '#fecaca'}`,
                  }}>
                    {p.stock}
                  </span>
                </td>
                <td style={{padding:'14px 16px',fontSize:'13px',color:'#1e293b',fontWeight:600}}>
                  ₹{p.mrp}
                </td>
                <td style={{padding:'14px 16px'}}>
                  <div style={{display:'flex',gap:'6px'}}>
                    <button onClick={() => edit(p)}
                      style={{padding:'6px',borderRadius:'6px',background:'#f8fafc',
                              color:'#94a3b8',border:'1px solid #e2e8f0',cursor:'pointer',transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.color='#0d9488';e.currentTarget.style.background='#f0fdfa'}}
                      onMouseLeave={e=>{e.currentTarget.style.color='#94a3b8';e.currentTarget.style.background='#f8fafc'}}>
                      <Edit2 size={13}/>
                    </button>
                    <button onClick={() => del(p.id)}
                      style={{padding:'6px',borderRadius:'6px',background:'#f8fafc',
                              color:'#94a3b8',border:'1px solid #e2e8f0',cursor:'pointer',transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.color='#ef4444';e.currentTarget.style.background='#fef2f2'}}
                      onMouseLeave={e=>{e.currentTarget.style.color='#94a3b8';e.currentTarget.style.background='#f8fafc'}}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div style={{padding:'60px',textAlign:'center'}}>
            <Package size={40} color="#cbd5e1" style={{margin:'0 auto 12px',display:'block'}}/>
            <p style={{color:'#94a3b8',fontSize:'13px',margin:0}}>No products found</p>
            <p style={{color:'#cbd5e1',fontSize:'12px',marginTop:'6px'}}>
              Import your STS Excel file to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}