import { useEffect, useState } from 'react'
import axios from 'axios'
import { Save, DollarSign, Upload, Plus, Trash2, Search } from 'lucide-react'

const API = import.meta.env.VITE_API_URL
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Pricing() {
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [prices, setPrices] = useState([])
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [newRow, setNewRow] = useState({ pcode: '', price: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get(`${API}/api/customers`).then(r => setCustomers(r.data))
    axios.get(`${API}/api/products`).then(r => setProducts(r.data))
  }, [])

  useEffect(() => {
    if (!selectedCustomer) return
    axios.get(`${API}/api/pricing?customer_id=${selectedCustomer}&month=${month}&year=${year}`)
      .then(r => setPrices(r.data))
  }, [selectedCustomer, month, year])

  async function uploadExcel(e) {
    const file = e.target.files[0]
    if (!file || !selectedCustomer) {
      alert('Please select a customer first')
      return
    }
    setUploading(true)
    setUploadMsg('Uploading...')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('customer_id', selectedCustomer)
    formData.append('month', month)
    formData.append('year', year)
    try {
      const res = await axios.post(`${API}/api/pricing/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadMsg(`✅ Imported ${res.data.count} prices`)
      axios.get(`${API}/api/pricing?customer_id=${selectedCustomer}&month=${month}&year=${year}`)
        .then(r => setPrices(r.data))
    } catch (err) {
      setUploadMsg(`❌ ${err.response?.data?.error || err.message}`)
    }
    setUploading(false)
    e.target.value = ''
  }

  async function addPrice() {
    if (!newRow.pcode || !newRow.price || !selectedCustomer) return
    await axios.post(`${API}/api/pricing`, {
      customer_id: selectedCustomer,
      pcode: newRow.pcode,
      price: newRow.price,
      month, year,
    })
    setNewRow({ pcode: '', price: '' })
    axios.get(`${API}/api/pricing?customer_id=${selectedCustomer}&month=${month}&year=${year}`)
      .then(r => setPrices(r.data))
  }

  async function deletePrice(id) {
    await axios.delete(`${API}/api/pricing/${id}`)
    setPrices(prices.filter(p => p.id !== id))
  }

  const filteredPrices = prices.filter(p =>
    !search || p.pname?.toLowerCase().includes(search.toLowerCase()) ||
    p.pcode?.toLowerCase().includes(search.toLowerCase())
  )

  const selectedCustomerName = customers.find(c => c.id == selectedCustomer)?.name || ''

  return (
    <div className="fade-up" style={{display:'flex',flexDirection:'column',gap:'24px'}}>
      <div>
        <h1 style={{fontSize:'28px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',margin:0}}>
          Monthly Pricing
        </h1>
        <p style={{color:'#64748b',fontSize:'13px',marginTop:'4px'}}>
          Upload or set per-product prices for each customer — applied automatically when generating XLS
        </p>
      </div>

      {/* Controls */}
      <div className="card" style={{padding:'20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:'14px',alignItems:'end'}}>
          <div>
            <label style={{fontSize:'11px',color:'#64748b',fontWeight:700,letterSpacing:'0.5px',
                            textTransform:'uppercase',display:'block',marginBottom:'6px'}}>
              Customer
            </label>
            <select className="light-input" value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}>
              <option value="">Select customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{fontSize:'11px',color:'#64748b',fontWeight:700,letterSpacing:'0.5px',
                            textTransform:'uppercase',display:'block',marginBottom:'6px'}}>
              Month
            </label>
            <select className="light-input" value={month}
              onChange={e => setMonth(Number(e.target.value))}>
              {months.map((m, i) => (
                <option key={m} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{fontSize:'11px',color:'#64748b',fontWeight:700,letterSpacing:'0.5px',
                            textTransform:'uppercase',display:'block',marginBottom:'6px'}}>
              Year
            </label>
            <input type="number" className="light-input" value={year}
              onChange={e => setYear(Number(e.target.value))} />
          </div>
          <div>
            <label style={{fontSize:'11px',color:'#64748b',fontWeight:700,letterSpacing:'0.5px',
                            textTransform:'uppercase',display:'block',marginBottom:'6px'}}>
              Upload Excel
            </label>
            <label style={{
              display:'flex',alignItems:'center',gap:'8px',padding:'9px 16px',
              borderRadius:'8px',fontSize:'13px',fontWeight:700,cursor:'pointer',
              background:'#f0fdf4',color:'#16a34a',border:'1.5px solid #bbf7d0',
              whiteSpace:'nowrap',
            }}>
              <Upload size={14}/> {uploading ? 'Uploading...' : 'Upload Price List'}
              <input type="file" accept=".xlsx,.xls" onChange={uploadExcel}
                style={{display:'none'}} disabled={uploading || !selectedCustomer} />
            </label>
          </div>
        </div>

        {uploadMsg && (
          <div style={{
            marginTop:'12px',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',
            background: uploadMsg.includes('✅') ? '#f0fdf4' : '#fef2f2',
            color: uploadMsg.includes('✅') ? '#16a34a' : '#ef4444',
            border: `1px solid ${uploadMsg.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
          }}>
            {uploadMsg}
            <span style={{marginLeft:'8px',fontSize:'11px',color:'#94a3b8'}}>
              Expected Excel format: columns PCode and Price
            </span>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <>
          {/* Add single price */}
          <div className="card" style={{padding:'20px'}}>
            <p style={{fontSize:'14px',fontWeight:700,color:'#0f172a',margin:'0 0 14px'}}>
              Add Single Price — {selectedCustomerName} · {months[month-1]} {year}
            </p>
            <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
              <select className="light-input" style={{flex:2}}
                value={newRow.pcode}
                onChange={e => setNewRow({...newRow, pcode: e.target.value})}>
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.pcode}>{p.pcode} — {p.pname}</option>
                ))}
              </select>
              <div style={{position:'relative',flex:1}}>
                <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',
                               color:'#94a3b8',fontSize:'14px'}}>₹</span>
                <input type="number" step="0.01" placeholder="Price"
                  className="light-input" style={{paddingLeft:'28px'}}
                  value={newRow.price}
                  onChange={e => setNewRow({...newRow, price: e.target.value})} />
              </div>
              <button onClick={addPrice}
                style={{display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',
                        borderRadius:'8px',fontSize:'13px',fontWeight:700,cursor:'pointer',
                        background:'linear-gradient(135deg,#0d9488,#0891b2)',color:'white',
                        border:'none',whiteSpace:'nowrap'}}>
                <Plus size={14}/> Add Price
              </button>
            </div>
          </div>

          {/* Price list table */}
          <div className="card" style={{overflow:'hidden'}}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #f1f5f9',
                         display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <DollarSign size={18} color="#0d9488"/>
                <p style={{fontSize:'15px',fontWeight:700,color:'#0f172a',margin:0}}>
                  {selectedCustomerName} — {months[month-1]} {year}
                  <span style={{fontSize:'13px',color:'#94a3b8',fontWeight:400,marginLeft:'8px'}}>
                    ({prices.length} products priced)
                  </span>
                </p>
              </div>
              <div style={{position:'relative'}}>
                <Search size={14} color="#94a3b8"
                  style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)'}}/>
                <input className="light-input" style={{paddingLeft:'32px',width:'200px'}}
                  placeholder="Search product..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            {filteredPrices.length === 0 ? (
              <div style={{padding:'48px',textAlign:'center',color:'#94a3b8',fontSize:'13px'}}>
                {prices.length === 0
                  ? 'No prices set yet — upload a price list Excel or add manually above'
                  : 'No products match your search'}
              </div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f8fafc'}}>
                    {['PCode','Product Name','Price (₹)',''].map(h => (
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'11px',
                                           fontWeight:700,color:'#94a3b8',letterSpacing:'0.8px',
                                           textTransform:'uppercase'}}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map((p, i) => (
                    <tr key={p.id} style={{borderTop:'1px solid #f8fafc'}}
                      onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'13px 16px',fontSize:'12px',color:'#64748b',fontFamily:'monospace'}}>
                        {p.pcode}
                      </td>
                      <td style={{padding:'13px 16px',fontSize:'13px',fontWeight:600,color:'#1e293b'}}>
                        {p.pname || '—'}
                      </td>
                      <td style={{padding:'13px 16px',fontSize:'15px',fontWeight:800,color:'#0d9488',fontFamily:'monospace'}}>
                        ₹{parseFloat(p.price).toFixed(2)}
                      </td>
                      <td style={{padding:'13px 16px'}}>
                        <button onClick={() => deletePrice(p.id)}
                          style={{padding:'5px',borderRadius:'6px',background:'#f8fafc',
                                  color:'#94a3b8',border:'1px solid #e2e8f0',cursor:'pointer'}}
                          onMouseEnter={e=>{e.currentTarget.style.color='#ef4444';e.currentTarget.style.background='#fef2f2'}}
                          onMouseLeave={e=>{e.currentTarget.style.color='#94a3b8';e.currentTarget.style.background='#f8fafc'}}>
                          <Trash2 size={13}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Download template */}
          <div style={{textAlign:'center'}}>
            <button
              onClick={() => {
                const XLSX = window.XLSX || null
                // Create sample Excel template
                const data = [
                  { PCode: '1037', Price: 150.00 },
                  { PCode: '2576', Price: 89.50 },
                  { PCode: '126',  Price: 99.00 },
                ]
                const csvContent = 'PCode,Price\n' + data.map(r => `${r.PCode},${r.Price}`).join('\n')
                const blob = new Blob([csvContent], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `price_template_${selectedCustomerName}_${months[month-1]}${year}.csv`
                a.click()
              }}
              style={{fontSize:'12px',color:'#0d9488',background:'none',border:'none',
                      cursor:'pointer',textDecoration:'underline'}}>
              Download price list template (CSV)
            </button>
          </div>
        </>
      )}
    </div>
  )
}