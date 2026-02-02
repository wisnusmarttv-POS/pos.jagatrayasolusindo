import { useState, useEffect } from 'react';

function DiscountList() {
    const [discounts, setDiscounts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ code: '', name: '', type: 'percentage', value: '', min_order: 0, max_discount: '', start_date: '', end_date: '' });

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => { const res = await fetch('/api/discounts/all'); setDiscounts(await res.json()); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editItem ? `/api/discounts/${editItem.id}` : '/api/discounts';
        const method = editItem ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setShowModal(false); setEditItem(null); fetchData();
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setForm({ code: item.code, name: item.name, type: item.type, value: item.value, min_order: item.min_order || 0, max_discount: item.max_discount || '', start_date: item.start_date?.split('T')[0] || '', end_date: item.end_date?.split('T')[0] || '' });
        setShowModal(true);
    };

    const handleDelete = async (id) => { if (!confirm('Yakin hapus?')) return; await fetch(`/api/discounts/${id}`, { method: 'DELETE' }); fetchData(); };
    const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

    return (
        <>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Master Diskon</h1><p className="page-subtitle">Kelola diskon dan promo</p></div>
                <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ code: '', name: '', type: 'percentage', value: '', min_order: 0, max_discount: '', start_date: '', end_date: '' }); setShowModal(true); }}>+ Tambah Diskon</button>
            </div>
            <div className="page-content">
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead><tr><th>Kode</th><th>Nama</th><th>Tipe</th><th>Nilai</th><th>Min Order</th><th>Periode</th><th>Status</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {discounts.map(d => (
                                    <tr key={d.id}>
                                        <td><code>{d.code}</code></td>
                                        <td>{d.name}</td>
                                        <td><span className="badge badge-secondary">{d.type === 'percentage' ? 'Persen' : 'Nominal'}</span></td>
                                        <td><strong>{d.type === 'percentage' ? `${d.value}%` : formatCurrency(d.value)}</strong></td>
                                        <td>{formatCurrency(d.min_order)}</td>
                                        <td>{d.start_date || d.end_date ? `${d.start_date?.split('T')[0] || '-'} s/d ${d.end_date?.split('T')[0] || '-'}` : 'Tidak terbatas'}</td>
                                        <td><span className={`badge ${d.is_active ? 'badge-success' : 'badge-danger'}`}>{d.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                                        <td><div className="flex gap-sm"><button className="btn btn-sm btn-secondary" onClick={() => handleEdit(d)}>Edit</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id)}>Hapus</button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal modal-lg">
                        <div className="modal-header"><h3 className="modal-title">{editItem ? 'Edit' : 'Tambah'} Diskon</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group"><label className="form-label">Kode Diskon *</label><input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required /></div>
                                    <div className="form-group"><label className="form-label">Tipe *</label><select className="form-input form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="percentage">Persentase (%)</option><option value="fixed">Nominal (Rp)</option></select></div>
                                </div>
                                <div className="form-group"><label className="form-label">Nama Diskon *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                                <div className="grid-2">
                                    <div className="form-group"><label className="form-label">Nilai *</label><input type="number" className="form-input" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required /></div>
                                    <div className="form-group"><label className="form-label">Min. Order</label><input type="number" className="form-input" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })} /></div>
                                </div>
                                {form.type === 'percentage' && <div className="form-group"><label className="form-label">Maks. Diskon</label><input type="number" className="form-input" value={form.max_discount} onChange={e => setForm({ ...form, max_discount: e.target.value })} placeholder="Kosongkan jika tidak ada batas" /></div>}
                                <div className="grid-2">
                                    <div className="form-group"><label className="form-label">Tanggal Mulai</label><input type="date" className="form-input" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">Tanggal Selesai</label><input type="date" className="form-input" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
                                </div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default DiscountList;
