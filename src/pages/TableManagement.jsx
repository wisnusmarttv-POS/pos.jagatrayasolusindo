import { useState, useEffect, useRef } from 'react';

function TableManagement() {
    const [tables, setTables] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ table_number: '', capacity: 4, location: 'Indoor', floor: 1 });
    const [currentFloor, setCurrentFloor] = useState(1);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragItem, setDragItem] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hasChanges, setHasChanges] = useState(false);
    const [originalTables, setOriginalTables] = useState([]);


    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        const res = await fetch('/api/tables/all');
        const data = await res.json();
        setTables(data);
        setOriginalTables(JSON.parse(JSON.stringify(data)));
        setHasChanges(false);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editItem ? `/api/tables/${editItem.id}` : '/api/tables';
        const method = editItem ? 'PUT' : 'POST';

        const body = {
            ...form,
            is_active: editItem ? (editItem.is_active !== undefined ? editItem.is_active : true) : true
        };

        if (!editItem) {
            body.position_x = body.position_x || 50;
            body.position_y = body.position_y || 50;
        }

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        setShowModal(false);
        setEditItem(null);
        fetchData();
    };


    const handleEdit = (item) => {
        setEditItem(item);
        setForm({
            table_number: item.table_number,
            capacity: item.capacity,
            location: item.location || 'Indoor',
            floor: item.floor || 1,
            status: item.status,
            position_x: item.position_x,
            position_y: item.position_y
        });

        setShowModal(true);
    };

    const handleDelete = async (id) => { if (!confirm('Yakin hapus?')) return; await fetch(`/api/tables/${id}`, { method: 'DELETE' }); fetchData(); };

    const setStatus = async (item, status) => {
        const body = {
            ...item,
            status,
            is_active: item.is_active !== undefined ? item.is_active : true
        };
        await fetch(`/api/tables/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        fetchData();
    };


    const handleMouseDown = (e, table) => {
        e.stopPropagation(); // Prevent triggering click on card
        setIsDragging(true);
        setDragItem(table);
        // Calculate offset from mouse to element top-left
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !dragItem || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const x = Math.round(e.clientX - containerRect.left - dragOffset.x);
        const y = Math.round(e.clientY - containerRect.top - dragOffset.y);


        // Update local state for immediate feedback
        setTables(tables.map(t => {
            if (t.id === dragItem.id) {
                return { ...t, position_x: x, position_y: y };
            }
            return t;
        }));
        setHasChanges(true);
    };


    const handleMouseUp = () => {
        setIsDragging(false);
        setDragItem(null);
    };

    const handleSavePositions = async () => {
        try {
            const res = await fetch('/api/tables/bulk-update-positions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tables })
            });
            if (!res.ok) throw new Error('Server error');
            alert('Posisi meja berhasil disimpan');
            setOriginalTables(JSON.parse(JSON.stringify(tables)));
            setHasChanges(false);
        } catch (err) {
            alert('Gagal menyimpan posisi: ' + err.message);
        }
    };



    const filteredTables = tables.filter(t => t.is_active && (t.floor || 1) === currentFloor);

    return (
        <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} style={{ height: '100%' }}>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Manajemen Meja</h1><p className="page-subtitle">Atur posisi meja (Drag & Drop)</p></div>
                <div className="flex gap-md">
                    {hasChanges && (
                        <button className="btn btn-success" onClick={handleSavePositions} style={{ padding: '8px 24px', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 0 15px var(--success-color)' }}>
                            💾 SIMPAN POSISI MEJA
                        </button>
                    )}
                    <div className="flex bg-tertiary rounded-lg p-1" style={{ background: 'var(--bg-tertiary)', padding: 4, borderRadius: 8 }}>
                        <button className={`btn btn-sm ${currentFloor === 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { if (hasChanges && !confirm('Ada perubahan yang belum disimpan. Pindah lantai anyway?')) return; setCurrentFloor(1); }}>Lantai 1</button>
                        <button className={`btn btn-sm ${currentFloor === 2 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { if (hasChanges && !confirm('Ada perubahan yang belum disimpan. Pindah lantai anyway?')) return; setCurrentFloor(2); }}>Lantai 2</button>
                    </div>

                    <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ table_number: '', capacity: 4, location: 'Indoor', floor: currentFloor }); setShowModal(true); }}>+ Tambah Meja</button>
                </div>

            </div>

            <div className="page-content" style={{ height: 'calc(100vh - 180px)', overflow: 'hidden' }}>
                <div
                    ref={containerRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        background: 'var(--bg-card)',
                        border: '1px dashed var(--border-primary)',
                        borderRadius: '1rem',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: 10, left: 10, opacity: 0.5, pointerEvents: 'none' }}>
                        <h3>Lantai {currentFloor}</h3>
                        <p>Geser meja untuk mengatur posisi</p>
                    </div>

                    {filteredTables.map(t => (
                        <div
                            key={t.id}
                            className={`table-card ${t.status}`}
                            style={{
                                position: 'absolute',
                                left: t.position_x || 0,
                                top: t.position_y || 0,
                                width: 140,
                                height: 140,
                                cursor: isDragging ? 'grabbing' : 'grab',
                                zIndex: dragItem?.id === t.id ? 10 : 1,
                                boxShadow: dragItem?.id === t.id ? '0 10px 25px rgba(0,0,0,0.5)' : '',
                                border: (originalTables.find(ot => ot.id === t.id)?.position_x !== t.position_x ||
                                    originalTables.find(ot => ot.id === t.id)?.position_y !== t.position_y)
                                    ? '2px solid var(--success-color)' : '1px solid var(--border-primary)'
                            }}

                            onMouseDown={(e) => handleMouseDown(e, t)}
                        >
                            <div className="flex justify-between w-full" style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t.location}</span>
                                <button
                                    className="btn-icon"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        background: 'var(--primary-color)',
                                        border: '2px solid white',
                                        color: 'white',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                                    }}
                                    onClick={(e) => { e.stopPropagation(); handleEdit(t); }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    title="Edit Meja"
                                >
                                    ✎
                                </button>
                            </div>
                            <div
                                className="table-number"
                                style={{ fontSize: '2.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                                onClick={(e) => { e.stopPropagation(); handleEdit(t); }}
                            >
                                {t.table_number}
                            </div>


                            <div className="table-capacity">👥 {t.capacity} org</div>

                            <div className="flex gap-sm mt-md">
                                <button className="btn btn-sm btn-success" style={{ padding: '2px 8px' }} onClick={e => { e.stopPropagation(); setStatus(t, 'available'); }} title="Available">✓</button>
                                <button className="btn btn-sm btn-warning" style={{ padding: '2px 8px' }} onClick={e => { e.stopPropagation(); setStatus(t, 'reserved'); }} title="Reserved">R</button>
                                <button className="btn btn-sm btn-danger" style={{ padding: '2px 8px' }} onClick={e => { e.stopPropagation(); setStatus(t, 'occupied'); }} title="Occupied">X</button>
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
                                <div className="grid-2">
                                    <div className="form-group"><label className="form-label">Nomor Meja *</label><input className="form-input" value={form.table_number} onChange={e => setForm({ ...form, table_number: e.target.value })} required /></div>
                                    <div className="form-group"><label className="form-label">Lantai</label><select className="form-input form-select" value={form.floor} onChange={e => setForm({ ...form, floor: parseInt(e.target.value) })}><option value="1">Lantai 1</option><option value="2">Lantai 2</option></select></div>
                                </div>
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
        </div>
    );
}

export default TableManagement;
