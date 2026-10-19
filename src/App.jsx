import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  ExternalLink,
  Home,
  Info,
  Link2,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Zap,
  CircleDollarSign,
  Smartphone,
  UserRound,
  LoaderCircle,
  RotateCcw,
  Mail,
  CheckCheck,
  CircleAlert,
} from 'lucide-react';

const STORAGE_KEY = 'money-link-demo-v1';
const STARTING_BALANCE = 2500;
const EMPTY_STATE = { balance: STARTING_BALANCE, links: [], activity: [] };

function readSavedState() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return EMPTY_STATE;
    return {
      balance: Number.isFinite(Number(parsed.balance)) ? Number(parsed.balance) : STARTING_BALANCE,
      links: Array.isArray(parsed.links) ? parsed.links : [],
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashSecret(secret) {
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function roundUsdc(value) {
  return Math.round((Number(value) + Number.EPSILON) * 1_000_000) / 1_000_000;
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(options.year ? { year: 'numeric' } : {}),
    ...(options.time ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date);
}

function currentGreetingDate() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date()).toUpperCase();
}

function initials(value) {
  const name = (value || 'Open link').trim();
  if (name === 'Anyone with the link') return '↗';
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ML';
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`} aria-label="Money Link">
      <span className="brand-mark"><Link2 size={20} strokeWidth={2.5} aria-hidden="true" /></span>
      <span className="brand-name">Money <strong>Link</strong></span>
    </div>
  );
}

function SandboxPill({ compact = false }) {
  return (
    <span className={`sandbox-pill ${compact ? 'sandbox-pill-compact' : ''}`} title="Prototype only — no real funds move">
      <span className="sandbox-dot" />
      <span>{compact ? 'Demo' : 'Sandbox · no real funds'}</span>
    </span>
  );
}

function Modal({ onClose, children, className = '' }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal-card ${className}`} role="dialog" aria-modal="true">
        <button className="modal-close icon-button" type="button" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>
        {children}
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'claimed') {
    return <span className="status-badge status-claimed"><CheckCircle2 size={14} /> Claimed</span>;
  }
  if (status === 'cancelled') {
    return <span className="status-badge status-cancelled"><RotateCcw size={13} /> Cancelled</span>;
  }
  return <span className="status-badge status-pending"><Clock3 size={14} /> Awaiting claim</span>;
}

