import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Link2,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  connection,
  decodeEscrowAccount,
  decodeSecret,
  encodeSecret,
  fetchOpenEscrows,
  getWalletUsdcAddress,
  formatUsdcAmount,
  makeAtaInstruction,
  makeCancelInstruction,
  makeClaimInstruction,
  makeCreateEscrowInstruction,
  parseUsdcAmount,
  PROGRAM_ID,
  RPC_URL,
  sendWalletTransaction,
} from './lib/solana.js';

function injectedWallet() {
  if (typeof window === 'undefined') return null;
  return window.phantom?.solana || window.solflare || window.solana || null;
}

function getCurrentPath() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function shortAddress(address, start = 5, end = 5) {
  const text = typeof address === 'string' ? address : address?.toBase58?.() || '';
  if (!text) return '';
  return text.length <= start + end + 3 ? text : `${text.slice(0, start)}…${text.slice(-end)}`;
}

function formatError(error) {
  const message = error?.message || String(error || 'Something went wrong.');
  if (/insufficient funds/i.test(message)) return 'Not enough USDC or Devnet SOL in this wallet for the transaction.';
  if (/user rejected|rejected the request/i.test(message)) return 'The wallet request was cancelled.';
  if (/blockhash not found|block height exceeded/i.test(message)) return 'The transaction expired before confirmation. Please try again.';
  if (/account does not exist|could not find account/i.test(message)) return 'The escrow account was not found. It may already have been claimed or cancelled.';
  return message.length > 240 ? `${message.slice(0, 237)}…` : message;
}

function Brand() {
  return (
    <div className="brand-lockup">
      <span className="brand-mark"><Link2 size={19} strokeWidth={2.5} /></span>
      <span className="brand-word">Money<span>Link</span></span>
    </div>
  );
}

