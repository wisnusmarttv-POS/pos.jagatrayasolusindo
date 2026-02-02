import { useState, useEffect } from 'react';

function MenuTypeList() {
    const [types, setTypes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', icon: '', color: '#FF6B6B', sort_order: 0 });

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => { const res = await fetch('/api/menu-types/all'); setTypes(await res.json()); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editItem ? `/api/menu-types/${editItem.id}` : '/api/menu-types';
        const method = editItem ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setShowModal(false); setEditItem(null); fetchData();
    };

    const handleEdit = (item) => { setEditItem(item); setForm({ name: item.name, description: item.description || '', icon: item.icon || '', color: item.color || '#FF6B6B', sort_order: item.sort_order || 0 }); setShowModal(true); };
    const handleDelete = async (id) => { if (!confirm('Yakin hapus?')) return; await fetch(`/api/menu-types/${id}`, { method: 'DELETE' }); fetchData(); };

    const icons = ['🍽️', '🥤', '🥗', '🍰', '🍟', '🍕', '🍜', '🍣', '🥪', '☕', '🍺', '🧁'];

    return (
        <>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Tipe Menu</h1><p className="page-subtitle">Kategori menu restoran</p></div>
                <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ name: '', description: '', icon: '', color: '#FF6B6B', sort_order: 0 }); setShowModal(true); }}>+ Tambah Tipe</button>
            </div>
            <div className="page-content">
                <div className="grid-3">
                    {types.map(t => (
                        <div key={t.id} className="card">
                            <div className="card-body text-center">
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{t.icon || '📂'}</div>
                                <h3>{t.name}</h3>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>{t.description || '-'}</p>
                                <div className="flex gap-sm justify-center mt-md">
                                    <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(t)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}>Hapus</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header"><h3 className="modal-title">{editItem ? 'Edit' : 'Tambah'} Tipe Menu</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Icon</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {icons.map(ic => <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })} style={{ fontSize: '1.5rem', padding: '0.5rem', background: form.icon === ic ? 'var(--primary-500)' : 'var(--bg-tertiary)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>{ic}</button>)}
                                    </div>
                                </div>
                                <div className="form-group"><label className="form-label">Nama *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                                <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="form-input form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Urutan</label><input type="number" className="form-input" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default MenuTypeList;
