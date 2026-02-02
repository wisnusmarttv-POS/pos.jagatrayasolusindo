import { useState, useEffect } from 'react';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filter, setFilter] = useState({ status: '', date: '' });

    useEffect(() => { fetchData(); }, [filter]);

    const fetchData = async () => {
        const params = new URLSearchParams();
        if (filter.status) params.append('status', filter.status);
        if (filter.date) params.append('date', filter.date);
        const res = await fetch(`/api/orders?${params}`);
        setOrders(await res.json());
    };

    const viewDetail = async (orderId) => {
        const res = await fetch(`/api/orders/${orderId}`);
        setSelectedOrder(await res.json());
    };

    const cancelOrder = async (id) => {
        if (!confirm('Yakin batalkan order ini?')) return;
        await fetch(`/api/orders/${id}/cancel`, { method: 'POST' });
        fetchData();
    };

    const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
    const formatDate = (d) => new Date(d).toLocaleString('id-ID');

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Riwayat Order</h1>
                <p className="page-subtitle">Lihat semua transaksi</p>
            </div>
            <div className="page-content">
                <div className="card mb-lg">
                    <div className="card-body">
                        <div className="flex gap-md items-center">
                            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                                <input type="date" className="form-input" value={filter.date} onChange={e => setFilter({ ...filter, date: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                                <select className="form-input form-select" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
                                    <option value="">Semua Status</option>
                                    <option value="open">Open</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <button className="btn btn-secondary" onClick={() => setFilter({ status: '', date: '' })}>Reset</button>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead><tr><th>No. Order</th><th>Waktu</th><th>Meja</th><th>Customer</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td><code>{o.order_number}</code></td>
                                        <td>{formatDate(o.order_date)}</td>
                                        <td>{o.table_number || '-'}</td>
                                        <td>{o.customer_name || '-'}</td>
                                        <td><strong>{formatCurrency(o.grand_total)}</strong></td>
                                        <td><span className={`badge ${o.status === 'paid' ? 'badge-success' : o.status === 'open' ? 'badge-warning' : 'badge-danger'}`}>{o.status === 'paid' ? 'Lunas' : o.status === 'open' ? 'Open' : 'Batal'}</span></td>
                                        <td>
                                            <div className="flex gap-sm">
                                                <button className="btn btn-sm btn-secondary" onClick={() => viewDetail(o.id)}>Detail</button>
                                                {o.status === 'open' && <button className="btn btn-sm btn-danger" onClick={() => cancelOrder(o.id)}>Batal</button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal modal-lg">
                        <div className="modal-header">
                            <h3 className="modal-title">Detail Order #{selectedOrder.order_number}</h3>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="grid-2 mb-lg">
                                <div><p className="text-muted">Waktu</p><p><strong>{formatDate(selectedOrder.order_date)}</strong></p></div>
                                <div><p className="text-muted">Meja</p><p><strong>{selectedOrder.table_number || 'Take Away'}</strong></p></div>
                                <div><p className="text-muted">Kasir</p><p><strong>{selectedOrder.cashier_name || '-'}</strong></p></div>
                                <div><p className="text-muted">Pembayaran</p><p><strong>{selectedOrder.payment_method_name || '-'}</strong></p></div>
                            </div>
                            <table className="data-table mb-lg">
                                <thead><tr><th>Menu</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>
                                <tbody>
                                    {selectedOrder.items?.map(i => (
                                        <tr key={i.id}><td>{i.menu_name}</td><td>{i.quantity}</td><td>{formatCurrency(i.unit_price)}</td><td>{formatCurrency(i.subtotal)}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="cart-summary">
                                <div className="cart-summary-row"><span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                                {parseFloat(selectedOrder.discount_amount) > 0 && <div className="cart-summary-row text-success"><span>Diskon</span><span>-{formatCurrency(selectedOrder.discount_amount)}</span></div>}
                                {parseFloat(selectedOrder.service_charge) > 0 && <div className="cart-summary-row"><span>Service</span><span>{formatCurrency(selectedOrder.service_charge)}</span></div>}
                                <div className="cart-summary-row"><span>PB1 ({selectedOrder.tax_rate}%)</span><span>{formatCurrency(selectedOrder.tax_amount)}</span></div>
                                <div className="cart-summary-row total"><span>Total</span><span className="value">{formatCurrency(selectedOrder.grand_total)}</span></div>
                                {selectedOrder.status === 'paid' && <>
                                    <div className="cart-summary-row"><span>Dibayar</span><span>{formatCurrency(selectedOrder.payment_amount)}</span></div>
                                    <div className="cart-summary-row"><span>Kembalian</span><span>{formatCurrency(selectedOrder.change_amount)}</span></div>
                                </>}
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Tutup</button></div>
                    </div>
                </div>
            )}
        </>
    );
}

export default OrderHistory;
