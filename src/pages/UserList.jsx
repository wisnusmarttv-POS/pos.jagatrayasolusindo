import { useState, useEffect } from 'react';

function UserList() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'cashier' });

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => { const res = await fetch('/api/users'); setUsers(await res.json()); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editItem && !form.password) return alert('Password wajib diisi!');
        const url = editItem ? `/api/users/${editItem.id}` : '/api/users';
        const method = editItem ? 'PUT' : 'POST';
        const body = { ...form };
        if (editItem && !form.password) delete body.password;
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        setShowModal(false); setEditItem(null); fetchData();
    };

    const handleEdit = (item) => { setEditItem(item); setForm({ username: item.username, password: '', full_name: item.full_name, role: item.role, is_active: item.is_active }); setShowModal(true); };

    return (
        <>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Pengguna</h1><p className="page-subtitle">Kelola akun kasir dan admin</p></div>
                <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ username: '', password: '', full_name: '', role: 'cashier' }); setShowModal(true); }}>+ Tambah User</button>
            </div>
            <div className="page-content">
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead><tr><th>Username</th><th>Nama Lengkap</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td><strong>{u.username}</strong></td>
                                        <td>{u.full_name}</td>
                                        <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>{u.role === 'admin' ? 'Administrator' : 'Kasir'}</span></td>
                                        <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                                        <td><button className="btn btn-sm btn-secondary" onClick={() => handleEdit(u)}>Edit</button></td>
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
                        <div className="modal-header"><h3 className="modal-title">{editItem ? 'Edit' : 'Tambah'} User</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Username *</label><input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required /></div>
                                <div className="form-group"><label className="form-label">Password {editItem ? '(kosongkan jika tidak diubah)' : '*'}</label><input type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Nama Lengkap</label><input className="form-input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Role</label><select className="form-input form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="cashier">Kasir</option><option value="admin">Administrator</option></select></div>
                                {editItem && <div className="form-group"><label className="form-label">Status</label><select className="form-input form-select" value={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}><option value="true">Aktif</option><option value="false">Nonaktif</option></select></div>}
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default UserList;
