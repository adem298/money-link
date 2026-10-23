function makeDefs(p) {
  return `
    <defs>
      <linearGradient id="${p}-boxGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0d1e3d"/>
        <stop offset="100%" stop-color="#061022"/>
      </linearGradient>
      <linearGradient id="${p}-ifaceGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0c284e"/>
        <stop offset="100%" stop-color="#07152c"/>
      </linearGradient>
      <marker id="${p}-hollowTri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto">
        <path d="M 1 1 L 11 6 L 1 11 Z" fill="#040a17" stroke="#38bdf8" stroke-width="1.6"/>
      </marker>
      <marker id="${p}-openArrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M 1 2 L 10 6 L 1 10" fill="none" stroke="#7dd3fc" stroke-width="1.6"/>
      </marker>
    </defs>
  `;
}

const DIAGRAM_BUILDERS = {
  heroArchitecture: (p) => `
    <svg viewBox="0 0 540 310" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Architecture SOLID et GoF">
      ${makeDefs(p)}
      <circle cx="270" cy="155" r="132" fill="none" stroke="rgba(56,189,248,0.14)" stroke-dasharray="4 6"/>
      <circle cx="270" cy="155" r="92" fill="rgba(14,165,233,0.06)" stroke="rgba(56,189,248,0.28)"/>

      <rect x="195" y="122" width="150" height="66" rx="12" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8" stroke-width="1.8"/>
      <text x="270" y="149" text-anchor="middle" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">CLEAN OOP JAVA</text>
      <text x="270" y="170" text-anchor="middle" fill="#f8fafc" font-family="Inter, sans-serif" font-size="14" font-weight="800">SOLID × GoF</text>

      <rect x="150" y="18" width="240" height="52" rx="10" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.45)"/>
      <text x="270" y="38" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">5 PRINCIPES DIRECTEURS</text>
      <text x="270" y="57" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700">S · O · L · I · D</text>
      <line x1="270" y1="70" x2="270" y2="120" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#${p}-openArrow)"/>

      <rect x="16" y="124" width="142" height="62" rx="10" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.38)"/>
      <text x="87" y="145" text-anchor="middle" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="10">CRÉATION</text>
      <text x="87" y="163" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="600">Singleton</text>
      <text x="87" y="178" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="600">Factory</text>
      <line x1="158" y1="155" x2="193" y2="155" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="4 3"/>

      <rect x="382" y="124" width="142" height="62" rx="10" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.38)"/>
      <text x="453" y="145" text-anchor="middle" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="10">STRUCTURE</text>
      <text x="453" y="167" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600">Decorator</text>
      <line x1="382" y1="155" x2="347" y2="155" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="4 3"/>

      <rect x="150" y="236" width="240" height="56" rx="10" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.45)"/>
      <text x="270" y="256" text-anchor="middle" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="10">COMPORTEMENT</text>
      <text x="270" y="276" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="600">Strategy · Observer</text>
      <line x1="270" y1="236" x2="270" y2="190" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#${p}-openArrow)"/>
    </svg>
  `,

  srp: (p) => `
    <svg viewBox="0 0 560 205" xmlns="http://www.w3.org/2000/svg">
      ${makeDefs(p)}
      <rect x="16" y="42" width="165" height="120" rx="8" fill="#1a0c14" stroke="rgba(248,113,113,0.55)"/>
      <text x="98" y="64" text-anchor="middle" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="700">❌ ReportManager</text>
      <line x1="16" y1="74" x2="181" y2="74" stroke="rgba(248,113,113,0.3)"/>
      <text x="28" y="96" fill="#fecaca" font-family="JetBrains Mono, monospace" font-size="10.5">+ calculateStats()</text>
      <text x="28" y="116" fill="#fecaca" font-family="JetBrains Mono, monospace" font-size="10.5">+ formatPdf()</text>
      <text x="28" y="136" fill="#fecaca" font-family="JetBrains Mono, monospace" font-size="10.5">+ saveToDatabase()</text>

      <line x1="194" y1="102" x2="256" y2="102" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#${p}-openArrow)"/>
      <text x="225" y="92" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">SRP</text>

      <rect x="270" y="14" width="272" height="50" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(52,211,153,0.5)"/>
      <text x="286" y="35" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">✅ Report</text>
      <text x="286" y="53" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="10.5">1 raison : logique métier</text>

      <rect x="270" y="77" width="272" height="50" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(52,211,153,0.5)"/>
      <text x="286" y="98" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">✅ ReportPdfFormatter</text>
      <text x="286" y="116" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="10.5">1 raison : mise en page PDF</text>

      <rect x="270" y="140" width="272" height="50" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(52,211,153,0.5)"/>
      <text x="286" y="161" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">✅ ReportRepository</text>
      <text x="286" y="179" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="10.5">1 raison : persistance SQL</text>
    </svg>
  `,

  ocp: (p) => `
    <svg viewBox="0 0 560 210" xmlns="http://www.w3.org/2000/svg">
      ${makeDefs(p)}
      <rect x="175" y="14" width="210" height="64" rx="8" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8" stroke-width="1.6"/>
      <text x="280" y="33" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">«interface»</text>
      <text x="280" y="49" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">DiscountPolicy</text>
      <line x1="175" y1="57" x2="385" y2="57" stroke="rgba(56,189,248,0.28)"/>
      <text x="280" y="72" text-anchor="middle" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-size="10.5">+ apply(double price)</text>

      <rect x="14" y="136" width="164" height="54" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="96" y="159" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">StudentDiscount</text>
      <text x="96" y="177" text-anchor="middle" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="10">price * 0.85</text>

      <rect x="198" y="136" width="164" height="54" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="280" y="159" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">VipDiscount</text>
      <text x="280" y="177" text-anchor="middle" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="10">price * 0.70</text>

      <rect x="382" y="136" width="164" height="54" rx="8" fill="#07221d" stroke="#34d399" stroke-dasharray="4 3"/>
      <text x="464" y="159" text-anchor="middle" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">+ BlackFriday</text>
      <text x="464" y="177" text-anchor="middle" fill="#a7f3d0" font-family="JetBrains Mono, monospace" font-size="10">Extension sans modif !</text>

      <line x1="96" y1="136" x2="235" y2="80" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="280" y1="136" x2="280" y2="80" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="464" y1="136" x2="325" y2="80" stroke="#34d399" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
    </svg>
  `,

  lsp: (p) => `
    <svg viewBox="0 0 560 205" xmlns="http://www.w3.org/2000/svg">
      ${makeDefs(p)}
      <rect x="20" y="20" width="175" height="50" rx="8" fill="#1a0c14" stroke="rgba(248,113,113,0.45)"/>
      <text x="107" y="42" text-anchor="middle" fill="#fecaca" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">Rectangle</text>
      <text x="107" y="59" text-anchor="middle" fill="#fca5a5" font-family="JetBrains Mono, monospace" font-size="10">setWidth() / setHeight()</text>

      <rect x="20" y="128" width="175" height="52" rx="8" fill="#1a0c14" stroke="rgba(248,113,113,0.55)"/>
      <text x="107" y="150" text-anchor="middle" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">❌ Square</text>
      <text x="107" y="168" text-anchor="middle" fill="#fecaca" font-family="JetBrains Mono, monospace" font-size="10">Casse le contrat w*h !</text>
      <line x1="107" y1="128" x2="107" y2="72" stroke="#f87171" stroke-width="1.5" marker-end="url(#${p}-hollowTri)"/>

      <rect x="315" y="18" width="190" height="56" rx="8" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8" stroke-width="1.6"/>
      <text x="410" y="37" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">«interface»</text>
      <text x="410" y="55" text-anchor="middle" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">✅ Shape { area() }</text>

      <rect x="270" y="128" width="130" height="52" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(52,211,153,0.45)"/>
      <text x="335" y="152" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">Rectangle</text>
      <text x="335" y="169" text-anchor="middle" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="10">w * h</text>

      <rect x="418" y="128" width="126" height="52" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(52,211,153,0.45)"/>
      <text x="481" y="152" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">Square</text>
      <text x="481" y="169" text-anchor="middle" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="10">side * side</text>

      <line x1="335" y1="128" x2="390" y2="76" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="481" y1="128" x2="430" y2="76" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
    </svg>
  `,

  isp: (p) => `
    <svg viewBox="0 0 560 205" xmlns="http://www.w3.org/2000/svg">
      ${makeDefs(p)}
      <rect x="30" y="16" width="148" height="52" rx="8" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8"/>
      <text x="104" y="36" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">«interface»</text>
      <text x="104" y="54" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="700">Printable</text>

      <rect x="206" y="16" width="148" height="52" rx="8" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8"/>
      <text x="280" y="36" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">«interface»</text>
      <text x="280" y="54" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="700">Scannable</text>

      <rect x="382" y="16" width="148" height="52" rx="8" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8"/>
      <text x="456" y="36" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">«interface»</text>
      <text x="456" y="54" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="700">Faxable</text>

      <rect x="22" y="134" width="180" height="54" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(52,211,153,0.5)"/>
      <text x="112" y="157" text-anchor="middle" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">BasicPrinter</text>
      <text x="112" y="174" text-anchor="middle" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="10">Implémente juste print()</text>

      <rect x="330" y="134" width="206" height="54" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.5)"/>
      <text x="433" y="157" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">OfficeMultifunction</text>
      <text x="433" y="174" text-anchor="middle" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="10">Combine les 3 interfaces</text>

      <line x1="112" y1="134" x2="104" y2="70" stroke="#34d399" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="395" y1="134" x2="135" y2="70" stroke="#38bdf8" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="433" y1="134" x2="285" y2="70" stroke="#38bdf8" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="465" y1="134" x2="456" y2="70" stroke="#38bdf8" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
    </svg>
  `,

  dip: (p) => `
    <svg viewBox="0 0 560 205" xmlns="http://www.w3.org/2000/svg">
      ${makeDefs(p)}
      <rect x="20" y="72" width="160" height="62" rx="8" fill="url(#${p}-boxGrad)" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="100" y="96" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="700">OrderService</text>
      <text x="100" y="116" text-anchor="middle" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="10">(Haut niveau métier)</text>

      <rect x="215" y="68" width="155" height="70" rx="8" fill="url(#${p}-ifaceGrad)" stroke="#34d399" stroke-width="1.7"/>
      <text x="292" y="89" text-anchor="middle" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="10">«interface»</text>
      <text x="292" y="107" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="700">MessageSender</text>
      <text x="292" y="125" text-anchor="middle" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-size="10">+ send(to, msg)</text>

      <rect x="408" y="24" width="136" height="52" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.42)"/>
      <text x="476" y="48" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">SmtpEmailSender</text>
      <text x="476" y="64" text-anchor="middle" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="9.8">Détail bas niveau</text>

      <rect x="408" y="130" width="136" height="52" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.42)"/>
      <text x="476" y="154" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">TwilioSmsSender</text>
      <text x="476" y="170" text-anchor="middle" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="9.8">Détail bas niveau</text>

      <line x1="180" y1="103" x2="213" y2="103" stroke="#38bdf8" stroke-width="1.6" marker-end="url(#${p}-openArrow)"/>
      <line x1="408" y1="50" x2="372" y2="90" stroke="#34d399" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="408" y1="156" x2="372" y2="116" stroke="#34d399" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
    </svg>
  `,

  singleton: (p) => `
    <svg viewBox="0 0 560 205" xmlns="http://www.w3.org/2000/svg">
      ${makeDefs(p)}
      <rect x="20" y="30" width="130" height="44" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.38)"/>
      <text x="85" y="56" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="11">AuthService</text>

      <rect x="20" y="130" width="130" height="44" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.38)"/>
      <text x="85" y="156" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="11">OrderService</text>

      <rect x="225" y="28" width="305" height="150" rx="10" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8" stroke-width="1.8"/>
      <text x="377" y="52" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700">DatabaseConnection</text>
      <line x1="225" y1="62" x2="530" y2="62" stroke="rgba(56,189,248,0.35)"/>
      <text x="240" y="84" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10.8" text-decoration="underline">- volatile instance : DatabaseConnection</text>
      <line x1="225" y1="96" x2="530" y2="96" stroke="rgba(56,189,248,0.35)"/>
      <text x="240" y="118" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="10.8">- DatabaseConnection()  // privé !</text>
      <text x="240" y="140" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="10.8" text-decoration="underline">+ getInstance() : DatabaseConnection</text>
      <text x="240" y="161" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="10.8">+ query(sql : String) : void</text>

      <line x1="150" y1="52" x2="223" y2="90" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#${p}-openArrow)"/>
      <line x1="150" y1="152" x2="223" y2="115" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#${p}-openArrow)"/>
    </svg>
  `,

  factory: (p) => `
    <svg viewBox="0 0 560 215" xmlns="http://www.w3.org/2000/svg">
      ${makeDefs(p)}
      <rect x="16" y="22" width="196" height="68" rx="8" fill="url(#${p}-boxGrad)" stroke="#38bdf8" stroke-width="1.6"/>
      <text x="114" y="45" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">NotificationFactory</text>
      <line x1="16" y1="54" x2="212" y2="54" stroke="rgba(56,189,248,0.3)"/>
      <text x="114" y="75" text-anchor="middle" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="10.5">+ create(type) : Notification</text>

      <rect x="305" y="18" width="225" height="72" rx="8" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8" stroke-width="1.7"/>
      <text x="417" y="37" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">«interface»</text>
      <text x="417" y="54" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">Notification</text>
      <line x1="305" y1="62" x2="530" y2="62" stroke="rgba(56,189,248,0.3)"/>
      <text x="417" y="80" text-anchor="middle" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-size="10.5">+ notifyUser(msg : String)</text>

      <line x1="212" y1="56" x2="303" y2="56" stroke="#7dd3fc" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#${p}-openArrow)"/>
      <text x="258" y="47" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="9.5">«creates»</text>

      <rect x="195" y="146" width="112" height="50" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="251" y="175" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">EmailNotif</text>

      <rect x="321" y="146" width="106" height="50" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="374" y="175" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">SmsNotif</text>

      <rect x="441" y="146" width="106" height="50" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="494" y="175" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">PushNotif</text>

      <line x1="251" y1="146" x2="375" y2="92" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="374" y1="146" x2="412" y2="92" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="494" y1="146" x2="448" y2="92" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
    </svg>
  `,

  strategy: (p) => `
    <svg viewBox="0 0 560 215" xmlns="http://www.w3.org/2000/svg">
      ${makeDefs(p)}
      <rect x="16" y="20" width="205" height="76" rx="8" fill="url(#${p}-boxGrad)" stroke="#38bdf8" stroke-width="1.6"/>
      <text x="118" y="42" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">ShoppingCart</text>
      <line x1="16" y1="50" x2="221" y2="50" stroke="rgba(56,189,248,0.3)"/>
      <text x="28" y="68" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">- strategy : PaymentStrategy</text>
      <text x="28" y="85" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="10">+ setStrategy(s) / checkout()</text>

      <rect x="305" y="20" width="235" height="72" rx="8" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8" stroke-width="1.7"/>
      <text x="422" y="38" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">«interface»</text>
      <text x="422" y="55" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">PaymentStrategy</text>
      <line x1="305" y1="63" x2="540" y2="63" stroke="rgba(56,189,248,0.3)"/>
      <text x="422" y="81" text-anchor="middle" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-size="10.5">+ pay(amount : double)</text>

      <polygon points="222,56 230,51 238,56 230,61" fill="#040a17" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="238" y1="56" x2="303" y2="56" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#${p}-openArrow)"/>

      <rect x="190" y="148" width="112" height="48" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="246" y="176" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">CardStrategy</text>

      <rect x="316" y="148" width="112" height="48" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="372" y="176" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">PayPalStrategy</text>

      <rect x="442" y="148" width="106" height="48" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="495" y="176" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">CryptoStrategy</text>

      <line x1="246" y1="148" x2="380" y2="94" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="372" y1="148" x2="416" y2="94" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="495" y1="148" x2="452" y2="94" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
    </svg>
  `,

  decorator: (p) => `
    <svg viewBox="0 0 560 220" xmlns="http://www.w3.org/2000/svg">
      ${makeDefs(p)}
      <rect x="180" y="12" width="200" height="58" rx="8" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8" stroke-width="1.7"/>
      <text x="280" y="30" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">«interface»</text>
      <text x="280" y="46" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">DataSource</text>
      <text x="280" y="62" text-anchor="middle" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-size="10">+ writeData(data)</text>

      <rect x="28" y="102" width="168" height="50" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.42)"/>
      <text x="112" y="131" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">FileDataSource</text>

      <rect x="295" y="100" width="235" height="54" rx="8" fill="url(#${p}-boxGrad)" stroke="#34d399" stroke-width="1.5"/>
      <text x="412" y="122" text-anchor="middle" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">DataSourceDecorator</text>
      <text x="412" y="141" text-anchor="middle" fill="#cbd5e1" font-family="JetBrains Mono, monospace" font-size="10"># wrappee : DataSource</text>

      <rect x="245" y="174" width="145" height="38" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="317" y="197" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="10.2" font-weight="600">EncryptionDecorator</text>

      <rect x="404" y="174" width="144" height="38" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="476" y="197" text-anchor="middle" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="10.2" font-weight="600">CompressionDecorator</text>

      <line x1="112" y1="102" x2="235" y2="72" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="400" y1="100" x2="320" y2="72" stroke="#34d399" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <path d="M 530 127 L 548 127 L 548 40 L 382 40" fill="none" stroke="#34d399" stroke-width="1.3" marker-end="url(#${p}-openArrow)"/>
      <line x1="317" y1="174" x2="385" y2="155" stroke="#38bdf8" stroke-width="1.4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="476" y1="174" x2="438" y2="155" stroke="#38bdf8" stroke-width="1.4" marker-end="url(#${p}-hollowTri)"/>
    </svg>
  `,

  observer: (p) => `
    <svg viewBox="0 0 560 215" xmlns="http://www.w3.org/2000/svg">
      ${makeDefs(p)}
      <rect x="16" y="20" width="218" height="86" rx="8" fill="url(#${p}-boxGrad)" stroke="#38bdf8" stroke-width="1.6"/>
      <text x="125" y="42" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">WeatherStation (Subject)</text>
      <line x1="16" y1="50" x2="234" y2="50" stroke="rgba(56,189,248,0.3)"/>
      <text x="28" y="68" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">- observers : List&lt;Observer&gt;</text>
      <text x="28" y="84" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="10">+ subscribe(o) / unsubscribe(o)</text>
      <text x="28" y="99" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-size="10">+ notifyObservers()</text>

      <rect x="315" y="24" width="225" height="72" rx="8" fill="url(#${p}-ifaceGrad)" stroke="#38bdf8" stroke-width="1.7"/>
      <text x="427" y="43" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="10">«interface»</text>
      <text x="427" y="60" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">Observer</text>
      <line x1="315" y1="68" x2="540" y2="68" stroke="rgba(56,189,248,0.3)"/>
      <text x="427" y="85" text-anchor="middle" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-size="10.5">+ update(temp : double)</text>

      <line x1="234" y1="60" x2="313" y2="60" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#${p}-openArrow)"/>
      <text x="274" y="51" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-size="9.5">1 .. *</text>

      <rect x="195" y="148" width="112" height="48" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="251" y="176" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">PhoneDisplay</text>

      <rect x="319" y="148" width="114" height="48" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="376" y="176" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">WebDashboard</text>

      <rect x="445" y="148" width="102" height="48" rx="8" fill="url(#${p}-boxGrad)" stroke="rgba(56,189,248,0.4)"/>
      <text x="496" y="176" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">AlertSystem</text>

      <line x1="251" y1="148" x2="385" y2="98" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="376" y1="148" x2="420" y2="98" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
      <line x1="496" y1="148" x2="458" y2="98" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${p}-hollowTri)"/>
    </svg>
  `
};

export function renderDiagram(key, scope = 'screen') {
  const fn = DIAGRAM_BUILDERS[key];
  return fn ? fn(`${scope}-${key}`) : '';
}
