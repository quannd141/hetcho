export function ProfilePage() {
  return (
    <div>
      <div className="app-bar">
        <h1>Tài khoản</h1>
      </div>

      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <div className="staff-avatar" style={{ width: 72, height: 72, fontSize: 28 }}>T</div>
          <div style={{ fontWeight: 600, fontSize: 18, marginTop: 12 }}>Tùng Nguyễn</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>📱 0901xxx234</div>
          <span className="booking-status confirmed" style={{ marginTop: 8 }}>💎 CIP — 22 lượt</span>
        </div>

        <div className="section-title">Cài đặt</div>
        <div className="card" style={{ padding: 0 }}>
          <Item icon="🔔" label="Nhận thông báo Zalo" toggle defaultOn />
          <Item icon="📅" label="Nhắc T-24h trước hẹn" toggle defaultOn />
          <Item icon="⏰" label="Nhắc T-2h trước hẹn" toggle defaultOn />
          <Item icon="🎁" label="Khuyến mãi & voucher" toggle />
        </div>

        <div className="section-title">Hỗ trợ</div>
        <div className="card" style={{ padding: 0 }}>
          <Item icon="❓" label="Câu hỏi thường gặp" arrow />
          <Item icon="💬" label="Liên hệ HếtChờ" arrow />
          <Item icon="📜" label="Điều khoản & chính sách" arrow />
        </div>

        <div className="footer">
          <div>HếtChờ v0.1 — Đặt là vào liền</div>
          <div style={{ marginTop: 4 }}>powered by HếtChờ</div>
        </div>
      </div>
    </div>
  );
}

function Item({ icon, label, toggle, defaultOn, arrow }: { icon: string; label: string; toggle?: boolean; defaultOn?: boolean; arrow?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ marginRight: 12, fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14 }}>{label}</span>
      {toggle && <input type="checkbox" defaultChecked={defaultOn} />}
      {arrow && <span style={{ color: 'var(--text-muted)' }}>›</span>}
    </div>
  );
}