function Navigation({ path, links, onNavigate, onHelp, mobile = false }) {
  const pendingCount = links.filter((link) => link.status === 'pending').length;
  const items = [
    { label: 'Overview', route: '/', icon: Home },
    { label: 'Send money', route: '/send', icon: Send },
    { label: 'My links', route: '/links', icon: Link2, badge: pendingCount > 0 ? pendingCount : null },
    { label: 'Activity', route: '/activity', icon: Activity },
  ];

  return (
    <nav className={mobile ? 'mobile-nav' : 'sidebar-nav'} aria-label={mobile ? 'Mobile navigation' : 'Main navigation'}>
      {!mobile && <div className="nav-label">WORKSPACE</div>}
      {items.map(({ label, route, icon: Icon, badge }) => {
        const active = route === '/' ? path === '/' : path === route || (route === '/links' && path.startsWith('/links/'));
        return (
          <button
            className={`nav-item ${active ? 'nav-item-active' : ''}`}
            key={route}
            type="button"
            onClick={() => onNavigate(route)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={19} strokeWidth={active ? 2.25 : 1.9} aria-hidden="true" />
            <span>{label}</span>
            {badge && <span className="nav-count">{badge}</span>}
          </button>
        );
      })}
      {!mobile && (
        <button className="sidebar-help" type="button" onClick={onHelp}>
          <span className="help-icon"><CircleHelp size={17} /></span>
          <span><strong>Need a hand?</strong><small>See how Money Link works</small></span>
          <ChevronRight size={16} className="help-chevron" />
        </button>
      )}
    </nav>
  );
}

function Sidebar({ path, links, onNavigate, onHelp }) {
  return (
    <aside className="sidebar">
      <Brand />
      <Navigation path={path} links={links} onNavigate={onNavigate} onHelp={onHelp} />
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <div className="sidebar-note-icon"><ShieldCheck size={17} /></div>
          <p><strong>Private by design.</strong><br />Your claim secret stays in the link.</p>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">S</div>
          <div className="profile-copy"><strong>Samira</strong><span>Demo account</span></div>
          <MoreHorizontal size={19} className="profile-more" />
        </div>
        <div className="sidebar-version">MONEY LINK <span>·</span> PREVIEW 0.1</div>
      </div>
    </aside>
  );
}

function Topbar({ title, onWalletClick, onHelp }) {
  return (
    <header className="topbar">
      <div className="topbar-brand"><Brand compact /></div>
      <div className="topbar-title"><span>Workspace</span><ChevronRight size={14} /><strong>{title}</strong></div>
      <div className="topbar-actions">
        <SandboxPill />
        <button className="icon-button help-top-button" type="button" onClick={onHelp} aria-label="How Money Link works" title="How it works">
          <CircleHelp size={18} />
        </button>
        <button className="wallet-button" type="button" onClick={onWalletClick}>
          <span className="wallet-button-icon"><Wallet size={16} /></span>
          <span className="wallet-button-label">Demo wallet</span>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}

function OverviewPage({ balance, links, onSend, onNavigate, onHelp, onCopy, onCancel, sessionSecrets }) {
  const pendingLinks = links.filter((link) => link.status === 'pending');
  const claimedCount = links.filter((link) => link.status === 'claimed').length;
  const pendingTotal = pendingLinks.reduce((sum, link) => sum + Number(link.amount || 0), 0);
  const recentLinks = [...links].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  return (
    <div className="page-stack overview-page">
      <div className="page-heading overview-heading">
        <div>
          <div className="eyebrow date-eyebrow">{currentGreetingDate()}</div>
          <h1>Good afternoon, Samira <span className="heading-sparkle">✳</span></h1>
          <p>Everything you need to move money simply.</p>
        </div>
        <button className="button button-primary heading-cta" type="button" onClick={onSend}>
          <Plus size={18} /> Create a link <ArrowRight size={16} />
        </button>
      </div>

      <section className="hero-card" aria-labelledby="hero-title">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-grid-lines" />
        <div className="hero-copy">
          <div className="hero-kicker"><Sparkles size={13} /> THE EASY WAY TO SEND</div>
          <h2 id="hero-title">Money moves<br />better with a link.</h2>
          <p>Send USDC across borders with one simple link. Your recipient claims it on their terms.</p>
          <div className="hero-actions">
            <button className="button button-lime" type="button" onClick={onSend}>Create a money link <ArrowRight size={16} /></button>
            <button className="button button-ghost" type="button" onClick={onHelp}>How it works</button>
          </div>
          <div className="hero-assurances">
            <span><LockKeyhole size={13} /> Private claim link</span>
            <i />
            <span><Zap size={13} /> Simple by design</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-ring art-ring-one" />
          <div className="art-ring art-ring-two" />
          <div className="art-stars"><i /><i /><i /></div>
          <div className="orbit-dot orbit-dot-a" /><div className="orbit-dot orbit-dot-b" />
          <div className="art-avatar art-avatar-sender">S</div>
          <div className="art-avatar art-avatar-recipient">A</div>
          <div className="art-link-icon"><Link2 size={19} /></div>
          <div className="floating-note"><span className="floating-note-icon"><Check size={13} /></span> Link ready to share</div>
          <div className="transfer-preview">
            <div className="transfer-preview-top">
              <div className="preview-send-icon"><ArrowUpRight size={16} /></div>
              <span className="preview-tag"><span /> READY TO CLAIM</span>
              <MoreHorizontal size={17} className="preview-more" />
            </div>
            <div className="preview-amount">$250<span>.00</span> <small>USDC</small></div>
            <div className="preview-divider" />
            <div className="preview-recipient">
              <div className="recipient-mini-avatar">A</div>
              <div><strong>For Amina</strong><small>One private link</small></div>
              <ShieldCheck size={17} className="preview-shield" />
            </div>
          </div>
          <div className="art-caption"><span className="art-caption-dot" /> MONEY, MINUS THE FRICTION</div>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Your demo account summary">
        <article className="metric-card">
          <div className="metric-topline"><span className="metric-icon metric-icon-blue"><Wallet size={18} /></span><span className="metric-label">DEMO BALANCE</span><MoreHorizontal size={17} className="metric-more" /></div>
          <div className="metric-value">${formatMoney(balance)} <small>USDC</small></div>
          <div className="metric-foot"><span className="metric-foot-dot green-dot" /> Sandbox funds available to send</div>
        </article>
        <article className="metric-card">
          <div className="metric-topline"><span className="metric-icon metric-icon-violet"><Link2 size={18} /></span><span className="metric-label">AWAITING CLAIM</span><MoreHorizontal size={17} className="metric-more" /></div>
          <div className="metric-value">${formatMoney(pendingTotal)} <small>USDC</small></div>
          <div className="metric-foot"><span className="metric-foot-dot amber-dot" /> {pendingLinks.length} {pendingLinks.length === 1 ? 'open link' : 'open links'}</div>
        </article>
        <article className="metric-card">
          <div className="metric-topline"><span className="metric-icon metric-icon-green"><CheckCheck size={18} /></span><span className="metric-label">CLAIMED LINKS</span><MoreHorizontal size={17} className="metric-more" /></div>
          <div className="metric-value">{claimedCount.toString().padStart(2, '0')} <small>{claimedCount === 1 ? 'link' : 'links'}</small></div>
          <div className="metric-foot"><span className="metric-foot-dot blue-dot" /> Successfully received</div>
        </article>
      </section>

      <div className="overview-bottom-grid">
        <section className="surface-card recent-card">
          <div className="section-heading">
            <div><div className="section-overline">YOUR TRANSFERS</div><h2>Recent links</h2></div>
            <button className="text-button" type="button" onClick={() => onNavigate('/links')}>View all <ArrowRight size={15} /></button>
          </div>
          {recentLinks.length ? (
            <LinkList links={recentLinks} sessionSecrets={sessionSecrets} onCopy={onCopy} onCancel={onCancel} compact />
          ) : (
            <EmptyLinks onSend={onSend} compact />
          )}
        </section>

        <aside className="surface-card how-card">
          <div className="how-card-top"><span className="how-card-icon"><Sparkles size={17} /></span><span className="how-step-label">3 SIMPLE STEPS</span></div>
          <h2>Your money,<br />one link away.</h2>
          <div className="how-steps-mini">
            <div><span className="mini-step-number">01</span><span>Choose an amount</span></div>
            <div><span className="mini-step-number">02</span><span>Share a private link</span></div>
            <div><span className="mini-step-number">03</span><span>They claim the funds</span></div>
          </div>
          <button className="how-learn-link" type="button" onClick={onHelp}>Learn how it works <ArrowRight size={15} /></button>
        </aside>
      </div>
      <div className="prototype-note"><Info size={14} /><span>Prototype preview: balances and transfers are simulated. No real USDC or blockchain transactions are involved.</span></div>
    </div>
  );
}

function EmptyLinks({ onSend, compact = false }) {
  return (
    <div className={`empty-links ${compact ? 'empty-links-compact' : ''}`}>
      <div className="empty-link-illustration"><span className="empty-link-disc"><Link2 size={23} /></span><span className="empty-spark empty-spark-one" /><span className="empty-spark empty-spark-two" /></div>
      <div className="empty-link-copy"><h3>Your first link is waiting.</h3><p>Create a link, then share it with anyone you’d like to pay.</p></div>
      <button className="button button-secondary small-button" type="button" onClick={onSend}><Plus size={15} /> Create your first link</button>
    </div>
  );
}

function LinkList({ links, sessionSecrets, onCopy, onCancel, compact = false }) {
  return (
    <div className={`link-list ${compact ? 'link-list-compact' : ''}`}>
      {links.map((link) => {
        const person = link.recipient?.trim() || 'Anyone with the link';
        return (
          <div className="link-row" key={link.id}>
            <div className={`link-person-avatar ${link.status === 'claimed' ? 'link-person-claimed' : ''}`}>{initials(person)}</div>
            <div className="link-person-copy"><strong>{person}</strong><span>{link.memo?.trim() ? link.memo : `${formatDate(link.createdAt)} · USDC transfer`}</span></div>
            <div className="link-row-amount"><strong>${formatMoney(link.amount)}</strong><span>USDC</span></div>
            <div className="link-row-status"><StatusBadge status={link.status} /></div>
            <div className="link-row-actions">
              {link.status === 'pending' && sessionSecrets[link.id] && (
                <button className="row-action" type="button" onClick={() => onCopy(link.id)} aria-label="Copy claim link" title="Copy claim link"><Copy size={15} /></button>
              )}
              {link.status === 'pending' && (
                <button className="row-action row-action-cancel" type="button" onClick={() => onCancel(link)} aria-label="Cancel link and return funds" title="Cancel link"><RotateCcw size={15} /></button>
              )}
              {link.status === 'claimed' && <span className="row-done-mark"><Check size={15} /></span>}
              {link.status === 'cancelled' && <span className="row-done-mark row-cancelled-mark"><X size={15} /></span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CreatePage({ balance, createdResult, onCreate, onClearResult, onCopy, onNavigate }) {
  const [form, setForm] = useState({ amount: '', recipient: '', memo: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const amount = Number(String(form.amount).trim());
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (amount > balance + 0.000001) {
      setError('That is more than your available demo balance.');
      return;
    }
    if (String(form.amount).includes('.') && String(form.amount).split('.')[1].length > 6) {
      setError('USDC amounts can have up to six decimal places.');
      return;
    }
    setSubmitting(true);
    const result = await onCreate({ ...form, amount: roundUsdc(amount) });
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setForm({ amount: '', recipient: '', memo: '' });
    }
  };

  if (createdResult) {
    const shareText = `I've sent you $${formatMoney(createdResult.amount)} USDC with Money Link. Claim it here: ${createdResult.url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    const smsUrl = `sms:?body=${encodeURIComponent(shareText)}`;
    return (
      <div className="page-stack send-page">
        <div className="page-heading send-heading">
          <div><div className="eyebrow">STEP 2 OF 2 · SHARE</div><h1>Your link is ready.</h1><p>Copy it now and send it to the person you have in mind.</p></div>
          <button className="button button-quiet" type="button" onClick={onClearResult}><ArrowLeft size={16} /> Create another</button>
        </div>
        <div className="created-layout">
          <section className="surface-card created-card">
            <div className="created-success-icon"><Check size={25} /></div>
            <div className="created-kicker"><span /> LINK CREATED · DEMO</div>
            <h2>Ready to share,<br />ready to claim.</h2>
            <p className="created-intro">${formatMoney(createdResult.amount)} USDC{createdResult.recipient ? ` for ${createdResult.recipient}` : ''} is now held in a demo escrow.</p>
            <div className="share-link-box">
              <div className="share-link-info"><span>YOUR PRIVATE CLAIM LINK</span><code>{createdResult.url}</code></div>
              <button className="button button-primary copy-main-button" type="button" onClick={() => onCopy(createdResult.id)}><Copy size={16} /> Copy link</button>
            </div>
            <div className="share-buttons">
              <a className="button button-share" href={whatsappUrl} target="_blank" rel="noreferrer"><Send size={15} /> WhatsApp <ExternalLink size={13} /></a>
              <a className="button button-share" href={smsUrl}><Smartphone size={15} /> Text message <ExternalLink size={13} /></a>
            </div>
            <div className="created-warning"><LockKeyhole size={17} /><p><strong>Keep this link safe.</strong> Anyone who has it can claim the funds. The private secret stays in the URL fragment and is only held in this browser session.</p></div>
            <button className="button button-outline claim-preview-button" type="button" onClick={() => onNavigate(`/claim/${createdResult.id}#${createdResult.secret}`)}>Preview the claim page <ArrowRight size={16} /></button>
          </section>
          <aside className="created-side-column">
            <section className="surface-card created-summary-card">
              <span className="summary-label">LINK SUMMARY</span>
              <div className="summary-amount">${formatMoney(createdResult.amount)} <small>USDC</small></div>
              <div className="summary-line"><span>To</span><strong>{createdResult.recipient || 'Anyone with the link'}</strong></div>
              <div className="summary-line"><span>Created</span><strong>{formatDate(createdResult.createdAt, { time: true })}</strong></div>
              <div className="summary-line"><span>Status</span><StatusBadge status="pending" /></div>
              {createdResult.memo && <div className="summary-note"><span>NOTE</span><p>“{createdResult.memo}”</p></div>}
            </section>
            <div className="created-side-note"><ShieldCheck size={18} /><div><strong>Cancel any time</strong><p>If they haven’t claimed the link, cancel it from My links to return the demo funds.</p></div></div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack send-page">
      <div className="page-heading send-heading">
        <div><div className="eyebrow">STEP 1 OF 2 · CREATE</div><h1>Create a money link</h1><p>Choose an amount. We’ll make a private link you can share anywhere.</p></div>
        <div className="step-indicator"><span className="step-current">01</span><span className="step-line" /><span>02</span></div>
      </div>
      <div className="create-layout">
        <form className="surface-card create-form-card" onSubmit={submit} noValidate>
          <div className="form-section-heading"><span className="form-section-icon"><CircleDollarSign size={18} /></span><div><h2>Set up your transfer</h2><p>Every link is funded up front and can be cancelled while unclaimed.</p></div></div>
          <div className="form-field amount-field">
            <label htmlFor="send-amount">How much would you like to send?</label>
            <div className="amount-input-wrap">
              <span className="amount-dollar">$</span>
              <input id="send-amount" type="number" min="0.000001" step="0.000001" inputMode="decimal" placeholder="0.00" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} aria-describedby="amount-help" />
              <span className="amount-currency">USDC</span>
            </div>
            <div className="amount-help" id="amount-help"><span>Available demo balance: <strong>${formatMoney(balance)} USDC</strong></span><button type="button" onClick={() => updateForm('amount', String(balance))}>Use max</button></div>
          </div>
          <div className="form-field">
            <label htmlFor="recipient-name">Who is this for? <span>OPTIONAL</span></label>
            <div className="input-with-icon"><UserRound size={17} /><input id="recipient-name" type="text" maxLength="48" placeholder="Add a name, like Amina" value={form.recipient} onChange={(event) => updateForm('recipient', event.target.value)} /></div>
            <small className="field-hint">A personal touch. The link can still be claimed by anyone who has it.</small>
          </div>
          <div className="form-field">
            <label htmlFor="transfer-note">Add a note <span>OPTIONAL</span></label>
            <div className="input-with-icon textarea-with-icon"><Mail size={17} /><textarea id="transfer-note" rows="3" maxLength="120" placeholder="What’s this transfer for?" value={form.memo} onChange={(event) => updateForm('memo', event.target.value)} /></div>
            <div className="character-count">{form.memo.length}/120</div>
          </div>
          {error && <div className="form-error" role="alert"><CircleAlert size={16} />{error}</div>}
          <div className="form-warning"><LockKeyhole size={17} /><p><strong>Important:</strong> anyone with the link can claim the money. There’s no expiry; you can cancel any unclaimed link at any time.</p></div>
          <button className="button button-primary submit-link-button" type="submit" disabled={submitting}>
            {submitting ? <><LoaderCircle size={17} className="spin-icon" /> Creating your link…</> : <>Create secure link <ArrowRight size={17} /></>}
          </button>
          <div className="form-demo-footnote"><Info size={13} /> Demo only. No real USDC will be sent.</div>
        </form>

        <aside className="create-aside">
          <section className="surface-card live-preview-card">
            <div className="preview-card-heading"><span>LIVE PREVIEW</span><span className="preview-live-dot"><i /> Updates as you type</span></div>
            <div className="preview-recipient-avatar">{form.recipient ? initials(form.recipient) : <UserRound size={21} />}</div>
            <div className="live-preview-amount">${formatMoney(form.amount || 0)} <span>USDC</span></div>
            <p className="live-preview-to">{form.recipient ? `For ${form.recipient}` : 'For whoever claims this link'}</p>
            {form.memo && <div className="live-preview-note">“{form.memo}”</div>}
            <div className="live-preview-divider" />
            <div className="live-preview-foot"><ShieldCheck size={16} /><span>Held securely until claimed or cancelled</span></div>
            <div className="live-preview-tags"><span><LockKeyhole size={12} /> Private</span><span><Clock3 size={12} /> No expiry</span></div>
          </section>
          <section className="aside-tip-card">
            <div className="aside-tip-icon"><Sparkles size={17} /></div>
            <div><strong>Made for sharing</strong><p>WhatsApp, text, email — your link works anywhere you can send a message.</p></div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function LinksPage({ links, onSend, onCopy, onCancel, sessionSecrets }) {
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => {
    const result = filter === 'all' ? links : links.filter((link) => link.status === filter);
    return [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [links, filter]);
  const counts = {
    all: links.length,
    pending: links.filter((link) => link.status === 'pending').length,
    claimed: links.filter((link) => link.status === 'claimed').length,
    cancelled: links.filter((link) => link.status === 'cancelled').length,
  };
  const filters = [
    ['all', 'All links'], ['pending', 'Awaiting claim'], ['claimed', 'Claimed'], ['cancelled', 'Cancelled'],
  ];

  return (
    <div className="page-stack links-page">
      <div className="page-heading">
        <div><div className="eyebrow">YOUR MONEY, YOUR LINKS</div><h1>My links</h1><p>Keep track of every transfer you’ve started.</p></div>
        <button className="button button-primary heading-cta" type="button" onClick={onSend}><Plus size={18} /> Create a link <ArrowRight size={16} /></button>
      </div>
      <section className="surface-card all-links-card">
        <div className="section-heading links-section-heading">
          <div><div className="section-overline">LINK MANAGER</div><h2>All transfers <span className="count-chip">{links.length}</span></h2></div>
          <div className="links-filter-tabs" role="tablist" aria-label="Filter links">
            {filters.map(([value, label]) => (
              <button type="button" key={value} role="tab" aria-selected={filter === value} className={filter === value ? 'filter-tab filter-tab-active' : 'filter-tab'} onClick={() => setFilter(value)}>{label}<span>{counts[value]}</span></button>
            ))}
          </div>
        </div>
        {filtered.length ? (
          <LinkList links={filtered} sessionSecrets={sessionSecrets} onCopy={onCopy} onCancel={onCancel} />
        ) : (
          <div className="filtered-empty">
            <div className="filtered-empty-icon"><Link2 size={21} /></div>
            <h3>{filter === 'all' ? 'No links just yet' : `No ${filter === 'pending' ? 'open' : filter} links`}</h3>
            <p>{filter === 'all' ? 'When you create a money link, it will appear here.' : 'Try a different filter, or create a new link.'}</p>
            {filter === 'all' && <button className="button button-primary small-button" type="button" onClick={onSend}><Plus size={15} /> Create your first link</button>}
          </div>
        )}
      </section>
      <div className="security-footnote"><ShieldCheck size={17} /><span>Claim secrets are kept in your active browser session only. Copy each new link before you leave or refresh.</span></div>
    </div>
  );
}

function ActivityPage({ activity }) {
  const sorted = [...activity].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const display = (event) => {
    if (event.type === 'created') return { title: event.recipient ? `Link created for ${event.recipient}` : 'Money link created', label: 'Funds moved to demo escrow', amount: `−$${formatMoney(event.amount)}`, icon: Send, tone: 'activity-tone-blue' };
    if (event.type === 'claimed') return { title: event.recipient ? `${event.recipient} claimed a link` : 'A money link was claimed', label: 'Claim completed in demo', amount: `$${formatMoney(event.amount)}`, icon: Check, tone: 'activity-tone-green' };
    return { title: event.recipient ? `Link for ${event.recipient} cancelled` : 'Money link cancelled', label: 'Demo funds returned to balance', amount: `+$${formatMoney(event.amount)}`, icon: RotateCcw, tone: 'activity-tone-amber' };
  };

  return (
    <div className="page-stack activity-page">
      <div className="page-heading">
        <div><div className="eyebrow">A CLEAR PAPER TRAIL</div><h1>Activity</h1><p>A simple record of every action in your demo account.</p></div>
      </div>
      <section className="surface-card activity-card">
        <div className="section-heading"><div><div className="section-overline">ACCOUNT HISTORY</div><h2>Recent activity</h2></div><span className="activity-count">{sorted.length} {sorted.length === 1 ? 'event' : 'events'}</span></div>
        {sorted.length ? (
          <div className="activity-list">
            {sorted.map((event) => {
              const item = display(event);
              const Icon = item.icon;
              return (
                <div className="activity-row" key={event.id}>
                  <div className={`activity-event-icon ${item.tone}`}><Icon size={16} /></div>
                  <div className="activity-event-copy"><strong>{item.title}</strong><span>{item.label}</span><small>{formatDate(event.createdAt, { year: true, time: true })}</small></div>
                  <div className={`activity-event-amount ${event.type === 'cancelled' ? 'positive-amount' : ''}`}>{item.amount}<small>USDC</small></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="activity-empty"><div className="activity-empty-icon"><Activity size={21} /></div><h3>Nothing to report — yet.</h3><p>Your Money Link activity will appear here as soon as you create your first link.</p></div>
        )}
      </section>
      <div className="prototype-note"><Info size={14} /><span>This is a local demo history, stored in this browser. It is not an on-chain transaction history.</span></div>
    </div>
  );
}

function ClaimPage({ path, hash, links, onClaim, onNavigate }) {
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const id = decodeURIComponent(path.split('/').filter(Boolean).at(-1) || '');
  const link = links.find((item) => item.id === id);
  const secret = hash.startsWith('#') ? hash.slice(1) : hash;

  const claim = async () => {
    if (!secret || !link) return;
    setClaimError('');
    setClaiming(true);
    const result = await onClaim(link.id, secret);
    setClaiming(false);
    if (!result.ok) setClaimError(result.message);
  };

  let content;
  if (!link) {
    content = (
      <div className="claim-status-view">
        <div className="claim-status-icon claim-status-warning"><Link2 size={23} /></div>
        <div className="eyebrow">LINK NOT FOUND</div>
        <h1>This link isn’t available here.</h1>
        <p>Money Link’s prototype keeps demo links in the browser that created them. Open the link in that same browser to try the claim flow.</p>
        <button className="button button-primary claim-main-button" type="button" onClick={() => onNavigate('/')}>Back to Money Link <ArrowRight size={16} /></button>
      </div>
    );
  } else if (link.status === 'claimed') {
    content = (
      <div className="claim-status-view">
        <div className="claim-status-icon claim-status-success"><Check size={26} /></div>
        <div className="eyebrow">CLAIM COMPLETE · DEMO</div>
        <h1>It’s yours.</h1>
        <p><strong>${formatMoney(link.amount)} USDC</strong> was claimed to the demo recipient wallet. No real funds moved.</p>
        <div className="claim-complete-receipt"><span>CLAIMED</span><strong>${formatMoney(link.amount)} <small>USDC</small></strong><div><CheckCircle2 size={15} /> {formatDate(link.claimedAt || link.createdAt, { year: true, time: true })}</div></div>
        <button className="button button-primary claim-main-button" type="button" onClick={() => onNavigate('/')}>Go to Money Link <ArrowRight size={16} /></button>
      </div>
    );
  } else if (link.status === 'cancelled') {
    content = (
      <div className="claim-status-view">
        <div className="claim-status-icon claim-status-warning"><RotateCcw size={22} /></div>
        <div className="eyebrow">LINK CANCELLED</div>
        <h1>This link has been closed.</h1>
        <p>The sender cancelled the link before it was claimed. The demo funds have been returned to their balance.</p>
        <button className="button button-primary claim-main-button" type="button" onClick={() => onNavigate('/')}>Back to Money Link <ArrowRight size={16} /></button>
      </div>
    );
  } else {
    content = (
      <div className="claim-content">
        <div className="claim-lock-badge"><span><LockKeyhole size={14} /></span> PRIVATE MONEY LINK</div>
        <div className="claim-amount-card">
          <div className="claim-sender-avatar">S</div>
          <span className="claim-from">{link.recipient ? `A link for ${link.recipient}` : 'You’ve received a money link'}</span>
          <div className="claim-amount">${formatMoney(link.amount)} <small>USDC</small></div>
          {link.memo && <p className="claim-note">“{link.memo}”</p>}
          <div className="claim-card-divider" />
          <div className="claim-meta-row"><span>From</span><strong>Samira · Money Link demo</strong></div>
          <div className="claim-meta-row"><span>Sent</span><strong>{formatDate(link.createdAt, { year: true })}</strong></div>
          <div className="claim-meta-row"><span>Receive to</span><strong><span className="demo-wallet-dot" /> Demo wallet</strong></div>
        </div>
        {claimError && <div className="claim-error" role="alert"><CircleAlert size={16} />{claimError}</div>}
        {!secret && <div className="claim-secret-missing"><Info size={15} /> This link is missing its private secret. Use the full link you were sent.</div>}
        <button className="button button-primary claim-main-button" type="button" onClick={claim} disabled={claiming || !secret}>
          {claiming ? <><LoaderCircle size={17} className="spin-icon" /> Claiming…</> : <>Claim ${formatMoney(link.amount)} USDC <ArrowRight size={16} /></>}
        </button>
        <div className="claim-protection"><ShieldCheck size={17} /><span>Only someone with this private link can claim. In the live product, this would be signed to your chosen wallet.</span></div>
      </div>
    );
  }

  return (
    <div className="claim-page">
      <div className="claim-background-orb claim-background-orb-one" /><div className="claim-background-orb claim-background-orb-two" />
      <header className="claim-topbar"><Brand /><SandboxPill compact /></header>
      <main className="claim-main">
        <div className="claim-welcome"><span className="claim-welcome-mark"><Link2 size={17} /></span><span>Money, made simple.</span></div>
        <section className="claim-card">
          {content}
          <div className="claim-card-footer"><span><ShieldCheck size={14} /> Private by design</span><span>Powered by <strong>Money Link</strong></span></div>
        </section>
        <div className="claim-demo-disclaimer"><Info size={14} /> Prototype preview · no real funds or wallet transactions</div>
      </main>
      <footer className="claim-footer"><button type="button" onClick={() => onNavigate('/')}>← Return to Money Link</button><span>Keep your claim link private</span></footer>
    </div>
  );
}

function HowItWorksModal({ onClose }) {
  return (
    <Modal onClose={onClose} className="how-modal">
      <div className="modal-eyebrow"><Sparkles size={14} /> HOW MONEY LINK WORKS</div>
      <h2>Three steps.<br />No complicated hand-off.</h2>
      <p className="modal-intro">Money Link turns a transfer into a private claim link. The real on-chain experience is still in development; this preview shows the product flow.</p>
      <div className="modal-steps">
        <div className="modal-step"><span>01</span><div className="modal-step-icon"><CircleDollarSign size={18} /></div><strong>Create</strong><p>Choose a USDC amount and create a claim link.</p></div>
        <div className="modal-step"><span>02</span><div className="modal-step-icon"><Send size={18} /></div><strong>Share</strong><p>Send the private link by text, email, or chat.</p></div>
        <div className="modal-step"><span>03</span><div className="modal-step-icon"><BadgeCheck size={18} /></div><strong>Claim</strong><p>The recipient opens it and claims to a wallet.</p></div>
      </div>
      <div className="modal-security-note"><LockKeyhole size={17} /><p><strong>Link = access.</strong> Anyone with the full link can claim the funds. In the planned Solana design, the secret stays in the URL fragment and an unclaimed link can be cancelled by its sender.</p></div>
      <button className="button button-primary modal-done-button" type="button" onClick={onClose}>Got it <Check size={16} /></button>
    </Modal>
  );
}

function WalletModal({ balance, onClose, onReset }) {
  return (
    <Modal onClose={onClose} className="wallet-modal">
      <div className="wallet-modal-icon"><Wallet size={21} /></div>
      <div className="modal-eyebrow">SANDBOX ACCOUNT</div>
      <h2>Demo wallet</h2>
      <p className="wallet-modal-intro">A local-only wallet simulation for exploring the Money Link experience.</p>
      <div className="wallet-address-box"><div className="wallet-address-avatar">S</div><div><strong>Samira’s demo wallet</strong><span>8xTq…4mPz · Not a real address</span></div><span className="connected-indicator"><i /> ACTIVE</span></div>
      <div className="wallet-balance-box"><span>AVAILABLE DEMO BALANCE</span><strong>${formatMoney(balance)} <small>USDC</small></strong></div>
      <div className="wallet-modal-warning"><Info size={16} /><span>This prototype is not connected to Phantom, Solflare, or Solana. No private keys or real funds are used.</span></div>
      <div className="wallet-modal-actions"><button className="button button-quiet" type="button" onClick={onReset}><RotateCcw size={15} /> Reset demo</button><button className="button button-primary" type="button" onClick={onClose}>Done <Check size={15} /></button></div>
    </Modal>
  );
}

function CancelModal({ link, onClose, onConfirm }) {
  return (
    <Modal onClose={onClose} className="cancel-modal">
      <div className="cancel-modal-icon"><RotateCcw size={21} /></div>
      <div className="modal-eyebrow">CANCEL MONEY LINK</div>
      <h2>Return this money?</h2>
      <p className="cancel-modal-intro">The link will stop working and <strong>${formatMoney(link.amount)} USDC</strong> will return to your demo balance.</p>
      <div className="cancel-link-detail"><span className="link-person-avatar">{initials(link.recipient || 'Anyone with the link')}</span><div><strong>{link.recipient || 'Anyone with the link'}</strong><span>Created {formatDate(link.createdAt, { year: true })}</span></div><StatusBadge status="pending" /></div>
      <div className="wallet-modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>Keep link active</button><button className="button button-danger" type="button" onClick={onConfirm}>Cancel link <RotateCcw size={15} /></button></div>
    </Modal>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`} role="status">
      <span className="toast-icon">{toast.type === 'error' ? <CircleAlert size={17} /> : <CheckCircle2 size={17} />}</span>
      <span>{toast.message}</span>
      <button type="button" aria-label="Dismiss notification" onClick={onClose}><X size={15} /></button>
    </div>
  );
}

export default function App() {
  const saved = useMemo(readSavedState, []);
  const [balance, setBalance] = useState(saved.balance);
  const [links, setLinks] = useState(saved.links);
  const [activity, setActivity] = useState(saved.activity);
  const [sessionSecrets, setSessionSecrets] = useState({});
  const [createdResult, setCreatedResult] = useState(null);
  const [path, setPath] = useState(() => window.location.pathname.replace(/\/$/, '') || '/');
  const [urlHash, setUrlHash] = useState(() => window.location.hash);
  const [toast, setToast] = useState(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, links, activity }));
    } catch {
      // The product still works for this session if storage is unavailable.
    }
  }, [balance, links, activity]);

  useEffect(() => {
    const syncLocation = () => {
      setPath(window.location.pathname.replace(/\/$/, '') || '/');
      setUrlHash(window.location.hash);
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
    const timer = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message, type = 'success') => setToast({ message, type, id: Date.now() });

  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setPath(window.location.pathname.replace(/\/$/, '') || '/');
    setUrlHash(window.location.hash);
    window.scrollTo(0, 0);
  };

  const goTo = (to) => {
    if (to === '/send') setCreatedResult(null);
    navigate(to);
  };

  const createLink = async ({ amount, recipient, memo }) => {
    if (!window.crypto?.getRandomValues || !window.crypto?.subtle) {
      return { error: 'Secure link generation is not supported in this browser. Try a modern browser over HTTPS.' };
    }
    try {
      const id = randomHex(8);
      const secret = randomHex(32);
      const createdAt = new Date().toISOString();
      const link = {
        id,
        amount,
        recipient: recipient.trim(),
        memo: memo.trim(),
        status: 'pending',
        createdAt,
        claimHash: await hashSecret(secret),
      };
      const result = { ...link, secret, url: `${window.location.origin}/claim/${id}#${secret}` };
      setBalance((current) => roundUsdc(current - amount));
      setLinks((current) => [link, ...current]);
      setActivity((current) => [{ id: randomHex(6), linkId: id, type: 'created', amount, recipient: link.recipient, createdAt }, ...current]);
      setSessionSecrets((current) => ({ ...current, [id]: secret }));
      setCreatedResult(result);
      notify('Your money link is ready to share.');
      return result;
    } catch {
      return { error: 'We couldn’t create a secure link. Please try again.' };
    }
  };

  const claimLink = async (id, secret) => {
    const link = links.find((item) => item.id === id);
    if (!link) return { ok: false, message: 'This link is not available in this browser.' };
    if (link.status !== 'pending') return { ok: false, message: 'This link has already been closed.' };
    try {
      if (await hashSecret(secret) !== link.claimHash) {
        return { ok: false, message: 'This private link is invalid. Make sure you opened the original link you were sent.' };
      }
    } catch {
      return { ok: false, message: 'This browser could not verify the private link.' };
    }
    const claimedAt = new Date().toISOString();
    setLinks((current) => current.map((item) => item.id === id ? { ...item, status: 'claimed', claimedAt, claimedTo: 'Demo recipient wallet' } : item));
    setActivity((current) => [{ id: randomHex(6), linkId: id, type: 'claimed', amount: link.amount, recipient: link.recipient, createdAt: claimedAt }, ...current]);
    setSessionSecrets((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    return { ok: true };
  };

  const copyLinkById = async (id) => {
    const secret = sessionSecrets[id];
    const link = links.find((item) => item.id === id);
    if (!secret || !link) {
      notify('The private link is only available in the browser session where it was created.', 'error');
      return;
    }
    const url = `${window.location.origin}/claim/${id}#${secret}`;
    try {
      await navigator.clipboard.writeText(url);
      notify('Private claim link copied to clipboard.');
    } catch {
      const field = document.createElement('textarea');
      field.value = url;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      notify(copied ? 'Private claim link copied to clipboard.' : 'Copy was blocked. Please copy the link from the share screen.', copied ? 'success' : 'error');
    }
  };

  const cancelLink = (link) => {
    setConfirmCancel(link);
  };

  const confirmCancelLink = () => {
    if (!confirmCancel) return;
    const link = confirmCancel;
    const cancelledAt = new Date().toISOString();
    setLinks((current) => current.map((item) => item.id === link.id && item.status === 'pending' ? { ...item, status: 'cancelled', cancelledAt } : item));
    setBalance((current) => roundUsdc(current + Number(link.amount)));
    setActivity((current) => [{ id: randomHex(6), linkId: link.id, type: 'cancelled', amount: link.amount, recipient: link.recipient, createdAt: cancelledAt }, ...current]);
    setSessionSecrets((current) => {
      const next = { ...current };
      delete next[link.id];
      return next;
    });
    setConfirmCancel(null);
    notify(`$${formatMoney(link.amount)} USDC returned to your demo balance.`);
  };

  const resetDemo = () => {
    setBalance(STARTING_BALANCE);
    setLinks([]);
    setActivity([]);
    setSessionSecrets({});
    setCreatedResult(null);
    setWalletOpen(false);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    notify('Demo account reset.');
  };

  const isClaimRoute = path.startsWith('/claim/');
  if (isClaimRoute) {
    return <ClaimPage path={path} hash={urlHash} links={links} onClaim={claimLink} onNavigate={navigate} />;
  }

  const pageTitle = path === '/send' ? (createdResult ? 'Link ready' : 'Create a link') : path === '/links' ? 'My links' : path === '/activity' ? 'Activity' : 'Overview';
  return (
    <div className="app-shell">
      <Sidebar path={path} links={links} onNavigate={goTo} onHelp={() => setHelpOpen(true)} />
      <div className="app-main">
        <Topbar title={pageTitle} onWalletClick={() => setWalletOpen(true)} onHelp={() => setHelpOpen(true)} />
        <main className="main-content">
          {path === '/' && <OverviewPage balance={balance} links={links} onSend={() => goTo('/send')} onNavigate={goTo} onHelp={() => setHelpOpen(true)} onCopy={copyLinkById} onCancel={cancelLink} sessionSecrets={sessionSecrets} />}
          {path === '/send' && <CreatePage balance={balance} createdResult={createdResult} onCreate={createLink} onClearResult={() => setCreatedResult(null)} onCopy={copyLinkById} onNavigate={navigate} />}
          {path === '/links' && <LinksPage links={links} onSend={() => goTo('/send')} onCopy={copyLinkById} onCancel={cancelLink} sessionSecrets={sessionSecrets} />}
          {path === '/activity' && <ActivityPage activity={activity} />}
          {!['/', '/send', '/links', '/activity'].includes(path) && (
            <div className="not-found-card surface-card"><div className="not-found-icon"><Link2 size={21} /></div><h1>Page not found</h1><p>That Money Link page doesn’t exist.</p><button className="button button-primary" type="button" onClick={() => navigate('/')}>Go home <ArrowRight size={16} /></button></div>
          )}
        </main>
      </div>
      <Navigation path={path} links={links} onNavigate={goTo} onHelp={() => setHelpOpen(true)} mobile />
      {helpOpen && <HowItWorksModal onClose={() => setHelpOpen(false)} />}
      {walletOpen && <WalletModal balance={balance} onClose={() => setWalletOpen(false)} onReset={resetDemo} />}
      {confirmCancel && <CancelModal link={confirmCancel} onClose={() => setConfirmCancel(null)} onConfirm={confirmCancelLink} />}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
