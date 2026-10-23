import { CHAPTERS, SLIDES } from './data/slidesData.js';
import { renderDiagram } from './components/umlDiagrams.js';
import { highlightJava, escapeHtml } from './utils/javaHighlighter.js';
import {
  createInitialSimState,
  createSimulatorHtml,
  handleSimAction
} from './components/simulators.js';

const state = {
  currentSlide: 0,
  activeTabs: {}, // slideId -> tabId | '__sim__'
  showNotes: false,
  showOverview: false,
  copiedSlide: null,
  quizAnswers: {}, // qIdx -> optionIdx
  quizIdx: 0,
  sim: createInitialSimState()
};

function getCurrentChapterId(slideIndex) {
  let active = CHAPTERS[0].id;
  for (const ch of CHAPTERS) {
    if (slideIndex >= ch.startSlide) active = ch.id;
  }
  return active;
}

function getActiveTabId(slide) {
  if (!slide.tabs || slide.tabs.length === 0) return null;
  return state.activeTabs[slide.id] || slide.tabs[0].id;
}

function renderHeaderHtml(slide) {
  return `
    <header class="slide-header">
      <div>
        <div class="slide-eyebrow">
          <span>${escapeHtml(slide.eyebrow)}</span>
          ${slide.badge ? `<span class="eyebrow-badge">${escapeHtml(slide.badge)}</span>` : ''}
        </div>
        <h1 class="slide-title">
          ${escapeHtml(slide.titlePlain)}<span class="text-aura">${escapeHtml(slide.titleAura)}</span>
        </h1>
        <p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>
      </div>
    </header>
  `;
}

function renderIdeWindow(slide, forceFirstTab = false) {
  const activeId = forceFirstTab ? slide.tabs[0].id : getActiveTabId(slide);
  const isSim = activeId === '__sim__' && slide.simulator;
  const activeTabObj = slide.tabs.find((t) => t.id === activeId) || slide.tabs[0];

  const tabsHtml = slide.tabs
    .map((t) => {
      const cls = [
        'ide-tab',
        t.kind === 'bad' ? 'tab-bad' : t.kind === 'good' ? 'tab-good' : '',
        !isSim && t.id === activeTabObj.id ? 'active' : ''
      ]
        .filter(Boolean)
        .join(' ');
      return `<button class="${cls}" data-tab-slide="${slide.id}" data-tab-id="${t.id}">${escapeHtml(t.label)}</button>`;
    })
    .join('');

  const simTabHtml = slide.simulator
    ? `<button class="ide-tab tab-sim ${isSim ? 'active' : ''}" data-tab-slide="${slide.id}" data-tab-id="__sim__">▶ Démo Live</button>`
    : '';

  return `
    <div class="ide-window">
      <div class="ide-header">
        <div class="ide-dots" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="ide-tabs">${tabsHtml}${simTabHtml}</div>
        ${
          !isSim
            ? `<button class="copy-code-btn" data-copy-slide="${slide.id}">
                ${state.copiedSlide === slide.id ? '✓ Copié' : 'Copier Java'}
              </button>`
            : ''
        }
      </div>
      ${
        isSim
          ? createSimulatorHtml(slide.simulator, state.sim)
          : `<div class="ide-body">${highlightJava(activeTabObj.code)}</div>`
      }
    </div>
  `;
}