function StatusPill({ programStatus }) {
  const state = programStatus === 'ready'
    ? { text: 'Program live on Devnet', tone: 'status-live' }
    : programStatus === 'checking'
      ? { text: 'Checking Devnet…', tone: 'status-checking' }
      : programStatus === 'error'
        ? { text: 'Devnet RPC unavailable', tone: 'status-error' }
        : { text: 'Program not deployed', tone: 'status-warning' };
  return <span className={`program-pill ${state.tone}`}><i />{state.text}</span>;
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const Icon = toast.type === 'error' ? CircleAlert : CheckCircle2;
  return (
    <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`} role="status">
      <Icon size={17} />
      <span>{toast.message}</span>
      <button type="button" aria-label="Dismiss message" onClick={onClose}><X size={15} /></button>
    </div>
  );
}

function TransactionNotice({ programStatus, error, onRetry }) {
  if (programStatus === 'ready' && !error) return null;
  if (programStatus === 'checking') {
    return <div className="setup-notice notice-neutral"><LoaderCircle className="spin" size={16} /><div><strong>Connecting to Solana Devnet</strong><span>Checking that the Money Link program is deployed.</span></div></div>;
  }
  if (programStatus === 'error') {
    return <div className="setup-notice notice-error"><CircleAlert size={17} /><div><strong>Couldn’t reach Solana Devnet</strong><span>{error || 'Check your connection or RPC URL, then retry.'}</span></div><button type="button" onClick={onRetry}>Retry</button></div>;
  }
  return (
    <div className="setup-notice notice-warning">
      <Info size={17} />
      <div><strong>The on-chain program is not deployed yet</strong><span>Wallet and Devnet balance are live, but link creation and claims will unlock after the Anchor program is deployed and its ID is set in <code>.env.local</code>.</span></div>
    </div>
  );
}

function AppHeader({ wallet, onConnect, onDisconnect, walletLoading, path, navigate }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="primary-nav" aria-label="Main navigation">
          <button className={path === '/' ? 'nav-link nav-link-active' : 'nav-link'} type="button" onClick={() => navigate('/')}>Send</button>
          <button className={path === '/links' ? 'nav-link nav-link-active' : 'nav-link'} type="button" onClick={() => navigate('/links')}>My links</button>
        </nav>
        <div className="header-tools">
          <span className="network-label"><i /> Solana Devnet</span>
          {wallet ? (
            <button className="wallet-connected" type="button" onClick={onDisconnect} title="Disconnect wallet">
              <span className="wallet-connected-dot" /><span>{shortAddress(wallet.toBase58())}</span><LogOut size={14} />
            </button>
          ) : (
            <button className="button button-primary connect-button" type="button" onClick={onConnect} disabled={walletLoading}>
              {walletLoading ? <LoaderCircle className="spin" size={16} /> : <Wallet size={16} />}
              {walletLoading ? 'Connecting…' : 'Connect wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function BalanceCard({ balance, loading, connected, masked, onToggleMask, onRefresh }) {
  return (
    <section className="balance-card">
      <div className="balance-card-copy">
        <div className="balance-label"><span className="balance-pulse" /> {connected ? 'CONNECTED WALLET · DEVNET' : 'WALLET STATUS · DEVNET'}</div>
        <div className="balance-value">{connected ? (loading ? <span className="balance-loading">•••</span> : balance === null ? '—' : masked ? '••••••' : `$${formatUsdcAmount(balance)}`) : 'No wallet connected'}</div>
        <div className="balance-caption">{connected ? 'USDC balance from Solana RPC' : 'Connect a wallet to read its on-chain USDC balance.'}</div>
      </div>
      {connected && <div className="balance-actions"><button className="balance-icon-button" type="button" onClick={onToggleMask} aria-label={masked ? 'Reveal balance' : 'Mask balance'} title={masked ? 'Reveal balance' : 'Mask balance'}>{masked ? <Eye size={16} /> : <EyeOff size={16} />}</button><button className="balance-icon-button" type="button" onClick={onRefresh} disabled={loading} aria-label="Refresh balance" title="Refresh balance"><RefreshCw size={15} className={loading ? 'spin' : ''} /></button></div>}
      <div className="balance-decoration" aria-hidden="true"><span /><span /><span /><span /></div>
    </section>
  );
}

function SendPage({
  wallet,
  balance,
  balanceLoading,
  masked,
  onToggleMask,
  programStatus,
  onConnect,
  onRefreshBalance,
  onCreateLink,
  createdLink,
  onClearCreated,
  busy,
  error,
  onOpenClaim,
  onCopy,
  onRetryProgram,
  connectError,
}) {
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    let baseUnits;
    try { baseUnits = parseUsdcAmount(amount); } catch (parseError) { setFormError(parseError.message); return; }
    if (balance !== null && baseUnits > balance) {
      setFormError('The amount is more than your current Devnet USDC balance.');
      return;
    }
    await onCreateLink(baseUnits);
  };

  return (
    <div className="page-wrap">
      <section className="intro-row">
        <div>
          <div className="overline">PRIVATE USDC TRANSFERS</div>
          <h1>Send money with a link.</h1>
          <p>Fund an escrow from your wallet. Share the link. The person holding it claims the USDC.</p>
        </div>
        <div className="onchain-badge"><span className="onchain-badge-icon"><ShieldCheck size={16} /></span><span><strong>On-chain escrow</strong><small>Solana Devnet · classic USDC</small></span></div>
      </section>

      <TransactionNotice programStatus={programStatus} error={error} onRetry={onRetryProgram} />
      {connectError && <div className="inline-error"><CircleAlert size={16} /><span>{connectError}</span>{!injectedWallet() && <a href="https://phantom.app/download" target="_blank" rel="noreferrer">Get a wallet <ExternalLink size={12} /></a>}</div>}

      <div className="send-grid">
        <div className="send-main-column">
          <BalanceCard balance={balance} loading={balanceLoading} connected={Boolean(wallet)} masked={masked} onToggleMask={onToggleMask} onRefresh={onRefreshBalance} />
          {createdLink ? (
            <section className="panel created-panel">
              <div className="created-mark"><Check size={22} /></div>
              <div className="created-label">TRANSACTION CONFIRMED</div>
              <h2>Your link is ready to share.</h2>
              <p><strong>${formatUsdcAmount(createdLink.amount)}</strong> USDC is locked in escrow on Devnet.</p>
              <div className="created-link-field"><code>{createdLink.url}</code><button type="button" onClick={() => onCopy(createdLink.url)}><Copy size={15} /> Copy</button></div>
              <div className="signature-row"><span>Transaction</span><a href={`https://explorer.solana.com/tx/${createdLink.signature}?cluster=devnet`} target="_blank" rel="noreferrer">{shortAddress(createdLink.signature, 8, 8)} <ExternalLink size={12} /></a></div>
              <div className="created-actions"><button className="button button-primary" type="button" onClick={() => onOpenClaim(createdLink.url)}>Open claim page <ArrowRight size={16} /></button><button className="button button-secondary" type="button" onClick={onClearCreated}>Send another</button></div>
              <div className="secret-warning"><LockKeyhole size={16} /><span><strong>Save this link.</strong> Its private claim key is in the URL fragment. Money Link does not store the secret.</span></div>
            </section>
          ) : (
            <section className="panel send-panel">
              <div className="panel-heading"><span className="panel-icon"><ArrowUpRight size={18} /></span><div><h2>Create a claim link</h2><p>Choose the amount to lock in the escrow.</p></div><span className="step-tag">01 / 02</span></div>
              <form onSubmit={submit}>
                <label className="field-label" htmlFor="amount">Amount</label>
                <div className="amount-entry"><span className="amount-currency-symbol">$</span><input id="amount" type="number" min="0.000001" step="0.000001" inputMode="decimal" placeholder="0.00" value={amount} onChange={(event) => { setAmount(event.target.value); setFormError(''); }} /><span className="amount-token">USDC</span></div>
                <div className="amount-meta"><span>Up to six decimal places</span>{wallet && <button type="button" onClick={() => { setAmount(formatUsdcAmount(balance ?? 0n, 0)); setFormError(''); }} disabled={!balance || balanceLoading}>Use max</button>}</div>
                {formError && <div className="field-error"><CircleAlert size={15} />{formError}</div>}
                {error && <div className="field-error"><CircleAlert size={15} />{error}</div>}
                <div className="funding-note"><Info size={16} /><span>Creating a link submits a real Devnet transaction and locks USDC in the on-chain escrow. The sender can cancel it until it is claimed.</span></div>
                <button className="button button-primary submit-button" type="submit" disabled={!wallet || programStatus !== 'ready' || busy || balanceLoading}>
                  {busy ? <><LoaderCircle className="spin" size={16} /> Waiting for wallet…</> : <>Create escrow link <ArrowRight size={16} /></>}
                </button>
                {!wallet && <button className="connect-inline" type="button" onClick={onConnect}>Connect a Solana wallet to continue <ArrowRight size={14} /></button>}
              </form>
            </section>
          )}
        </div>

        <aside className="guide-column">
          <section className="guide-card">
            <div className="guide-topline"><span className="guide-icon"><Link2 size={17} /></span><span>HOW IT WORKS</span></div>
            <h2>Three steps.<br />Funds stay on-chain.</h2>
            <ol className="guide-list">
              <li><span>1</span><div><strong>Fund the escrow</strong><small>Your wallet signs the USDC deposit.</small></div></li>
              <li><span>2</span><div><strong>Share the private link</strong><small>Only the link holder has the claim key.</small></div></li>
              <li><span>3</span><div><strong>Claim or cancel</strong><small>The first valid transaction closes escrow.</small></div></li>
            </ol>
            <div className="guide-foot"><LockKeyhole size={14} /> Secret key stays in the link fragment</div>
          </section>
          <section className="network-card"><div className="network-card-title"><span className="network-check"><Check size={13} /></span><strong>Testing on Devnet</strong></div><p>These are real on-chain test transactions with valueless test USDC. Mainnet funds are not supported by this app.</p><a href="https://faucet.circle.com/" target="_blank" rel="noreferrer">Get Devnet USDC <ExternalLink size={12} /></a></section>
        </aside>
      </div>
      <div className="dev-footer"><span><i /> RPC connected: {RPC_URL}</span><span>Program <code>{shortAddress(PROGRAM_ID.toBase58(), 7, 5)}</code></span></div>
    </div>
  );
}

