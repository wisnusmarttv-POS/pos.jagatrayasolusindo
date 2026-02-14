import { useState, useEffect, createContext, useContext, lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';

// Auth Context (includes settings cache)
const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        // Fetch settings once and cache in context
        fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => { });
        setLoading(false);
    }, []);

    const refreshSettings = () => {
        fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => { });
    };

    const login = async (username, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Login gagal');
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) return <div className="loading"><div className="loading-spinner"></div></div>;

    return (
        <AuthContext.Provider value={{ user, login, logout, settings, refreshSettings }}>
            {children}
        </AuthContext.Provider>
    );
}

// Protected Route
function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return children;
}

// Login Page
function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, settings } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Username atau password salah');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    {settings.restaurant_logo ? (
                        <img src={settings.restaurant_logo} alt="Logo" className="login-logo-img" style={{ maxHeight: '80px', marginBottom: '1rem' }} />
                    ) : (
                        <div className="login-logo-icon">🍽️</div>
                    )}
                    <div className="login-logo-text">{settings.restaurant_name || 'JAGAT POS'}</div>
                </div>
                <div className="login-title">
                    <h2>Masuk</h2>
                    <p>Silakan masuk untuk melanjutkan</p>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Memuat...' : 'Masuk'}
                    </button>
                    <div className="text-center mt-md text-muted user-select-none">
                        <small>Default: admin / admin123</small><br />
                        <small>Kasir: kasir1 / kasir123</small>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Sidebar Component
