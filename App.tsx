import { QRCodeSVG } from 'qrcode.react'
import { useCantonWallet } from './useCantonWallet'

export default function App() {
  const { state, wcUri, account, error, connect, disconnect } = useCantonWallet()

  return (
    <div style={css.root}>
      <div style={css.grid} />
      <div style={css.card}>

        {/* Header */}
        <div style={css.header}>
          <div style={css.logo}>
            <span style={css.logoC}>C</span>
            <span style={css.logoText}>ANTON</span>
          </div>
          <span style={css.badge}>× WalletConnect</span>
        </div>

        <div style={css.body}>

          {/* IDLE */}
          {state === 'idle' && (
            <div style={css.center}>
              <p style={css.hint}>
                Connect any WalletConnect-compatible Canton wallet.
                <br /><br />
                Uses the <code style={css.code}>canton</code> namespace —
                no hardcoded chain ID. The wallet tells the dApp
                what network it's on.
              </p>
              <button style={css.btn} onClick={connect}>Connect Wallet</button>
            </div>
          )}

          {/* CONNECTING — show QR + URI */}
          {state === 'connecting' && (
            <div style={css.center}>
              {wcUri ? (
                <>
                  <p style={css.label}>WalletConnect URI generated ✓</p>
                  <div style={css.qrWrap}>
                    <QRCodeSVG
                      value={wcUri}
                      size={180}
                      bgColor="transparent"
                      fgColor="#63B3ED"
                    />
                  </div>
                  <div style={css.uriBox}>
                    <span style={css.uriPrefix}>wc:</span>
                    {wcUri.slice(3, 72)}…
                  </div>
                  <div style={css.waiting}>
                    <span style={css.pulseDot} />
                    Waiting for wallet approval…
                  </div>
                </>
              ) : (
                <div style={css.waiting}>
                  <span style={css.pulseDot} />
                  Initialising WalletConnect…
                </div>
              )}
            </div>
          )}

          {/* ERROR */}
          {state === 'error' && (
            <div style={css.center}>
              <div style={css.errorBox}>{error}</div>
              <button style={css.btn} onClick={connect}>Retry</button>
            </div>
          )}

          {/* CONNECTED */}
          {state === 'connected' && account && (
            <div>
              <div style={css.connectedRow}>
                <span style={css.connectedDot} />
                <span style={css.connectedText}>Connected</span>
                <span style={css.networkBadge}>{account.networkId}</span>
              </div>
              <div style={css.table}>
                {([
                  ['Party ID', account.partyId, '#63B3ED'],
                  ['Network', account.networkId, '#e2e8f0'],
                  ['Status', account.status, '#68D391'],
                  ['Signing', account.signingProviderId, '#e2e8f0'],
                ] as [string, string, string][]).map(([k, v, color]) => (
                  <div key={k} style={css.row}>
                    <span style={css.key}>{k}</span>
                    <span style={{ ...css.val, color }}>{v}</span>
                  </div>
                ))}
              </div>
              <button style={{ ...css.btn, ...css.btnGhost }} onClick={disconnect}>
                Disconnect
              </button>
            </div>
          )}

        </div>

        <div style={css.footer}>
          docs.walletconnect.network/wallet-sdk/chain-support/canton
        </div>
      </div>
    </div>
  )
}

const css: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060910', fontFamily: "'Space Grotesk', system-ui, sans-serif", position: 'relative', overflow: 'hidden' },
  grid: { position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' },
  card: { width: 460, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', position: 'relative', zIndex: 1 },
  header: { padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'baseline', gap: 4 },
  logoC: { fontSize: 28, fontWeight: 800, color: '#63B3ED', letterSpacing: -1, lineHeight: 1 },
  logoText: { fontSize: 15, fontWeight: 700, color: '#e2e8f0', letterSpacing: 4 },
  badge: { fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.5 },
  body: { padding: 28, minHeight: 220 },
  center: { display: 'flex', flexDirection: 'column', gap: 16 },
  hint: { fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 },
  code: { fontFamily: 'monospace', fontSize: 12, color: '#63B3ED', background: 'rgba(99,179,237,0.1)', padding: '2px 6px', borderRadius: 4 },
  btn: { padding: '12px 28px', background: '#63B3ED', color: '#060910', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' },
  btnGhost: { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', marginTop: 16 },
  label: { fontSize: 13, fontWeight: 600, color: '#68D391', margin: 0 },
  qrWrap: { padding: 16, background: 'rgba(99,179,237,0.05)', border: '1px solid rgba(99,179,237,0.15)', borderRadius: 12, display: 'inline-flex', alignSelf: 'flex-start' },
  uriBox: { fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px', wordBreak: 'break-all', lineHeight: 1.6 },
  uriPrefix: { color: '#63B3ED' },
  waiting: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  pulseDot: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#63B3ED', flexShrink: 0 },
  errorBox: { fontSize: 13, color: '#FC8181', background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: 8, padding: '10px 14px' },
  connectedRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  connectedDot: { width: 8, height: 8, borderRadius: '50%', background: '#68D391', boxShadow: '0 0 8px #68D391' },
  connectedText: { fontSize: 13, fontWeight: 600, color: '#68D391', flex: 1 },
  networkBadge: { fontFamily: 'monospace', fontSize: 11, color: '#63B3ED', background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.2)', padding: '3px 10px', borderRadius: 100 },
  table: { borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 16 },
  key: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5, flexShrink: 0 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'right' as const, wordBreak: 'break-all' as const },
  footer: { padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace' },
}