function LinksPage({ wallet, programStatus, links, loading, busyAddress, error, onConnect, onRefresh, onCancel }) {
  return (
    <div className="page-wrap links-page">
      <section className="intro-row">
        <div><div className="overline">ON-CHAIN ESCROWS</div><h1>My links</h1><p>Open escrows created by the connected wallet.</p></div>
        {wallet && <button className="button button-secondary" type="button" onClick={onRefresh} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh</button>}
      </section>
      {programStatus !== 'ready' && <TransactionNotice programStatus={programStatus} error={error} onRetry={onRefresh} />}
      {!wallet ? (
        <section className="panel empty-panel"><div className="empty-icon"><Wallet size={21} /></div><h2>Connect a wallet to see your escrows</h2><p>We read open escrow accounts directly from Solana Devnet.</p><button className="button button-primary" type="button" onClick={onConnect}><Wallet size={16} /> Connect wallet</button></section>
      ) : loading ? (
        <section className="panel empty-panel"><LoaderCircle className="spin empty-icon-loader" size={25} /><h2>Loading on-chain links</h2><p>Querying the Money Link program on Devnet.</p></section>
      ) : error ? (
        <section className="panel empty-panel"><div className="empty-icon empty-icon-error"><CircleAlert size={21} /></div><h2>Couldn’t load links</h2><p>{error}</p><button className="button button-secondary" type="button" onClick={onRefresh}><RefreshCw size={15} /> Retry</button></section>
      ) : links.length === 0 ? (
        <section className="panel empty-panel"><div className="empty-icon"><Link2 size={21} /></div><h2>No open escrows</h2><p>When you create an on-chain claim link, it will appear here until it is claimed or cancelled.</p></section>
      ) : (
        <section className="panel links-panel">
          <div className="links-panel-head"><div><h2>Open escrows <span>{links.length}</span></h2><p>These accounts are fetched from Devnet, not browser storage.</p></div></div>
          <div className="escrow-list">
            {links.map((link) => (
              <div className="escrow-row" key={link.address.toBase58()}>
                <div className="escrow-icon"><Link2 size={17} /></div>
                <div className="escrow-copy"><strong>{shortAddress(link.address.toBase58(), 8, 7)}</strong><span>Claim key {shortAddress(link.claimPublicKey.toBase58(), 5, 4)}</span></div>
                <div className="escrow-amount"><strong>${formatUsdcAmount(link.amount)}</strong><span>USDC</span></div>
                <a className="explorer-link" href={`https://explorer.solana.com/address/${link.address.toBase58()}?cluster=devnet`} target="_blank" rel="noreferrer" title="View escrow on Explorer"><ExternalLink size={15} /></a>
                <button className="cancel-button" type="button" onClick={() => onCancel(link)} disabled={busyAddress === link.address.toBase58()}>
                  {busyAddress === link.address.toBase58() ? <LoaderCircle className="spin" size={15} /> : <X size={15} />} Cancel
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="dev-footer"><span><i /> Live on Solana Devnet</span><span>Connected wallet <code>{shortAddress(wallet?.toBase58() || '') || 'not connected'}</code></span></div>
    </div>
  );
}

function ClaimPage({
  escrowId,
  hash,
  wallet,
  programStatus,
  claimData,
  claimLoading,
  claimError,
  claimBusy,
  claimComplete,
  claimSignature,
  onConnect,
  onClaim,
  connectError,
}) {
  const secret = hash.startsWith('#') ? hash.slice(1) : hash;
  return (
    <div className="claim-wrap">
      <div className="claim-back-row"><a href="/" onClick={(event) => { event.preventDefault(); window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}><ArrowLeft size={15} /> Money Link</a><span className="network-label"><i /> Solana Devnet</span></div>
      {claimComplete ? (
        <section className="claim-panel claim-success-panel"><div className="claim-success-mark"><Check size={25} /></div><div className="overline">TRANSACTION CONFIRMED</div><h1>USDC claimed.</h1><p>The escrow has been closed and the Devnet USDC was sent to your connected wallet.</p><a className="button button-primary" href={`https://explorer.solana.com/tx/${claimSignature}?cluster=devnet`} target="_blank" rel="noreferrer">View transaction on Explorer <ExternalLink size={15} /></a></section>
      ) : (
        <section className="claim-panel">
          <div className="claim-brand-icon"><ArrowDownToLine size={20} /></div>
          <div className="overline">PRIVATE CLAIM LINK</div>
          <h1>{claimLoading ? 'Checking escrow…' : 'You have USDC to claim.'}</h1>
          {claimLoading ? (
            <div className="claim-loading"><LoaderCircle className="spin" size={22} /><span>Reading the escrow from Solana Devnet.</span></div>
          ) : claimData ? (
            <>
              <div className="claim-amount-card"><strong>${formatUsdcAmount(claimData.amount)}</strong><span>USDC on Solana Devnet</span></div>
              <div className="claim-sender-line"><span>Sent from</span><strong>{shortAddress(claimData.sender.toBase58(), 7, 5)}</strong></div>
              <div className="claim-sender-line"><span>Escrow</span><a href={`https://explorer.solana.com/address/${escrowId}?cluster=devnet`} target="_blank" rel="noreferrer">View on Explorer <ExternalLink size={12} /></a></div>
              {!secret && <div className="field-error"><CircleAlert size={15} />This link is missing its private key. Open the complete link you received.</div>}
              {claimError && <div className="field-error"><CircleAlert size={15} />{claimError}</div>}
              {!wallet ? (
                <button className="button button-primary claim-button" type="button" onClick={onConnect}><Wallet size={16} /> Connect wallet to claim</button>
              ) : (
                <button className="button button-primary claim-button" type="button" onClick={onClaim} disabled={!secret || programStatus !== 'ready' || claimBusy}>
                  {claimBusy ? <><LoaderCircle className="spin" size={16} /> Confirming in wallet…</> : <>Claim ${formatUsdcAmount(claimData.amount)} USDC <ArrowRight size={16} /></>}
                </button>
              )}
              {connectError && <div className="field-error"><CircleAlert size={15} />{connectError}</div>}
              <div className="claim-gas-note"><Info size={15} /><span>Claiming is a real Devnet transaction. Your connected wallet needs a small amount of Devnet SOL for the network fee.</span></div>
            </>
          ) : (
            <>
              <div className="claim-load-error"><CircleAlert size={19} /><span>{claimError || (programStatus === 'ready' ? 'This escrow was not found. It may already have been claimed or cancelled.' : 'The Money Link program is not yet available on Devnet.')}</span></div>
              {programStatus !== 'ready' && <p className="claim-setup-copy">The program must be deployed before a real claim link can be opened.</p>}
            </>
          )}
          <div className="claim-footer-note"><ShieldCheck size={15} /><span>The URL fragment is the claim secret. Keep it private.</span></div>
        </section>
      )}
      <p className="devnet-disclaimer"><Info size={13} /> Devnet test tokens have no monetary value. This app does not support Mainnet.</p>
    </div>
  );
}

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [path, setPath] = useState(getCurrentPath);
  const [hash, setHash] = useState(() => window.location.hash);
  const [programStatus, setProgramStatus] = useState('checking');
  const [programError, setProgramError] = useState('');
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [maskedBalance, setMaskedBalance] = useState(true);
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksError, setLinksError] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyAddress, setBusyAddress] = useState('');
  const [transactionError, setTransactionError] = useState('');
  const [createdLink, setCreatedLink] = useState(null);
  const [claimData, setClaimData] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimComplete, setClaimComplete] = useState(false);
  const [claimSignature, setClaimSignature] = useState('');
  const [toast, setToast] = useState(null);

  const isClaimRoute = path.startsWith('/claim/');
  const escrowId = isClaimRoute ? path.split('/').filter(Boolean).at(-1) : '';

  const navigate = useCallback((destination) => {
    window.history.pushState({}, '', destination);
    setPath(getCurrentPath());
    setHash(window.location.hash);
    window.scrollTo(0, 0);
  }, []);

  const notify = useCallback((message, type = 'success') => setToast({ message, type, key: Date.now() }), []);

  useEffect(() => {
    const syncLocation = () => {
      setPath(getCurrentPath());
      setHash(window.location.hash);
    };
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('hashchange', syncLocation);
    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('hashchange', syncLocation);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const provider = injectedWallet();
    if (provider?.isConnected && provider.publicKey) {
      setWalletProvider(provider);
      setWallet(new PublicKey(provider.publicKey.toString()));
    }
  }, []);

  useEffect(() => {
    if (!walletProvider?.on) return undefined;
    const accountChanged = (publicKey) => setWallet(publicKey ? new PublicKey(publicKey.toString()) : null);
    const disconnected = () => setWallet(null);
    walletProvider.on('accountChanged', accountChanged);
    walletProvider.on('disconnect', disconnected);
    return () => {
      walletProvider.removeListener?.('accountChanged', accountChanged);
      walletProvider.removeListener?.('disconnect', disconnected);
      walletProvider.off?.('accountChanged', accountChanged);
      walletProvider.off?.('disconnect', disconnected);
    };
  }, [walletProvider]);

  const checkProgram = useCallback(async () => {
    setProgramStatus('checking');
    setProgramError('');
    try {
      const info = await connection.getAccountInfo(PROGRAM_ID, 'confirmed');
      if (!info?.executable) {
        setProgramStatus('missing');
        setProgramError('The configured program address has no deployed executable on Devnet.');
        return false;
      }
      setProgramStatus('ready');
      return true;
    } catch (error) {
      setProgramStatus('error');
      setProgramError(formatError(error));
      return false;
    }
  }, []);

  useEffect(() => { checkProgram(); }, [checkProgram]);

  const connectWallet = useCallback(async () => {
    setConnectError('');
    const provider = injectedWallet();
    if (!provider?.connect || !provider?.signTransaction) {
      setConnectError('No compatible browser wallet was found. Install Phantom or Solflare, then refresh this page.');
      return;
    }
    setWalletLoading(true);
    try {
      const response = await provider.connect();
      const publicKey = response?.publicKey || provider.publicKey;
      if (!publicKey) throw new Error('The wallet did not return a public key.');
      setWalletProvider(provider);
      setWallet(new PublicKey(publicKey.toString()));
      notify('Wallet connected to Solana Devnet.');
    } catch (error) {
      setConnectError(formatError(error));
    } finally {
      setWalletLoading(false);
    }
  }, [notify]);

  const disconnectWallet = useCallback(async () => {
    try { await walletProvider?.disconnect?.(); } catch { /* local state is still cleared */ }
    setWallet(null);
    setWalletProvider(null);
    setBalance(null);
    setLinks([]);
    notify('Wallet disconnected.');
  }, [notify, walletProvider]);

  const refreshBalance = useCallback(async () => {
    if (!wallet) return null;
    setBalanceLoading(true);
    try {
      const address = getWalletUsdcAddress(wallet);
      const account = await connection.getAccountInfo(address, 'confirmed');
      if (!account) {
        setBalance(0n);
        return 0n;
      }
      const tokenBalance = await connection.getTokenAccountBalance(address, 'confirmed');
      const amount = BigInt(tokenBalance.value.amount);
      setBalance(amount);
      return amount;
    } catch (error) {
      setTransactionError(formatError(error));
      return null;
    } finally {
      setBalanceLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet) refreshBalance();
    else setBalance(null);
  }, [wallet, refreshBalance]);

  const refreshLinks = useCallback(async () => {
    if (!wallet || programStatus !== 'ready') {
      setLinks([]);
      return;
    }
    setLinksLoading(true);
    setLinksError('');
    try {
      setLinks(await fetchOpenEscrows(wallet));
    } catch (error) {
      setLinksError(formatError(error));
    } finally {
      setLinksLoading(false);
    }
  }, [wallet, programStatus]);

  useEffect(() => {
    if (path === '/links') refreshLinks();
  }, [path, refreshLinks]);

  useEffect(() => {
    if (!isClaimRoute || !escrowId || programStatus !== 'ready') {
      if (!isClaimRoute) {
        setClaimData(null);
        setClaimError('');
        setClaimComplete(false);
        setClaimSignature('');
      }
      return undefined;
    }
    let cancelled = false;
    setClaimLoading(true);
    setClaimData(null);
    setClaimError('');
    setClaimComplete(false);
    setClaimSignature('');
    (async () => {
      try {
        const address = new PublicKey(escrowId);
        const account = await connection.getAccountInfo(address, 'confirmed');
        if (!account || !account.owner.equals(PROGRAM_ID)) throw new Error('This escrow does not exist on Devnet. It may already be claimed or cancelled.');
        const state = await decodeEscrowAccount(account.data);
        if (!cancelled) setClaimData({ ...state, address });
      } catch (error) {
        if (!cancelled) setClaimError(formatError(error));
      } finally {
        if (!cancelled) setClaimLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isClaimRoute, escrowId, programStatus]);

  const createLink = async (amount) => {
    setTransactionError('');
    if (!wallet || !walletProvider) {
      setTransactionError('Connect a Solana wallet before creating an escrow.');
      return;
    }
    if (programStatus !== 'ready') {
      setTransactionError('The Money Link program must be deployed to Devnet first.');
      return;
    }
    setBusy(true);
    try {
      const currentBalance = await refreshBalance();
      if (currentBalance === null) throw new Error('Could not read this wallet’s USDC balance.');
      if (amount > currentBalance) throw new Error('The amount is more than your current Devnet USDC balance.');
      const claimKeypair = Keypair.generate();
      const { escrow, instruction } = await makeCreateEscrowInstruction({
        sender: wallet,
        claimPublicKey: claimKeypair.publicKey,
        amount,
      });
      const signature = await sendWalletTransaction({
        provider: walletProvider,
        wallet,
        instructions: [makeAtaInstruction(wallet, wallet), instruction],
      });
      const url = `${window.location.origin}/claim/${escrow.toBase58()}#${encodeSecret(claimKeypair.secretKey)}`;
      const result = { amount, escrow, signature, url };
      setCreatedLink(result);
      notify('Escrow confirmed on Solana Devnet.');
      refreshBalance();
      if (path === '/links') refreshLinks();
    } catch (error) {
      const message = formatError(error);
      setTransactionError(message);
      notify(message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const cancelLink = async (link) => {
    if (!wallet || !walletProvider || programStatus !== 'ready') return;
    const address = link.address.toBase58();
    setBusyAddress(address);
    setLinksError('');
    try {
      const instruction = await makeCancelInstruction({ sender: wallet, escrow: link.address });
      const signature = await sendWalletTransaction({
        provider: walletProvider,
        wallet,
        instructions: [makeAtaInstruction(wallet, wallet), instruction],
      });
      notify(`Escrow cancelled on Devnet · ${shortAddress(signature, 7, 5)}`);
      refreshBalance();
      refreshLinks();
    } catch (error) {
      const message = formatError(error);
      setLinksError(message);
      notify(message, 'error');
    } finally {
      setBusyAddress('');
    }
  };

  const claimLink = async () => {
    if (!wallet || !walletProvider || !claimData) return;
    const secret = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!secret) {
      setClaimError('This link is missing its private key.');
      return;
    }
    setClaimBusy(true);
    setClaimError('');
    try {
      const claimKeypair = Keypair.fromSecretKey(decodeSecret(secret));
      if (!claimKeypair.publicKey.equals(claimData.claimPublicKey)) {
        throw new Error('The private key in this link does not match the on-chain escrow.');
      }
      const claimInstruction = await makeClaimInstruction({
        claimAuthority: claimKeypair.publicKey,
        escrow: claimData.address,
        sender: claimData.sender,
        destination: wallet,
      });
      const signature = await sendWalletTransaction({
        provider: walletProvider,
        wallet,
        instructions: [makeAtaInstruction(wallet, wallet), claimInstruction],
        signers: [claimKeypair],
      });
      setClaimComplete(true);
      setClaimSignature(signature);
      notify('USDC claim confirmed on Solana Devnet.');
      window.history.replaceState({}, '', window.location.pathname);
      setHash('');
    } catch (error) {
      const message = formatError(error);
      setClaimError(message);
      notify(message, 'error');
    } finally {
      setClaimBusy(false);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify('Link copied to clipboard.');
    } catch {
      setTransactionError('Clipboard access was blocked. Select and copy the link manually.');
      notify('Clipboard access was blocked. Select and copy the link manually.', 'error');
    }
  };

  const openClaimUrl = (url) => {
    const parsed = new URL(url);
    navigate(`${parsed.pathname}${parsed.hash}`);
  };

  const clearCreated = () => {
    setCreatedLink(null);
    setTransactionError('');
  };

  return (
    <div className="app-shell">
      <AppHeader wallet={wallet} onConnect={connectWallet} onDisconnect={disconnectWallet} walletLoading={walletLoading} path={path} navigate={navigate} />
      <main>
        {isClaimRoute ? (
          <ClaimPage
            escrowId={escrowId}
            hash={hash}
            wallet={wallet}
            programStatus={programStatus}
            claimData={claimData}
            claimLoading={claimLoading}
            claimError={claimError}
            claimBusy={claimBusy}
            claimComplete={claimComplete}
            claimSignature={claimSignature}
            onConnect={connectWallet}
            onClaim={claimLink}
            connectError={connectError}
          />
        ) : path === '/links' ? (
          <LinksPage wallet={wallet} programStatus={programStatus} links={links} loading={linksLoading} busyAddress={busyAddress} error={linksError || programError} onConnect={connectWallet} onRefresh={() => { checkProgram(); refreshLinks(); }} onCancel={cancelLink} />
        ) : (
          <SendPage
            wallet={wallet}
            balance={balance}
            balanceLoading={balanceLoading}
            masked={maskedBalance}
            onToggleMask={() => setMaskedBalance((current) => !current)}
            programStatus={programStatus}
            onConnect={connectWallet}
            onRefreshBalance={refreshBalance}
            onCreateLink={createLink}
            createdLink={createdLink}
            onClearCreated={clearCreated}
            busy={busy}
            error={transactionError}
            onOpenClaim={openClaimUrl}
            onCopy={copyText}
            onRetryProgram={checkProgram}
            connectError={connectError}
          />
        )}
      </main>
      <footer className="global-footer"><Brand /><span>Devnet only · test USDC · no Mainnet funds</span><span className="footer-program">Program <code>{shortAddress(PROGRAM_ID.toBase58(), 7, 5)}</code></span></footer>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
