import { useState, useEffect } from 'react';
import { useAuth } from '../App';

function SalesReport() {
    const { settings } = useAuth();
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const formatCurrency = (val) => {
        const num = parseFloat(val) || 0;
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateDisplay = (dateStr) => {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/daily-sales?startDate=${startDate}&endDate=${endDate}`);
            const data = await res.json();
            setReport(data);
        } catch (err) {
            console.error('Failed to fetch report:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchReport(); }, [startDate, endDate]);

    const handlePrint = () => {
        const printContent = document.getElementById('sales-report-print');
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>Laporan Penjualan - ${startDate === endDate ? formatDateDisplay(startDate) : `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', monospace; font-size: 11px; padding: 10px; max-width: 300px; margin: 0 auto; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .bold { font-weight: bold; }
                    .separator { border-top: 1px dashed #000; margin: 6px 0; }
                    .double-sep { border-top: 2px double #000; margin: 6px 0; }
                    .row { display: flex; justify-content: space-between; padding: 1px 0; }
                    .row-indent { display: flex; justify-content: space-between; padding: 1px 0; padding-left: 10px; }
                    .header { margin-bottom: 8px; }
                    .section { margin: 4px 0; }
                    .section-title { font-weight: bold; margin: 4px 0 2px 0; }
                    table { width: 100%; border-collapse: collapse; font-size: 10px; }
                    th, td { padding: 2px 3px; text-align: left; }
                    th { border-bottom: 1px solid #000; }
                    td.right, th.right { text-align: right; }
                    .footer { margin-top: 10px; font-size: 9px; text-align: center; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 300);
    };

    const summary = report?.summary || {};
    const payments = report?.payment_breakdown || [];
    const orderTypes = report?.order_type_breakdown || [];
    const orders = report?.orders || [];

    return (
        <>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">📄 Laporan Penjualan</h1><p className="page-subtitle">Laporan harian rinci per metode pembayaran</p></div>
                <div className="flex gap-sm items-center">
                    <span className="text-muted" style={{ fontSize: '0.9rem', marginRight: '4px' }}>Dari:</span>
                    <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: 130 }} />
                    <span className="text-muted" style={{ fontSize: '0.9rem', margin: '0 4px 0 8px' }}>Sampai:</span>
                    <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: 130 }} />
                    <button className="btn btn-primary" onClick={handlePrint} disabled={!report || parseInt(summary.total_orders) === 0}>🖨️ Cetak</button>
                </div>
            </div>

            <div className="page-content">
                {loading ? (
                    <div className="text-center p-lg"><div className="loading-spinner"></div></div>
                ) : !report || parseInt(summary.total_orders) === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h3>Tidak ada transaksi</h3>
                        <p className="text-muted">Belum ada transaksi pada {startDate === endDate ? formatDateDisplay(startDate) : `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`}</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))', border: '1px solid rgba(59,130,246,0.3)' }}>
                                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Total Transaksi</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#3b82f6' }}>{summary.total_orders}</div>
                            </div>
                            <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.3)' }}>
                                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Total Pendapatan</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{formatCurrency(summary.total_revenue)}</div>
                            </div>
                            <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))', border: '1px solid rgba(249,115,22,0.3)' }}>
                                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Total Diskon</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f97316' }}>{formatCurrency(summary.total_discount)}</div>
                            </div>
                            <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))', border: '1px solid rgba(168,85,247,0.3)' }}>
                                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Pajak (PPN)</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a855f7' }}>{formatCurrency(summary.total_tax)}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            {/* Payment Method Breakdown */}
                            <div className="card">
                                <div className="card-header"><h3 className="card-title">💳 Rincian per Metode Pembayaran</h3></div>
                                <div className="card-body">
                                    <table className="data-table">
                                        <thead>
                                            <tr><th>Metode</th><th style={{ textAlign: 'center' }}>Transaksi</th><th style={{ textAlign: 'right' }}>Total</th></tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((p, i) => (
                                                <tr key={i}>
                                                    <td><strong>{p.payment_method || 'Lainnya'}</strong></td>
                                                    <td style={{ textAlign: 'center' }}><span className="badge badge-secondary">{p.count}x</span></td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.total)}</td>
                                                </tr>
                                            ))}
                                            <tr style={{ borderTop: '2px solid var(--border-primary)', fontWeight: 700 }}>
                                                <td>TOTAL</td>
                                                <td style={{ textAlign: 'center' }}>{summary.total_orders}x</td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(summary.total_revenue)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Order Type Breakdown */}
                            <div className="card">
                                <div className="card-header"><h3 className="card-title">🍽️ Rincian per Tipe Order</h3></div>
                                <div className="card-body">
                                    <table className="data-table">
                                        <thead>
                                            <tr><th>Tipe</th><th style={{ textAlign: 'center' }}>Transaksi</th><th style={{ textAlign: 'right' }}>Total</th></tr>
                                        </thead>
                                        <tbody>
                                            {orderTypes.map((ot, i) => (
                                                <tr key={i}>
                                                    <td><strong>{ot.order_type === 'dine_in' ? '🪑 Dine In' : '🛍️ Take Away'}</strong></td>
                                                    <td style={{ textAlign: 'center' }}><span className="badge badge-secondary">{ot.count}x</span></td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(ot.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Orders Detail Table */}
                        <div className="card">
                            <div className="card-header"><h3 className="card-title">📋 Detail Transaksi ({orders.length} order)</h3></div>
                            <div className="card-body" style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>No. Order</th>
                                            <th>Jam</th>
                                            <th>Tipe</th>
                                            <th>Meja/Customer</th>
                                            <th>Kasir</th>
                                            <th>Pembayaran</th>
                                            <th style={{ textAlign: 'right' }}>Subtotal</th>
                                            <th style={{ textAlign: 'right' }}>Diskon</th>
                                            <th style={{ textAlign: 'right' }}>Pajak</th>
                                            <th style={{ textAlign: 'right' }}>Grand Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((o, i) => (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td><code>{o.order_number}</code></td>
                                                <td>{formatTime(o.order_date)}</td>
                                                <td><span className={`badge ${o.order_type === 'dine_in' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.7em' }}>{o.order_type === 'dine_in' ? 'Dine In' : 'Take Away'}</span></td>
                                                <td>{o.order_type === 'dine_in' ? (o.table_number ? `Meja ${o.table_number}` : '-') : (o.customer_name || '-')}</td>
                                                <td>{o.cashier_name || '-'}</td>
                                                <td><span className="badge badge-secondary" style={{ fontSize: '0.7em' }}>{o.payment_method || '-'}</span></td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(o.subtotal)}</td>
                                                <td style={{ textAlign: 'right', color: parseFloat(o.discount_amount) > 0 ? '#ef4444' : undefined }}>{parseFloat(o.discount_amount) > 0 ? `-${formatCurrency(o.discount_amount)}` : '-'}</td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(o.tax_amount)}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(o.grand_total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Hidden print content */}
            <div id="sales-report-print" style={{ display: 'none' }}>
                <div className="header text-center">
                    <div className="bold" style={{ fontSize: '14px' }}>{settings.restaurant_name || 'JAGAT POS'}</div>
                    <div>{settings.restaurant_address || ''}</div>
                    <div>{settings.restaurant_phone ? `Telp: ${settings.restaurant_phone}` : ''}</div>
                    <div className="separator"></div>
                    <div className="bold" style={{ fontSize: '13px' }}>LAPORAN PENJUALAN HARIAN</div>
                    <div>{startDate === endDate ? formatDateDisplay(startDate) : `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`}</div>
                    <div className="double-sep"></div>
                </div>

                <div className="section">
                    <div className="section-title">RINGKASAN</div>
                    <div className="separator"></div>
                    <div className="row"><span>Total Transaksi</span><span className="bold">{summary.total_orders || 0} order</span></div>
                    <div className="row"><span>Sub Total</span><span>{formatCurrency(summary.total_subtotal)}</span></div>
                    <div className="row"><span>Diskon</span><span>-{formatCurrency(summary.total_discount)}</span></div>
                    <div className="row"><span>Pajak (PPN)</span><span>{formatCurrency(summary.total_tax)}</span></div>
                    <div className="row"><span>Service Charge</span><span>{formatCurrency(summary.total_service)}</span></div>
                    <div className="double-sep"></div>
                    <div className="row"><span className="bold">TOTAL PENDAPATAN</span><span className="bold" style={{ fontSize: '13px' }}>{formatCurrency(summary.total_revenue)}</span></div>
                    <div className="double-sep"></div>
                </div>

                <div className="section">
                    <div className="section-title">RINCIAN PER PEMBAYARAN</div>
                    <div className="separator"></div>
                    {payments.map((p, i) => (
                        <div className="row" key={i}>
                            <span>{p.payment_method || 'Lainnya'} ({p.count}x)</span>
                            <span>{formatCurrency(p.total)}</span>
                        </div>
                    ))}
                    <div className="separator"></div>
                </div>

                <div className="section">
                    <div className="section-title">RINCIAN PER TIPE ORDER</div>
                    <div className="separator"></div>
                    {orderTypes.map((ot, i) => (
                        <div className="row" key={i}>
                            <span>{ot.order_type === 'dine_in' ? 'Dine In' : 'Take Away'} ({ot.count}x)</span>
                            <span>{formatCurrency(ot.total)}</span>
                        </div>
                    ))}
                    <div className="separator"></div>
                </div>

                <div className="section">
                    <div className="section-title">DETAIL TRANSAKSI</div>
                    <div className="separator"></div>
                    <table>
                        <thead>
                            <tr><th>No</th><th>Order</th><th>Bayar</th><th className="right">Total</th></tr>
                        </thead>
                        <tbody>
                            {orders.map((o, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{o.order_number}<br /><span style={{ fontSize: '9px' }}>{formatTime(o.order_date)}</span></td>
                                    <td>{o.payment_method || '-'}</td>
                                    <td className="right">{formatCurrency(o.grand_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="separator"></div>
                </div>

                <div className="footer">
                    <div>Dicetak: {new Date().toLocaleString('id-ID')}</div>
                    <div>Powered by JAGAT POS</div>
                </div>
            </div>
        </>
    );
}

export default SalesReport;
