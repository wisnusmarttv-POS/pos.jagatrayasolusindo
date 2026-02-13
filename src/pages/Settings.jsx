import { useState, useEffect } from 'react';

function Settings() {
    const [settings, setSettings] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => { const res = await fetch('/api/settings'); setSettings(await res.json()); };

    const handleSave = async () => {
        setSaving(true);
        await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
        setSaving(false);
        alert('Pengaturan berhasil disimpan!');
    };

    const updateSetting = (key, value) => setSettings({ ...settings, [key]: value });

    return (
        <>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Pengaturan</h1><p className="page-subtitle">Konfigurasi sistem POS</p></div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</button>
            </div>
            <div className="page-content">
                <div className="grid-2">
                    <div className="card">
                        <div className="card-header"><h3 className="card-title">🏪 Informasi Restoran</h3></div>
                        <div className="card-body">
                            <div className="form-group"><label className="form-label">Nama Restoran</label><input className="form-input" value={settings.restaurant_name || ''} onChange={e => updateSetting('restaurant_name', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Footer Struk</label><textarea className="form-input form-textarea" value={settings.receipt_footer || ''} onChange={e => updateSetting('receipt_footer', e.target.value)} /></div>

                            <div className="form-group mt-md">
                                <label className="form-label">Logo Restoran</label>
                                <div className="flex items-center gap-md">
                                    {settings.restaurant_logo && (
                                        <div className="logo-preview mb-sm">
                                            <img src={settings.restaurant_logo} alt="Logo" style={{ maxHeight: '80px', maxWidth: '100%' }} />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="form-input"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append('logo', file);

                                            try {
                                                const res = await fetch('/api/settings/logo', {
                                                    method: 'POST',
                                                    body: formData
                                                });
                                                if (!res.ok) throw new Error('Gagal upload logo');
                                                const data = await res.json();
                                                updateSetting('restaurant_logo', data.logo_url);
                                                alert('Logo berhasil diupload!');
                                            } catch (err) {
                                                alert(err.message);
                                            }
                                        }}
                                    />
                                </div>
                                <small className="text-muted">Format: JPG, PNG. Maks: 2MB.</small>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header"><h3 className="card-title">💰 Pajak & Biaya</h3></div>
                        <div className="card-body">
                            <div className="form-group"><label className="form-label">PB1 / Pajak Restoran (%)</label><input type="number" className="form-input" value={settings.tax_rate || ''} onChange={e => updateSetting('tax_rate', e.target.value)} /><small className="text-muted">Default: 11%</small></div>
                            <div className="form-group"><label className="form-label">Service Charge (%)</label><input type="number" className="form-input" value={settings.service_charge_rate || ''} onChange={e => updateSetting('service_charge_rate', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Aktifkan Service Charge</label><select className="form-input form-select" value={settings.enable_service_charge || 'false'} onChange={e => updateSetting('enable_service_charge', e.target.value)}><option value="false">Tidak</option><option value="true">Ya</option></select></div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header"><h3 className="card-title">🖨️ Struk & Cetak</h3></div>
                        <div className="card-body">
                            <div className="form-group"><label className="form-label">Auto Print Struk</label><select className="form-input form-select" value={settings.auto_print_receipt || 'true'} onChange={e => updateSetting('auto_print_receipt', e.target.value)}><option value="true">Ya</option><option value="false">Tidak</option></select></div>
                            <div className="form-group"><label className="form-label">Simbol Mata Uang</label><input className="form-input" value={settings.currency || ''} onChange={e => updateSetting('currency', e.target.value)} placeholder="Rp" /></div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header"><h3 className="card-title">ℹ️ Informasi Sistem</h3></div>
                        <div className="card-body">
                            <p><strong>Aplikasi:</strong> JAGAT POS v1.0</p>
                            <p><strong>Database:</strong> PostgreSQL - jagatpos</p>
                            <p className="mt-md text-muted">Sistem POS untuk restoran dengan fitur lengkap termasuk manajemen menu, meja, kasir, diskon, dan pajak restoran (PB1).</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Settings;