function renderSlideBody(slide, isPrint = false) {
  if (slide.layout === 'cover') {
    return `
      <section class="cover-hero">
        <div>
          <div class="cover-kicker">
            <span class="brand-dot"></span>
            <span>${escapeHtml(slide.kicker)}</span>
          </div>
          <h1 class="cover-title">
            ${escapeHtml(slide.titlePlain)}<br />
            <span class="text-aura">${escapeHtml(slide.titleAura)}</span>
          </h1>
          <p class="cover-lead">${escapeHtml(slide.subtitle)}</p>
          <div class="cover-pills">
            ${slide.chips.map((c) => `<span class="topic-chip">${escapeHtml(c)}</span>`).join('')}
          </div>
          ${
            !isPrint
              ? `<button class="cta-start-btn" data-nav="next">
                  <span>Démarrer la présentation</span>
                  <span>→</span>
                </button>`
              : ''
          }
        </div>
        <div class="aura-card" style="padding: 20px;">
          <div class="card-label">CARTOGRAPHIE DU COURS · ARCHITECTURE OBJET</div>
          <div class="uml-box" style="min-height: 270px; background: transparent; border: none; padding: 0;">
            ${renderDiagram(slide.diagram, isPrint ? 'print' : 'screen')}
          </div>
        </div>
      </section>
    `;
  }

  if (slide.layout === 'pillars') {
    return `
      ${renderHeaderHtml(slide)}
      <div class="cards-grid-5">
        ${slide.pillars
          .map(
            (p) => `
          <div class="aura-card aura-card-interactive" data-goto="${p.targetSlide}">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:32px;font-weight:800;font-family:var(--font-mono);color:var(--aura-cyan);line-height:1;">
                ${escapeHtml(p.letter)}
              </span>
              <span class="brand-tag">Java + UML →</span>
            </div>
            <div class="card-title">${escapeHtml(p.name)}</div>
            <div class="card-label" style="color:#bae6fd;">${escapeHtml(p.fr)}</div>
            <p class="card-text">${escapeHtml(p.summary)}</p>
          </div>
        `
          )
          .join('')}
      </div>
      <div class="mini-box info" style="margin-top:16px;text-align:center;font-size:13.5px;">
        <strong>Synthèse Architecturale</strong>
        ${escapeHtml(slide.bottomBanner)}
      </div>
    `;
  }

  if (slide.layout === 'taxonomy') {
    return `
      ${renderHeaderHtml(slide)}
      <div class="cards-grid-3">
        ${slide.families
          .map(
            (f) => `
          <div class="aura-card">
            <div class="card-label">${escapeHtml(f.tag)}</div>
            <div class="card-title">${escapeHtml(f.title)}</div>
            <p class="card-text">${escapeHtml(f.desc)}</p>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
              ${f.patterns
                .map(
                  (pat) => `
                <div class="mini-box info aura-card-interactive" data-goto="${pat.slide}">
                  <strong style="color:var(--aura-cyan);">★ ${escapeHtml(pat.name)} →</strong>
                  ${escapeHtml(pat.focus)}
                </div>
              `
                )
                .join('')}
            </div>
            <div style="margin-top:auto;padding-top:8px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">
              ${escapeHtml(f.others)}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  if (slide.layout === 'matrix') {
    return `
      ${renderHeaderHtml(slide)}
      <div class="aura-card" style="padding: 0; overflow: hidden;">
        <table class="aura-table">
          <thead>
            <tr>
              <th>Patron GoF</th>
              <th>Famille</th>
              <th>Alignement SOLID</th>
              <th>Justification Architecturale</th>
              <th>Exemple Réel Java JDK</th>
            </tr>
          </thead>
          <tbody>
            ${slide.rows
              .map(
                (r) => `
              <tr>
                <td style="font-family:var(--font-mono);font-weight:700;color:#f8fafc;">${escapeHtml(r.pattern)}</td>
                <td style="font-family:var(--font-mono);color:#93c5fd;">${escapeHtml(r.family)}</td>
                <td>
                  <span class="${r.solidStatus === 'yes' ? 'pill-yes' : 'pill-warn'}">
                    ${escapeHtml(r.solidLabel)}
                  </span>
                </td>
                <td>${escapeHtml(r.solidExplain)}</td>
                <td style="font-family:var(--font-mono);font-size:11.8px;color:#bae6fd;">${escapeHtml(r.jdkExample)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (slide.layout === 'conclusion') {
    const qIndex = state.quizIdx;
    const currentQ = slide.quiz[qIndex];
    const chosen = state.quizAnswers[qIndex];

    return `
      ${renderHeaderHtml(slide)}
      <div class="split-grid">
        <div class="aura-card">
          <div class="card-label">LES 3 MAXIMES DU GANG OF FOUR</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${slide.maxims
              .map(
                (m) => `
              <div class="mini-box info">
                <strong style="color:var(--aura-cyan);">${m.num} · ${escapeHtml(m.title)}</strong>
                ${escapeHtml(m.body)}
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="aura-card">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span class="card-label">QUIZ INTERACTIF DE SOUTENANCE (${qIndex + 1} / ${slide.quiz.length})</span>
            <div style="display:flex;gap:6px;">
              ${slide.quiz
                .map(
                  (_, idx) => `
                <button class="ide-tab ${idx === qIndex ? 'active' : ''}" data-quiz-step="${idx}">
                  Cas ${idx + 1}
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="card-title" style="font-size:15px;line-height:1.45;">
            ${escapeHtml(currentQ.q)}
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${currentQ.options
              .map((opt, oIdx) => {
                let cls = 'quiz-option';
                if (chosen !== undefined) {
                  if (oIdx === currentQ.answer) cls += ' correct';
                  else if (oIdx === chosen) cls += ' wrong';
                }
                return `<button class="${cls}" data-quiz-pick="${oIdx}">${escapeHtml(opt)}</button>`;
              })
              .join('')}
          </div>

          ${
            chosen !== undefined
              ? `<div class="mini-box ${chosen === currentQ.answer ? 'good' : 'bad'}">
                  <strong>${chosen === currentQ.answer ? '✓ Bonne réponse !' : '✗ Réponse attendue : ' + currentQ.options[currentQ.answer]}</strong>
                  ${escapeHtml(currentQ.explain)}
                </div>`
              : `<div class="mini-box info">
                  <strong>Interaction avec l’auditoire</strong>
                  Cliquez sur une réponse pour vérifier et afficher la justification POO.
                </div>`
          }
        </div>
      </div>
    `;
  }

  // Default: 2-Column Engineering Split Layout (Concept + UML on Left, Java IDE + Live Sim on Right)
  const lc = slide.leftCard;
  return `
    ${renderHeaderHtml(slide)}
    <div class="split-grid">
      <div class="aura-card">
        ${slide.diagram ? `<div class="uml-box">${renderDiagram(slide.diagram, isPrint ? 'print' : 'screen')}</div>` : ''}
        <div class="card-label">${escapeHtml(lc.label)}</div>
        <div class="card-title">${escapeHtml(lc.title)}</div>
        <ul class="bullet-list">
          ${lc.bullets
            .map((b) => `<li><span class="bullet-dot"></span><span>${escapeHtml(b)}</span></li>`)
            .join('')}
        </ul>
        ${
          lc.callouts
            ? `<div class="callout-row">
                ${lc.callouts
                  .map(
                    (c) => `
                  <div class="mini-box ${c.type}">
                    <strong>${escapeHtml(c.title)}</strong>
                    ${escapeHtml(c.body)}
                  </div>
                `
                  )
                  .join('')}
              </div>`
            : ''
        }
      </div>

      ${renderIdeWindow(slide, isPrint)}
    </div>
  `;
}

function renderApp() {
  const app = document.getElementById('app');
  const slide = SLIDES[state.currentSlide];
  const currentChapter = getCurrentChapterId(state.currentSlide);
  const progressPct = ((state.currentSlide + 1) / SLIDES.length) * 100;

  app.innerHTML = `
    <!-- TOP BAR -->
    <nav class="deck-topbar" aria-label="Navigation des chapitres">
      <div class="brand-pill">
        <span class="brand-dot"></span>
        <span>GoF &amp; SOLID</span>
        <span class="brand-tag">JAVA 21</span>
      </div>

      <div class="chapter-nav">
        ${CHAPTERS.map(
          (ch) => `
          <button class="chapter-btn ${ch.id === currentChapter ? 'active' : ''}" data-goto="${ch.startSlide}">
            ${escapeHtml(ch.label)}
          </button>
        `
        ).join('')}
      </div>

      <div class="toolbar-actions">
        <button class="icon-btn ${state.showNotes ? 'active' : ''}" data-action="toggle-notes" title="Notes d'orateur (Touche N)">
          <span>Notes</span>
          <span class="kbd-hint">N</span>
        </button>
        <button class="icon-btn ${state.showOverview ? 'active' : ''}" data-action="toggle-overview" title="Grille des slides (Touche G)">
          <span>Grille</span>
          <span class="kbd-hint">G</span>
        </button>
        <button class="icon-btn" data-action="print-pdf" title="Exporter / Imprimer en PDF (Touche P)">
          <span>PDF</span>
          <span class="kbd-hint">P</span>
        </button>
        <button class="icon-btn" data-action="fullscreen" title="Plein écran (Touche F)">
          <span>Plein écran</span>
          <span class="kbd-hint">F</span>
        </button>
      </div>
    </nav>

    <!-- MAIN SLIDE VIEWPORT -->
    <main class="slide-stage">
      <div class="slide-container" key="${slide.id}">
        ${renderSlideBody(slide, false)}
      </div>
    </main>

    <!-- BOTTOM PROGRESS & CONTROLS -->
    <footer class="deck-bottombar">
      <div class="progress-track">
        <div class="progress-fill" style="width: ${progressPct.toFixed(2)}%;"></div>
      </div>

      <div class="slide-counter">
        Slide <strong>${String(state.currentSlide + 1).padStart(2, '0')}</strong> / ${String(SLIDES.length).padStart(2, '0')}
      </div>

      <div class="dots-strip" role="tablist" aria-label="Accès rapide aux slides">
        ${SLIDES.map(
          (s, idx) => `
          <button
            class="slide-dot ${idx === state.currentSlide ? 'active' : ''}"
            data-goto="${idx}"
            title="${idx + 1}. ${escapeHtml(s.titlePlain + s.titleAura)}"
          ></button>
        `
        ).join('')}
      </div>

      <div class="nav-controls">
        <button class="icon-btn" data-nav="prev" ${state.currentSlide === 0 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
          <span>← Précédent</span>
        </button>
        <button class="icon-btn" data-nav="next" ${state.currentSlide === SLIDES.length - 1 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
          <span>Suivant →</span>
        </button>
      </div>
    </footer>

    ${
      state.showNotes
        ? `
      <aside class="notes-drawer" role="region" aria-label="Notes d'orateur">
        <div class="notes-drawer-header">
          <span>🎙️ GUIDE D’ORATEUR — SLIDE ${state.currentSlide + 1}/${SLIDES.length}</span>
          <button class="copy-code-btn" data-action="toggle-notes">Fermer (N)</button>
        </div>
        <p>${escapeHtml(slide.speakerNotes)}</p>
      </aside>
    `
        : ''
    }

    ${
      state.showOverview
        ? `
      <div class="overview-modal" role="dialog" aria-label="Vue d'ensemble des slides">
        <div style="max-width:1320px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div class="slide-eyebrow">NAVIGATION RAPIDE</div>
            <h2 class="slide-title" style="font-size:24px;">Vue d’ensemble des ${SLIDES.length} slides</h2>
          </div>
          <button class="icon-btn" data-action="toggle-overview">Fermer (Échap)</button>
        </div>
        <div class="overview-grid">
          ${SLIDES.map(
            (s, idx) => `
            <button class="overview-card ${idx === state.currentSlide ? 'current' : ''}" data-goto="${idx}">
              <div class="card-label">SLIDE ${String(idx + 1).padStart(2, '0')}</div>
              <div class="card-title" style="margin:6px 0;font-size:15px;">
                ${escapeHtml(s.titlePlain + s.titleAura)}
              </div>
              <p class="card-text" style="font-size:12px;">${escapeHtml(s.subtitle.slice(0, 92))}…</p>
            </button>
          `
          ).join('')}
        </div>
      </div>
    `
        : ''
    }
  `;
}

function goToSlide(index) {
  const clamped = Math.max(0, Math.min(SLIDES.length - 1, index));
  state.currentSlide = clamped;
  state.showOverview = false;
  renderApp();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

function triggerPrintDeck() {
  let printRoot = document.querySelector('.print-deck');
  if (!printRoot) {
    printRoot = document.createElement('div');
    printRoot.className = 'print-deck';
    document.body.appendChild(printRoot);
  }
  printRoot.innerHTML = SLIDES.map(
    (s) => `<section class="print-slide">${renderSlideBody(s, true)}</section>`
  ).join('');
  window.print();
}

document.addEventListener('click', (e) => {
  const navBtn = e.target.closest('[data-nav]');
  if (navBtn) {
    const dir = navBtn.dataset.nav;
    goToSlide(dir === 'next' ? state.currentSlide + 1 : state.currentSlide - 1);
    return;
  }

  const gotoEl = e.target.closest('[data-goto]');
  if (gotoEl) {
    goToSlide(parseInt(gotoEl.dataset.goto, 10));
    return;
  }

  const tabBtn = e.target.closest('[data-tab-id]');
  if (tabBtn) {
    state.activeTabs[tabBtn.dataset.tabSlide] = tabBtn.dataset.tabId;
    renderApp();
    return;
  }

  const copyBtn = e.target.closest('[data-copy-slide]');
  if (copyBtn) {
    const slide = SLIDES.find((s) => s.id === copyBtn.dataset.copySlide);
    if (slide) {
      const tabId = getActiveTabId(slide);
      const tab = slide.tabs.find((t) => t.id === tabId) || slide.tabs[0];
      navigator.clipboard?.writeText(tab.code).then(() => {
        state.copiedSlide = slide.id;
        renderApp();
        setTimeout(() => {
          state.copiedSlide = null;
          renderApp();
        }, 1500);
      });
    }
    return;
  }

  const simBtn = e.target.closest('[data-sim-action]');
  if (simBtn) {
    handleSimAction(simBtn.dataset.simAction, simBtn.dataset, state.sim);
    renderApp();
    return;
  }

  const quizStepBtn = e.target.closest('[data-quiz-step]');
  if (quizStepBtn) {
    state.quizIdx = parseInt(quizStepBtn.dataset.quizStep, 10);
    renderApp();
    return;
  }

  const quizPickBtn = e.target.closest('[data-quiz-pick]');
  if (quizPickBtn) {
    state.quizAnswers[state.quizIdx] = parseInt(quizPickBtn.dataset.quizPick, 10);
    renderApp();
    return;
  }

  const actionBtn = e.target.closest('[data-action]');
  if (actionBtn) {
    const act = actionBtn.dataset.action;
    if (act === 'toggle-notes') {
      state.showNotes = !state.showNotes;
      renderApp();
    } else if (act === 'toggle-overview') {
      state.showOverview = !state.showOverview;
      renderApp();
    } else if (act === 'fullscreen') {
      toggleFullscreen();
    } else if (act === 'print-pdf') {
      triggerPrintDeck();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault();
    goToSlide(state.currentSlide + 1);
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    goToSlide(state.currentSlide - 1);
  } else if (e.key === 'Home') {
    e.preventDefault();
    goToSlide(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    goToSlide(SLIDES.length - 1);
  } else if (e.key === 'n' || e.key === 'N') {
    state.showNotes = !state.showNotes;
    renderApp();
  } else if (e.key === 'g' || e.key === 'G') {
    state.showOverview = !state.showOverview;
    renderApp();
  } else if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
  } else if (e.key === 'p' || e.key === 'P') {
    triggerPrintDeck();
  } else if (e.key === 'Escape' && (state.showOverview || state.showNotes)) {
    state.showOverview = false;
    state.showNotes = false;
    renderApp();
  }
});

renderApp();
