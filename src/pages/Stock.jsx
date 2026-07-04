import { useEffect, useState } from 'react'
import axios from 'axios'
import { Save, Boxes, Upload, FileText } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://88.223.94.1:5000'

export default function Stock() {
  const [products, setProducts] = useState([])
  const [history, setHistory] = useState([])
  const [form, setForm] = useState({ product_id: '', quantity: '', notes: '' })
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)

  function loadAll() {
    axios.get(`${API}/api/products`).then(r => setProducts(r.data))
    axios.get(`${API}/api/stock`).then(r => setHistory(r.data))
  }

  useEffect(() => { loadAll() }, [])

  async function submit() {
    if (!form.product_id || !form.quantity) return alert('Select product and enter quantity')
    await axios.post(`${API}/api/stock`, {
      product_id: form.product_id,
      quantity: form.quantity,
      updated_by: 'admin',
      notes: form.notes,
    })
    setForm({ product_id: '', quantity: '', notes: '' })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    loadAll()
  }

  async function uploadDocument(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadMsg('Uploading document...')
    setUploadedFile(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('notes', `Stock document: ${file.name}`)

    try {
      const res = await axios.post(`${API}/api/stock/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadMsg(`✅ Document uploaded: ${file.name}`)
      setUploadedFile({ name: file.name, size: file.size, type: file.type })
      loadAll()
    } catch (err) {
      setUploadMsg(`❌ Upload failed: ${err.response?.data?.error || err.message}`)
    }
    setUploading(false)
    e.target.value = ''
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function getFileIcon(type) {
    if (type?.includes('pdf')) return '📄'
    if (type?.includes('word') || type?.includes('document')) return '📝'
    if (type?.includes('image')) return '🖼️'
    if (type?.includes('sheet') || type?.includes('excel')) return '📊'
    return '📎'
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', margin: 0 }}>
          Daily Stock Update
        </h1>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
          Update stock levels manually or upload a stock document
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Manual Update */}
        <div className="card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
            Manual Stock Update
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px',
                              textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Product
              </label>
              <select className="light-input" value={form.product_id}
                onChange={e => setForm({ ...form, product_id: e.target.value })}>
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.pname} (current: {p.stock})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px',
                              textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                New Quantity
              </label>
              <input type="number" className="light-input" placeholder="0"
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px',
                              textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Notes
              </label>
              <input className="light-input" placeholder="e.g. New batch received"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button onClick={submit}
            style={{
              marginTop: '18px', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', width: '100%', justifyContent: 'center',
              background: saved ? '#f0fdf4' : 'linear-gradient(135deg,#0d9488,#0891b2)',
              color: saved ? '#16a34a' : 'white',
              border: saved ? '1.5px solid #bbf7d0' : 'none',
              boxShadow: saved ? 'none' : '0 4px 12px rgba(13,148,136,0.3)',
            }}>
            <Save size={15} />
            {saved ? '✓ Stock Updated!' : 'Update Stock'}
          </button>
        </div>

        {/* Document Upload */}
        <div className="card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            Upload Stock Document
          </p>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 20px' }}>
            Upload PDF, Word, Excel, JPG, PNG or any document for reference
          </p>

          {/* Upload area */}
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '32px', borderRadius: '12px', cursor: 'pointer',
            border: '2px dashed #e2e8f0', background: '#f8fafc',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d9488'; e.currentTarget.style.background = '#f0fdfa' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: '#f0fdfa', border: '1.5px solid #99f6e4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
            }}>
              <Upload size={22} color="#0d9488" />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
              {uploading ? 'Uploading...' : 'Click to upload document'}
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              PDF, Word, Excel, JPG, PNG — any format
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.txt,.csv"
              onChange={uploadDocument}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>

          {/* Upload status */}
          {uploadMsg && (
            <div style={{
              marginTop: '12px', padding: '12px 14px', borderRadius: '8px', fontSize: '13px',
              background: uploadMsg.includes('✅') ? '#f0fdf4' : '#fef2f2',
              color: uploadMsg.includes('✅') ? '#16a34a' : '#ef4444',
              border: `1px solid ${uploadMsg.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              {uploadMsg}
            </div>
          )}

          {/* Uploaded file info */}
          {uploadedFile && (
            <div style={{
              marginTop: '12px', padding: '14px', borderRadius: '10px',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: '#f0fdfa', border: '1px solid #99f6e4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px',
              }}>
                {getFileIcon(uploadedFile.type)}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                  {uploadedFile.name}
                </p>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
                      display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Boxes size={18} color="#0d9488" />
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Stock Update History
          </p>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            No stock updates yet
          </div>
        ) : history.map((h, i) => (
          <div key={h.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: i < history.length - 1 ? '1px solid #f8fafc' : 'none',
          }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {h.pname || 'Document Upload'}
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' }}>
                {h.pcode} {h.notes && `· ${h.notes}`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#0d9488', margin: 0, fontFamily: 'monospace' }}>
                {h.quantity}
              </p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                {new Date(h.created_at).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}