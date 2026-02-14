import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';

// Memoized formatter — created once, reused forever
const currencyFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

function POS() {
    const { settings: ctxSettings, user } = useAuth();
    const [menuTypes, setMenuTypes] = useState([]);
    const [menus, setMenus] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [cart, setCart] = useState([]);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [orderType, setOrderType] = useState('dine_in');
    const [customerName, setCustomerName] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [currentFloor, setCurrentFloor] = useState(1);

    // Use settings from AuthContext (already cached, no extra fetch)
    const settings = ctxSettings;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = useCallback(async () => {
        const [typesRes, menusRes, tablesRes, pmRes, discRes] = await Promise.all([
            fetch('/api/menu-types'), fetch('/api/menus?available=true'), fetch('/api/tables'),
            fetch('/api/payment-methods'), fetch('/api/discounts')
        ]);
        setMenuTypes(await typesRes.json());
        setMenus(await menusRes.json());
        setTables(await tablesRes.json());
        setPaymentMethods(await pmRes.json());
        setDiscounts(await discRes.json());
    }, []);

    const filteredMenus = useMemo(() =>
        selectedType ? menus.filter(m => m.menu_type_id === selectedType) : menus,
        [menus, selectedType]
    );

    const addToCart = useCallback((menu) => {
        if (!menu.is_available) return;
        let effectivePrice = parseFloat(menu.price);
        if (menu.is_promo && menu.promo_price) {
            effectivePrice = parseFloat(menu.promo_price);
        } else if (parseFloat(menu.discount_percent) > 0) {
            effectivePrice = effectivePrice * (1 - parseFloat(menu.discount_percent) / 100);
        }
        setCart(prev => {
            const existing = prev.find(c => c.menu_id === menu.id);
            if (existing) {
                return prev.map(c => c.menu_id === menu.id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { menu_id: menu.id, menu_name: menu.name, unit_price: effectivePrice, quantity: 1 }];
        });
    }, []);

    const updateQty = useCallback((menuId, delta) => {
        setCart(prev => prev.map(c => {
            if (c.menu_id === menuId) {
                const newQty = c.quantity + delta;
                return newQty > 0 ? { ...c, quantity: newQty } : null;
            }
            return c;
        }).filter(Boolean));
    }, []);

    const removeItem = useCallback((menuId) => setCart(prev => prev.filter(c => c.menu_id !== menuId)), []);

    // Memoize all calculations
    const { subtotal, taxRate, serviceRate, discountAmount, afterDiscount, serviceCharge, taxAmount, grandTotal, changeAmount } = useMemo(() => {
        const sub = cart.reduce((sum, c) => sum + c.unit_price * c.quantity, 0);
        const tr = parseFloat(settings.tax_rate) || 11;
        const sr = settings.enable_service_charge === 'true' ? (parseFloat(settings.service_charge_rate) || 0) : 0;

        let da = 0;
        if (selectedDiscount) {
            const disc = discounts.find(d => d.id === selectedDiscount);
            if (disc && sub >= parseFloat(disc.min_order)) {
                if (disc.type === 'percentage') {
                    da = sub * (parseFloat(disc.value) / 100);
                    if (disc.max_discount && da > parseFloat(disc.max_discount)) da = parseFloat(disc.max_discount);
                } else {
                    da = parseFloat(disc.value);
                }
            }
        }

        const ad = sub - da;
        const sc = ad * (sr / 100);
        const ta = (ad + sc) * (tr / 100);
        const gt = ad + sc + ta;
        const ca = parseFloat(paymentAmount || 0) - gt;

        return { subtotal: sub, taxRate: tr, serviceRate: sr, discountAmount: da, afterDiscount: ad, serviceCharge: sc, taxAmount: ta, grandTotal: gt, changeAmount: ca };
    }, [cart, settings, selectedDiscount, discounts, paymentAmount]);

    const handleNewOrder = async () => {
        if (cart.length === 0) return alert('Keranjang kosong!');
        if (orderType === 'dine_in' && !selectedTable) return alert('Pilih meja!');
        setLoading(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table_id: selectedTable, customer_name: customerName, order_type: orderType,
                    items: cart, user_id: user.id
                })
            });
            if (!res.ok) throw new Error('Gagal membuat order');
            const order = await res.json();
            setShowPayment(true);
            window.currentOrderId = order.id;
        } catch (err) {
            alert(err.message);
        }
        setLoading(false);
    };

    const handlePayment = async () => {
        if (!selectedPayment) return alert('Pilih metode pembayaran!');
        if (parseFloat(paymentAmount || 0) < grandTotal) return alert('Jumlah bayar kurang!');
        setLoading(true);
        try {
            const res = await fetch(`/api/orders/${window.currentOrderId}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_method_id: selectedPayment, payment_amount: parseFloat(paymentAmount),
                    discount_id: selectedDiscount
                })
            });
            if (!res.ok) throw new Error('Gagal memproses pembayaran');
            alert(`Pembayaran berhasil!\nKembalian: ${formatCurrency(changeAmount)}`);
            resetOrder();
            fetchData();
        } catch (err) {
            alert(err.message);
        }
        setLoading(false);
    };

    const resetOrder = () => {
        setCart([]); setSelectedTable(null); setCustomerName(''); setSelectedDiscount(null);
        setSelectedPayment(null); setPaymentAmount(''); setShowPayment(false);
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        {settings.restaurant_logo ? (
                            <img src={settings.restaurant_logo} alt="Logo" style={{ height: 40, width: 40, objectFit: 'contain', marginRight: 10 }} />
                        ) : (
                            <div className="sidebar-logo-icon">🍽️</div>
                        )}
                        <span className="sidebar-logo-text">{settings.restaurant_name || 'JAGAT POS'}</span>
                    </div>
                </div>
                <div style={{ padding: '1rem' }}>
                    <Link to="/" className="btn btn-secondary w-full">← Kembali</Link>
                </div>
            </aside>

            <div className="pos-layout">
                <div className="pos-menu-section">
                    <div className="menu-categories">
                        <button className={`category-btn ${!selectedType ? 'active' : ''}`} onClick={() => setSelectedType(null)}>
                            📋 Semua
                        </button>
                        {menuTypes.map(t => (
                            <button key={t.id} className={`category-btn ${selectedType === t.id ? 'active' : ''}`} onClick={() => setSelectedType(t.id)}>
                                {t.icon} {t.name}
                            </button>
                        ))}
                    </div>
                    <div className="menu-grid">
                        {filteredMenus.map(menu => (
                            <div key={menu.id} className={`menu-item-card ${!menu.is_available ? 'unavailable' : ''}`} onClick={() => addToCart(menu)} style={{ position: 'relative' }}>
                                {menu.is_promo && <div style={{ position: 'absolute', top: 8, right: 8, background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: '0.7em', fontWeight: 700, zIndex: 1 }}>🔥 PROMO</div>}
                                {!menu.is_promo && parseFloat(menu.discount_percent) > 0 && <div style={{ position: 'absolute', top: 8, right: 8, background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: '0.7em', fontWeight: 700, zIndex: 1 }}>-{menu.discount_percent}%</div>}
                                <div className="menu-item-image">
                                    {menu.image_url ? <img src={menu.image_url} alt={menu.name} /> : '🍽️'}
                                </div>
                                <div className="menu-item-info">
                                    <div className="menu-item-name">{menu.name}</div>
                                    <div className="menu-item-price">
                                        {(() => {
                                            const dp = parseFloat(menu.discount_percent) || 0;
                                            if (menu.is_promo && menu.promo_price) {
                                                return <><span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.8em', marginRight: 6 }}>{formatCurrency(menu.price)}</span>{formatCurrency(menu.promo_price)}</>;
                                            } else if (dp > 0) {
                                                const discounted = parseFloat(menu.price) * (1 - dp / 100);
                                                return <><span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.8em', marginRight: 6 }}>{formatCurrency(menu.price)}</span>{formatCurrency(discounted)}</>;
                                            }
                                            return formatCurrency(menu.price);
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pos-cart-section">
                    <div className="pos-cart-header">
                        <h3>Keranjang</h3>
                        <div className="flex gap-sm mt-md">
                            <button className={`btn btn-sm ${orderType === 'dine_in' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setOrderType('dine_in')}>Dine In</button>
                            <button className={`btn btn-sm ${orderType === 'takeaway' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setOrderType('takeaway')}>Take Away</button>
                        </div>
                        {orderType === 'dine_in' && (
                            <>
                                <button className="btn btn-secondary w-full mt-md" onClick={() => setShowTableModal(true)}>
                                    {selectedTable ? `Meja ${tables.find(t => t.id === selectedTable)?.table_number}` : '📍 Pilih Meja (Denah)'}
                                </button>
                            </>
                        )}
                        {orderType === 'takeaway' && (
                            <input type="text" className="form-input mt-md" placeholder="Nama Customer" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                        )}
                    </div>

                    <div className="pos-cart-items">
                        {cart.length === 0 ? (
                            <div className="cart-empty">
                                <div className="cart-empty-icon">🛒</div>
                                <p>Keranjang kosong</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.menu_id} className="cart-item">
                                    <div className="cart-item-info">
                                        <div className="cart-item-name">{item.menu_name}</div>
                                        <div className="cart-item-price">{formatCurrency(item.unit_price)}</div>
                                    </div>
                                    <div className="cart-item-actions">
                                        <button className="qty-btn" onClick={() => updateQty(item.menu_id, -1)}>−</button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => updateQty(item.menu_id, 1)}>+</button>
                                    </div>
                                    <div className="cart-item-subtotal">{formatCurrency(item.unit_price * item.quantity)}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pos-cart-footer">
                        <div className="cart-summary">
                            <div className="cart-summary-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                            {discountAmount > 0 && <div className="cart-summary-row text-success"><span>Diskon</span><span>-{formatCurrency(discountAmount)}</span></div>}
                            {serviceCharge > 0 && <div className="cart-summary-row"><span>Service ({serviceRate}%)</span><span>{formatCurrency(serviceCharge)}</span></div>}
                            <div className="cart-summary-row"><span>PB1 ({taxRate}%)</span><span>{formatCurrency(taxAmount)}</span></div>
                            <div className="cart-summary-row total"><span>Total</span><span className="value">{formatCurrency(grandTotal)}</span></div>
                        </div>
                        <button className="btn btn-success btn-lg w-full" onClick={handleNewOrder} disabled={loading || cart.length === 0}>
                            {loading ? 'Memproses...' : '💳 Proses Pembayaran'}
                        </button>
                        {cart.length > 0 && <button className="btn btn-ghost w-full mt-md" onClick={resetOrder}>Batal</button>}
                    </div>
                </div>
            </div>

            {showPayment && (
                <div className="modal-overlay">
                    <div className="modal modal-lg">
                        <div className="modal-header">
                            <h3 className="modal-title">💳 Pembayaran</h3>
                            <button className="modal-close" onClick={() => setShowPayment(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Diskon (Opsional)</label>
                                <select className="form-input form-select" value={selectedDiscount || ''} onChange={e => setSelectedDiscount(e.target.value ? parseInt(e.target.value) : null)}>
                                    <option value="">-- Tanpa Diskon --</option>
                                    {discounts.filter(d => subtotal >= parseFloat(d.min_order)).map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.type === 'percentage' ? `${d.value}%` : formatCurrency(d.value)})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="cart-summary mb-lg">
                                <div className="cart-summary-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                {discountAmount > 0 && <div className="cart-summary-row text-success"><span>Diskon</span><span>-{formatCurrency(discountAmount)}</span></div>}
                                {serviceCharge > 0 && <div className="cart-summary-row"><span>Service</span><span>{formatCurrency(serviceCharge)}</span></div>}
                                <div className="cart-summary-row"><span>PB1</span><span>{formatCurrency(taxAmount)}</span></div>
                                <div className="cart-summary-row total"><span>TOTAL</span><span className="value">{formatCurrency(grandTotal)}</span></div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Metode Pembayaran</label>
                                <div className="payment-grid">
                                    {paymentMethods.map(pm => (
                                        <button key={pm.id} className={`payment-method-btn ${selectedPayment === pm.id ? 'active' : ''}`} onClick={() => setSelectedPayment(pm.id)}>{pm.name}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Jumlah Bayar</label>
                                <input type="number" className="form-input" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0" style={{ fontSize: '1.5rem', fontWeight: '700' }} />
                                <div className="quick-amount-grid">
                                    {[grandTotal, Math.ceil(grandTotal / 1000) * 1000, Math.ceil(grandTotal / 10000) * 10000, Math.ceil(grandTotal / 50000) * 50000, 100000, 200000].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6).map(amt => (
                                        <button key={amt} className="quick-amount-btn" onClick={() => setPaymentAmount(amt.toString())}>{formatCurrency(amt)}</button>
                                    ))}
                                </div>
                            </div>
                            {parseFloat(paymentAmount || 0) >= grandTotal && (
                                <div className="cart-summary-row total" style={{ background: 'var(--success-500)', color: 'white', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}>
                                    <span>Kembalian</span><span>{formatCurrency(changeAmount)}</span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPayment(false)}>Batal</button>
                            <button className="btn btn-success btn-lg" onClick={handlePayment} disabled={loading}>
                                {loading ? 'Memproses...' : 'Bayar Sekarang'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTableModal && (() => {
                const floorTables = tables.filter(t => t.is_active && (t.floor || 1) === currentFloor);
                const tableSize = 110;
                const padding = 20;
                const maxX = floorTables.reduce((max, t) => Math.max(max, (t.position_x || 0) + tableSize + padding), 400);
                const maxY = floorTables.reduce((max, t) => Math.max(max, (t.position_y || 0) + tableSize + padding), 400);
                return (
                    <div className="modal-overlay">
                        <div className="modal modal-lg" style={{ width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh', margin: 0, borderRadius: 0, display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header">
                                <h3 className="modal-title">Pilih Meja</h3>
                                <button className="modal-close" onClick={() => setShowTableModal(false)}>✕</button>
                            </div>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                <div className="flex gap-md mb-md justify-center" style={{ flexShrink: 0 }}>
                                    <button className={`btn btn-sm ${currentFloor === 1 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCurrentFloor(1)}>Lantai 1</button>
                                    <button className={`btn btn-sm ${currentFloor === 2 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCurrentFloor(2)}>Lantai 2</button>
                                </div>
                                <div style={{
                                    flex: 1,
                                    background: 'var(--bg-tertiary)',
                                    border: '1px dashed var(--border-primary)',
                                    borderRadius: '1rem',
                                    overflow: 'auto',
                                    minHeight: 0
                                }}>
                                    <div style={{
                                        position: 'relative',
                                        minWidth: maxX,
                                        minHeight: maxY,
                                        width: '100%',
                                        height: '100%'
                                    }}>
                                        {floorTables.map(t => (
                                            <div
                                                key={t.id}
                                                className={`table-card ${t.status}`}
                                                style={{
                                                    position: 'absolute',
                                                    left: t.position_x || 0,
                                                    top: t.position_y || 0,
                                                    width: tableSize,
                                                    height: tableSize,
                                                    cursor: t.status === 'occupied' ? 'not-allowed' : 'pointer',
                                                    border: selectedTable === t.id ? '3px solid var(--primary-500)' : ''
                                                }}
                                                onClick={() => {
                                                    if (t.status !== 'occupied') {
                                                        setSelectedTable(t.id);
                                                        setShowTableModal(false);
                                                    }
                                                }}
                                            >
                                                <div className="table-number" style={{ fontSize: '1.3rem' }}>{t.table_number}</div>
                                                <div className="table-capacity">👥 {t.capacity}</div>
                                                <span className={`table-status badge ${t.status === 'available' ? 'badge-success' : t.status === 'occupied' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                                                    {t.status === 'available' ? 'Kosong' : t.status === 'occupied' ? 'Terisi' : 'Reserved'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </>
    );
}

export default POS;
