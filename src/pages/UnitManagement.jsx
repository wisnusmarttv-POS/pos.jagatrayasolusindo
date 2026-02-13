import { useState, useEffect } from 'react';

function UnitManagement() {
    const [activeTab, setActiveTab] = useState('units'); // units, conversions
    const [units, setUnits] = useState([]);
    const [conversions, setConversions] = useState([]);

    // Modal & Form States
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [showConvModal, setShowConvModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [unitForm, setUnitForm] = useState({ name: '', symbol: '', description: '' });
    const [convForm, setConvForm] = useState({ from_unit_id: '', to_unit_id: '', factor: '' });

    useEffect(() => {
        fetchUnits();
        fetchConversions();
    }, []);

    const fetchUnits = async () => {
        const res = await fetch('/api/units');
        if (res.ok) setUnits(await res.json());
    };

    const fetchConversions = async () => {
        const res = await fetch('/api/unit-conversions');
        if (res.ok) setConversions(await res.json());
    };

    // --- UNIT HANDLERS ---
    const handleUnitSubmit = async (e) => {
        e.preventDefault();
        const url = editItem ? `/api/units/${editItem.id}` : '/api/units';
        const method = editItem ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(unitForm)
        });

        if (res.ok) {
            setShowUnitModal(false);
            setEditItem(null);
            setUnitForm({ name: '', symbol: '', description: '' });
            fetchUnits();
            fetchConversions(); // Refresh conversions too as names might change
        } else {
            alert('Gagal menyimpan satuan');
        }
    };

    const handleUnitDelete = async (id) => {
        if (!confirm('Yakin hapus satuan ini?')) return;
        const res = await fetch(`/api/units/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchUnits();
            fetchConversions();
        } else {
            alert('Gagal menghapus satuan (mungkin sedang digunakan)');
        }
    };

    const openUnitModal = (item = null) => {
        setEditItem(item);
        if (item) setUnitForm({ name: item.name, symbol: item.symbol, description: item.description || '' });
        else setUnitForm({ name: '', symbol: '', description: '' });
        setShowUnitModal(true);
    };

    // --- CONVERSION HANDLERS ---
    const handleConvSubmit = async (e) => {
        e.preventDefault();
        const url = editItem ? `/api/unit-conversions/${editItem.id}` : '/api/unit-conversions';
        const method = editItem ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(convForm)
        });

        if (res.ok) {
            setShowConvModal(false);
            setEditItem(null);
            setConvForm({ from_unit_id: '', to_unit_id: '', factor: '' });
            fetchConversions();
        } else {
            alert('Gagal menyimpan konversi');
        }
    };

    const handleConvDelete = async (id) => {
        if (!confirm('Yakin hapus konversi ini?')) return;
        const res = await fetch(`/api/unit-conversions/${id}`, { method: 'DELETE' });
        if (res.ok) fetchConversions();
        else alert('Gagal menghapus konversi');
    };

    const openConvModal = (item = null) => {
        setEditItem(item);
        if (item) setConvForm({ from_unit_id: item.from_unit_id, to_unit_id: item.to_unit_id, factor: item.factor });
        else setConvForm({ from_unit_id: '', to_unit_id: '', factor: '' });
        setShowConvModal(true);
    };

    return (
        <>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Master Satuan</h1>
                    <p className="page-subtitle">Kelola satuan dan konversi</p>
                </div>
                <div>
                    {activeTab === 'units' && (
                        <button className="btn btn-primary" onClick={() => openUnitModal()}>+ Tambah Satuan</button>
                    )}
                    {activeTab === 'conversions' && (
                        <button className="btn btn-primary" onClick={() => openConvModal()}>+ Tambah Konversi</button>
                    )}
                </div>
            </div>

            <div className="page-content">
                <div className="card mb-lg">
                    <div className="card-body" style={{ padding: '0.5rem' }}>
                        <div className="flex gap-md">
                            <button
                                className={`btn ${activeTab === 'units' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('units')}
                            >
                                Daftar Satuan
                            </button>
                            <button
                                className={`btn ${activeTab === 'conversions' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('conversions')}
                            >
                                Konversi Satuan
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        {activeTab === 'units' ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Simbol</th>
                                        <th>Deskripsi</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.map(u => (
                                        <tr key={u.id}>
                                            <td><strong>{u.name}</strong></td>
                                            <td><span className="badge badge-secondary">{u.symbol}</span></td>
                                            <td>{u.description}</td>
                                            <td>
                                                <div className="flex gap-sm">
                                                    <button className="btn btn-sm btn-secondary" onClick={() => openUnitModal(u)}>Edit</button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleUnitDelete(u.id)}>Hapus</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {units.length === 0 && <tr><td colSpan="4" className="text-center p-md">Belum ada data satuan</td></tr>}
                                </tbody>
                            </table>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Dari Satuan</th>
                                        <th>Ke Satuan</th>
                                        <th>Faktor Konversi</th>
                                        <th>Keterangan</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conversions.map(c => (
                                        <tr key={c.id}>
                                            <td>{c.from_unit_name} ({c.from_unit_symbol})</td>
                                            <td>{c.to_unit_name} ({c.to_unit_symbol})</td>
                                            <td><strong>{c.factor}</strong></td>
                                            <td>1 {c.from_unit_symbol} = {c.factor} {c.to_unit_symbol}</td>
                                            <td>
                                                <div className="flex gap-sm">
                                                    <button className="btn btn-sm btn-secondary" onClick={() => openConvModal(c)}>Edit</button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleConvDelete(c.id)}>Hapus</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {conversions.length === 0 && <tr><td colSpan="5" className="text-center p-md">Belum ada data konversi</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* UNIT MODAL */}
            {showUnitModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">{editItem ? 'Edit Satuan' : 'Tambah Satuan'}</h3>
                            <button className="modal-close" onClick={() => setShowUnitModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleUnitSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nama Satuan *</label>
                                    <input className="form-input" value={unitForm.name} onChange={e => setUnitForm({ ...unitForm, name: e.target.value })} placeholder="Contoh: Kilogram" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Simbol *</label>
                                    <input className="form-input" value={unitForm.symbol} onChange={e => setUnitForm({ ...unitForm, symbol: e.target.value })} placeholder="Contoh: kg" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Deskripsi</label>
                                    <textarea className="form-input form-textarea" value={unitForm.description} onChange={e => setUnitForm({ ...unitForm, description: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUnitModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CONVERSION MODAL */}
            {showConvModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">{editItem ? 'Edit Konversi' : 'Tambah Konversi'}</h3>
                            <button className="modal-close" onClick={() => setShowConvModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleConvSubmit}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Dari Satuan *</label>
                                        <select className="form-input form-select" value={convForm.from_unit_id} onChange={e => setConvForm({ ...convForm, from_unit_id: e.target.value })} required>
                                            <option value="">-- Pilih --</option>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Ke Satuan *</label>
                                        <select className="form-input form-select" value={convForm.to_unit_id} onChange={e => setConvForm({ ...convForm, to_unit_id: e.target.value })} required>
                                            <option value="">-- Pilih --</option>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Faktor Konversi *</label>
                                    <input type="number" step="0.0001" className="form-input" value={convForm.factor} onChange={e => setConvForm({ ...convForm, factor: e.target.value })} placeholder="Contoh: 1000" required />
                                    <small className="text-muted">
                                        1 {units.find(u => u.id == convForm.from_unit_id)?.symbol || '...'} =
                                        {convForm.factor || '...'} {units.find(u => u.id == convForm.to_unit_id)?.symbol || '...'}
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowConvModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default UnitManagement;
