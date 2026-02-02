import { useState, useEffect } from 'react';

function TableManagement() {
    const [tables, setTables] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ table_number: '', capacity: 4, location: 'Indoor' });

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => { const res = await fetch('/api/tables/all'); setTables(await res.json()); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editItem ? `/api/tables/${editItem.id}` : '/api/tables';
        const method = editItem ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setShowModal(false); setEditItem(null); fetchData();
    };

    const handleEdit = (item) => { setEditItem(item); setForm({ table_number: item.table_number, capacity: item.capacity, location: item.location || 'Indoor', status: item.status }); setShowModal(true); };
    const handleDelete = async (id) => { if (!confirm('Yakin hapus?')) return; await fetch(`/api/tables/${id}`, { method: 'DELETE' }); fetchData(); };

    const setStatus = async (item, status) => {
        await fetch(`/api/tables/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, status }) });
        fetchData();
    };

    return (
        <>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Manajemen Meja</h1><p className="page-subtitle">Atur meja restoran</p></div>
                <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ table_number: '', capacity: 4, location: 'Indoor' }); setShowModal(true); }}>+ Tambah Meja</button>
            </div>
            <div className="page-content">
                <div className="stats-grid mb-lg">
                    <div className="stat-card"><div className="stat-card-icon success">🟢</div><div className="stat-card-value">{tables.filter(t => t.status === 'available' && t.is_active).length}</div><div className="stat-card-label">Tersedia</div></div>
                    <div className="stat-card"><div className="stat-card-icon warning">🟡</div><div className="stat-card-value">{tables.filter(t => t.status === 'reserved' && t.is_active).length}</div><div className="stat-card-label">Reserved</div></div>
                    <div className="stat-card"><div className="stat-card-icon accent">🔴</div><div className="stat-card-value">{tables.filter(t => t.status === 'occupied' && t.is_active).length}</div><div className="stat-card-label">Terisi</div></div>
                </div>
                <div className="table-layout-grid">
                    {tables.filter(t => t.is_active).map(t => (
                        <div key={t.id} className={`table-card ${t.status}`} onClick={() => handleEdit(t)}>
                            <div className="table-number">{t.table_number}</div>
                            <div className="table-capacity">👥 {t.capacity} orang</div>
                            <span className={`table-status badge ${t.status === 'available' ? 'badge-success' : t.status === 'occupied' ? 'badge-danger' : 'badge-warning'}`}>{t.status === 'available' ? 'Kosong' : t.status === 'occupied' ? 'Terisi' : 'Reserved'}</span>
                            <div className="flex gap-sm mt-md">
                                <button className="btn btn-sm btn-success" onClick={e => { e.stopPropagation(); setStatus(t, 'available'); }}>🟢</button>
                                <button className="btn btn-sm btn-warning" onClick={e => { e.stopPropagation(); setStatus(t, 'reserved'); }}>🟡</button>
                                <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); setStatus(t, 'occupied'); }}>🔴</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header"><h3 className="modal-title">{editItem ? 'Edit' : 'Tambah'} Meja</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Nomor Meja *</label><input className="form-input" value={form.table_number} onChange={e => setForm({ ...form, table_number: e.target.value })} required /></div>
                                <div className="form-group"><label className="form-label">Kapasitas</label><input type="number" className="form-input" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 4 })} /></div>
                                <div className="form-group"><label className="form-label">Lokasi</label><select className="form-input form-select" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}><option>Indoor</option><option>Outdoor</option><option>VIP</option><option>Rooftop</option></select></div>
                            </div>
                            <div className="modal-footer">
                                {editItem && <button type="button" className="btn btn-danger" onClick={() => { handleDelete(editItem.id); setShowModal(false); }}>Hapus</button>}
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default TableManagement;
