# Présentation Interactive — Principes SOLID & Patrons GoF (Java)

Projet **100 % indépendant**, prêt à ouvrir directement dans **VS Code** (`File > Open Folder...` ou `code presentation-gof-solid`).

---

## 4 façons de lancer la présentation depuis VS Code

### 1. Touche `F5` dans VS Code *(le plus direct — aucune installation)*
Le dossier `.vscode/launch.json` est déjà configuré :
1. Ouvrez uniquement le dossier `presentation-gof-solid` dans **VS Code** (`Fichier > Ouvrir le dossier...`).
2. Appuyez sur **`F5`** → la présentation s’ouvre directement dans Edge ou Chrome !

### 2. Extension **Live Server** dans VS Code *(sans `npm`)*
1. Clic droit sur `index.html` → **Open with Live Server** *(ou bouton **Go Live** en bas à droite de VS Code)*.
2. Toute modification dans `src/data/slidesData.js` ou `src/styles/aura.css` recharge les slides automatiquement !

### 3. Terminal intégré VS Code avec **Vite** (`Ctrl + ù`)
```bash
npm install
npm run dev
```
Puis ouvrez `http://localhost:5173`.

Pour regénérer le fichier autonome unique `presentation.html` après modification :
```bash
npm run build && cp dist/index.html presentation.html
```

### 4. Double-clic hors VS Code (Clé USB / Salle de cours sans Internet)
Double-cliquez sur **`lancer-presentation.bat`** (Windows) ou directement sur **`presentation.html`**.

---

## Structure du dossier indépendant

```text
presentation-gof-solid/
├── .vscode/
│   ├── launch.json          # Lancement direct avec F5 dans VS Code
│   └── extensions.json      # Recommandation Live Server
├── src/
│   ├── styles/aura.css      # Thème DevDesign Dark & Electric Blue Aura + PDF
│   ├── data/slidesData.js   # Contenu des 16 slides (SOLID + GoF en Java + Notes)
│   ├── components/
│   │   ├── umlDiagrams.js   # Diagrammes de classes UML 2.0 vectoriels
│   │   └── simulators.js    # Simulateurs Java interactifs (▶ Démo Live)
│   ├── utils/
│   │   └── javaHighlighter.js
│   └── main.js              # Moteur de navigation, grille, notes & quiz
├── index.html               # Point d'entrée modulaire (Live Server / Vite)
├── presentation.html        # Version autonome 1 fichier (0 dépendance)
├── lancer-presentation.bat  # Raccourci de lancement Windows
├── package.json
└── vite.config.js
```

---

## Raccourcis Clavier pendant l’exposé

| Touche | Action |
| :--- | :--- |
| `→` / `Espace` | Slide suivante |
| `←` | Slide précédente |
| `F` | **Plein Écran** |
| `N` | **Notes d’orateur** (aide-mémoire oral par slide) |
| `G` | **Grille des 16 slides** |
| `P` | Exporter / Imprimer en **PDF Paysage** |
