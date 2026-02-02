import { useState, useEffect } from 'react';

function MenuList() {
    const [menus, setMenus] = useState([]);
    const [menuTypes, setMenuTypes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ code: '', name: '', description: '', menu_type_id: '', price: '', image: null });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        const [menusRes, typesRes] = await Promise.all([fetch('/api/menus/all'), fetch('/api/menu-types')]);
        setMenus(await menusRes.json());
        setMenuTypes(await typesRes.json());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') formData.append(k, v); });

        const url = editItem ? `/api/menus/${editItem.id}` : '/api/menus';
        const method = editItem ? 'PUT' : 'POST';
        await fetch(url, { method, body: formData });
        setShowModal(false); setEditItem(null); setForm({ code: '', name: '', description: '', menu_type_id: '', price: '', image: null });
        fetchData();
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setForm({ code: item.code, name: item.name, description: item.description || '', menu_type_id: item.menu_type_id || '', price: item.price, image: null });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin hapus menu ini?')) return;
        await fetch(`/api/menus/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const toggleAvailable = async (item) => {
        const formData = new FormData();
        formData.append('code', item.code); formData.append('name', item.name);
        formData.append('price', item.price); formData.append('is_available', !item.is_available);
        formData.append('menu_type_id', item.menu_type_id || '');
        await fetch(`/api/menus/${item.id}`, { method: 'PUT', body: formData });
        fetchData();
    };

    const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

    return (
        <>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Master Menu</h1><p className="page-subtitle">Kelola menu restoran</p></div>
                <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ code: '', name: '', description: '', menu_type_id: '', price: '', image: null }); setShowModal(true); }}>+ Tambah Menu</button>
            </div>
            <div className="page-content">
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead><tr><th>Foto</th><th>Kode</th><th>Nama</th><th>Tipe</th><th>Harga</th><th>Status</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {menus.map(m => (
                                    <tr key={m.id}>
                                        <td><div style={{ width: 50, height: 50, background: 'var(--bg-tertiary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{m.image_url ? <img src={m.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍽️'}</div></td>
                                        <td><code>{m.code}</code></td>
                                        <td><strong>{m.name}</strong><br /><small className="text-muted">{m.description}</small></td>
                                        <td><span className="badge badge-secondary">{m.type_name || '-'}</span></td>
                                        <td>{formatCurrency(m.price)}</td>
                                        <td><button className={`badge ${m.is_available ? 'badge-success' : 'badge-danger'}`} onClick={() => toggleAvailable(m)} style={{ cursor: 'pointer', border: 'none' }}>{m.is_available ? 'Tersedia' : 'Habis'}</button></td>
                                        <td><div className="flex gap-sm"><button className="btn btn-sm btn-secondary" onClick={() => handleEdit(m)}>Edit</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>Hapus</button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header"><h3 className="modal-title">{editItem ? 'Edit Menu' : 'Tambah Menu'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group"><label className="form-label">Kode *</label><input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required /></div>
                                    <div className="form-group"><label className="form-label">Tipe Menu</label><select className="form-input form-select" value={form.menu_type_id} onChange={e => setForm({ ...form, menu_type_id: e.target.value })}><option value="">-- Pilih --</option>{menuTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                                </div>
                                <div className="form-group"><label className="form-label">Nama Menu *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                                <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="form-input form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Harga *</label><input type="number" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
                                <div className="form-group"><label className="form-label">Foto Menu</label><input type="file" className="form-input" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files[0] })} /></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default MenuList;