function Sidebar() {
    const { user, logout, settings } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = useMemo(() => [
        { path: '/', icon: '📊', label: 'Dashboard' },
        { path: '/pos', icon: '🛒', label: 'Kasir / POS' },
        { path: '/orders', icon: '📋', label: 'Riwayat Order' },
        { path: '/sales-report', icon: '📄', label: 'Laporan Penjualan' },
        { path: '/tables', icon: '🪑', label: 'Meja' },
    ], []);

    const masterItems = useMemo(() => [
        { path: '/menus', icon: '🍽️', label: 'Menu' },
        { path: '/menu-types', icon: '📂', label: 'Tipe Menu' },
        { path: '/units', icon: '⚖️', label: 'Satuan' },
        { path: '/discounts', icon: '🏷️', label: 'Diskon' },
    ], []);

    const settingsItems = useMemo(() => [
        { path: '/users', icon: '👥', label: 'Pengguna' },
        { path: '/settings', icon: '⚙️', label: 'Pengaturan' },
    ], []);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    {settings.restaurant_logo ? (
                        <img src={settings.restaurant_logo} alt="Logo" style={{ maxHeight: '40px', marginRight: '0.5rem' }} />
                    ) : (
                        <div className="sidebar-logo-icon">🍽️</div>
                    )}
                    <span className="sidebar-logo-text" style={settings.restaurant_name_font_size ? { fontSize: settings.restaurant_name_font_size + 'px' } : undefined}>{settings.restaurant_name || 'JAGAT POS'}</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-title">Menu Utama</div>
                    {navItems.map(item => (
                        <Link key={item.path} to={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
                            <span className="nav-item-icon">{item.icon}</span>
                            <span className="nav-item-text">{item.label}</span>
                        </Link>
                    ))}
                </div>
                <div className="nav-section">
                    <div className="nav-section-title">Master Data</div>
                    {masterItems.map(item => (
                        <Link key={item.path} to={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
                            <span className="nav-item-icon">{item.icon}</span>
                            <span className="nav-item-text">{item.label}</span>
                        </Link>
                    ))}
                </div>
                <div className="nav-section">
                    <div className="nav-section-title">Pengaturan</div>
                    {settingsItems.map(item => (
                        <Link key={item.path} to={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
                            <span className="nav-item-icon">{item.icon}</span>
                            <span className="nav-item-text">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">{user?.full_name?.charAt(0) || 'U'}</div>
                    <div className="user-details">
                        <div className="user-name">{user?.full_name}</div>
                        <div className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Kasir'}</div>
                    </div>
                </div>
                <button className="btn btn-ghost w-full mt-md" onClick={handleLogout}>Logout</button>
            </div>
        </aside>
    );
}

// Dashboard
function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch('/api/dashboard/stats').then(r => r.json()).then(setStats);
    }, []);

    const formatCurrency = useMemo(() => {
        const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
        return (val) => fmt.format(val || 0);
    }, []);

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Selamat datang di JAGAT POS</p>
            </div>
            <div className="page-content">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-icon primary">💰</div>
                        <div className="stat-card-value">{formatCurrency(stats?.today_sales)}</div>
                        <div className="stat-card-label">Penjualan Hari Ini</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon success">📋</div>
                        <div className="stat-card-value">{stats?.today_orders || 0}</div>
                        <div className="stat-card-label">Order Hari Ini</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon warning">⏳</div>
                        <div className="stat-card-value">{stats?.open_orders || 0}</div>
                        <div className="stat-card-label">Order Aktif</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon accent">🪑</div>
                        <div className="stat-card-value">{stats?.available_tables || 0} / {(stats?.available_tables || 0) + (stats?.occupied_tables || 0)}</div>
                        <div className="stat-card-label">Meja Tersedia</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Akses Cepat</h3></div>
                    <div className="card-body">
                        <div className="grid-4">
                            <Link to="/pos" className="btn btn-primary btn-lg">🛒 Buka Kasir</Link>
                            <Link to="/orders" className="btn btn-secondary btn-lg">📋 Lihat Order</Link>
                            <Link to="/menus" className="btn btn-secondary btn-lg">🍽️ Kelola Menu</Link>
                            <Link to="/tables" className="btn btn-secondary btn-lg">🪑 Kelola Meja</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Main Layout
function MainLayout({ children }) {
    const { settings } = useAuth();
    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="main-top-bar">
                    <span className="main-top-bar-name" style={settings.restaurant_name_header_font_size ? { fontSize: settings.restaurant_name_header_font_size + 'px' } : undefined}>{settings.restaurant_name_header || settings.restaurant_name || 'JAGAT POS'}</span>
                </div>
                {children}
            </main>
        </div>
    );
}

// Lazy load pages — only load when navigated to
const POS = lazy(() => import('./pages/POS.jsx'));
const MenuList = lazy(() => import('./pages/MenuList.jsx'));
const MenuTypeList = lazy(() => import('./pages/MenuTypeList.jsx'));
const TableManagement = lazy(() => import('./pages/TableManagement.jsx'));
const DiscountList = lazy(() => import('./pages/DiscountList.jsx'));
const OrderHistory = lazy(() => import('./pages/OrderHistory.jsx'));
const SalesReport = lazy(() => import('./pages/SalesReport.jsx'));
const UserList = lazy(() => import('./pages/UserList.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const UnitManagement = lazy(() => import('./pages/UnitManagement.jsx'));

const PageLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div className="loading-spinner"></div>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                        <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                        <Route path="/menus" element={<ProtectedRoute><MainLayout><MenuList /></MainLayout></ProtectedRoute>} />
                        <Route path="/menu-types" element={<ProtectedRoute><MainLayout><MenuTypeList /></MainLayout></ProtectedRoute>} />
                        <Route path="/units" element={<ProtectedRoute><MainLayout><UnitManagement /></MainLayout></ProtectedRoute>} />
                        <Route path="/tables" element={<ProtectedRoute><MainLayout><TableManagement /></MainLayout></ProtectedRoute>} />
                        <Route path="/discounts" element={<ProtectedRoute><MainLayout><DiscountList /></MainLayout></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><MainLayout><OrderHistory /></MainLayout></ProtectedRoute>} />
                        <Route path="/sales-report" element={<ProtectedRoute><MainLayout><SalesReport /></MainLayout></ProtectedRoute>} />
                        <Route path="/users" element={<ProtectedRoute><MainLayout><UserList /></MainLayout></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
