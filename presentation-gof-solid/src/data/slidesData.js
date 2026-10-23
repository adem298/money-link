export const CHAPTERS = [
  { id: 'intro', label: '01 · Intro', startSlide: 0 },
  { id: 'solid', label: '02 · SOLID', startSlide: 2 },
  { id: 'gof-overview', label: '03 · GoF Taxonomie', startSlide: 8 },
  { id: 'creational', label: '04 · Singleton & Factory', startSlide: 9 },
  { id: 'behavioral-structural', label: '05 · Strategy · Decorator · Observer', startSlide: 11 },
  { id: 'synthesis', label: '06 · Synergie & Quiz', startSlide: 14 }
];

export const SLIDES = [
  /* =======================================================================
     SLIDE 01 — COVER
     ======================================================================= */
  {
    id: 'cover',
    chapter: 'intro',
    layout: 'cover',
    kicker: 'COURS D’ARCHITECTURE & GÉNIE LOGICIEL · JAVA OOP',
    titlePlain: 'Principes ',
    titleAura: 'SOLID & Patrons GoF',
    subtitle:
      'Concevoir des architectures orientées objet modulaires, extensibles et maintenables en Java : des 5 fondements SOLID aux 5 patrons incontournables du Gang of Four.',
    chips: [
      'S · O · L · I · D',
      'Singleton',
      'Factory',
      'Strategy',
      'Decorator',
      'Observer',
      'UML 2.0 + Java'
    ],
    diagram: 'heroArchitecture',
    speakerNotes:
      'Introduction orale : « Bonjour à tous. Aujourd’hui nous allons voir comment passer d’un code orienté objet qui fonctionne simplement à une véritable architecture logicielle professionnelle en Java, grâce aux 5 principes SOLID et aux 5 patrons majeurs du Gang of Four : Singleton, Factory, Strategy, Decorator et Observer. »'
  },

  /* =======================================================================
     SLIDE 02 — WHY SOLID + GOF?
     ======================================================================= */
  {
    id: 'why-architecture',
    chapter: 'intro',
    layout: 'split',
    eyebrow: '01 · Problématique Architecturale',
    badge: 'Fondations',
    titlePlain: 'Pourquoi associer ',
    titleAura: 'SOLID et les Patrons GoF ?',
    subtitle:
      'Un logiciel passe plus de 80 % de sa vie en maintenance et évolution. Sans architecture, chaque nouvelle fonctionnalité casse l’existant.',
    leftCard: {
      label: 'DIAGNOSTIC DU CODE SPAGHETTI',
      title: 'Les 4 symptômes d’une mauvaise conception POO',
      bullets: [
        'Rigidité : modifier un détail force à recompiler et retester des dizaines de classes.',
        'Fragilité : corriger un bug dans un module provoque des régressions ailleurs.',
        'Immobilité : impossible de réutiliser un composant tant il est couplé au reste.',
        'Viscosité : faire un hack rapide devient plus facile que suivre une structure propre.'
      ],
      callouts: [
        {
          type: 'info',
          title: 'SOLID = Le Diagnostic (Quoi respecter)',
          body: '5 principes de conception (Robert C. Martin) qui guident le découpage des classes et des interfaces.'
        },
        {
          type: 'good',
          title: 'GoF = Les Solutions (Comment structurer)',
          body: 'Catalogue de 23 solutions réutilisables (1994) qui concrétisent les principes SOLID en pratique.'
        }
      ]
    },
    tabs: [
      {
        id: 'couplage-bad',
        label: '❌ Couplage Fort',
        kind: 'bad',
        code: `// Anti-pattern classique : tout est figé et entremêlé
public class OrderProcessor {

    public void process(String type, double amount) {
        // 1. Instanciation directe -> couplage fort
        MySqlDatabase db = new MySqlDatabase();
        db.save(amount);

        // 2. Cascade de if/else -> fermé à l'extension
        if (type.equals("CARD")) {
            System.out.println("Paiement Carte : " + amount);
        } else if (type.equals("PAYPAL")) {
            System.out.println("Paiement PayPal : " + amount);
        }

        // 3. Notification figée en dur
        SmtpMailer mailer = new SmtpMailer();
        mailer.sendEmail("Commande validée");
    }
}`
      },
      {
        id: 'couplage-good',
        label: '✅ Architecture SOLID + GoF',
        kind: 'good',
        code: `// Architecture découplée combinant DIP, Strategy et Observer
public class OrderProcessor {
    private final OrderRepository repository;      // DIP
    private final List<OrderObserver> observers;   // Observer

    public OrderProcessor(OrderRepository repository,
                          List<OrderObserver> observers) {
        this.repository = repository;
        this.observers = observers;
    }

    public void process(Order order, PaymentStrategy payment) {
        payment.pay(order.getTotal());             // Strategy (OCP)
        repository.save(order);                    // SRP + DIP
        observers.forEach(o -> o.onOrderPaid(order));
    }
}`
      }
    ],
    speakerNotes:
      'Point clé : insistez sur la complémentarité ! SOLID fixe les règles d’hygiène objet (faible couplage, forte cohésion), tandis que les patrons GoF sont les plans d’assemblage concrets qui appliquent ces règles.'
  },

  /* =======================================================================
     SLIDE 03 — SOLID OVERVIEW (5 PILLARS)
     ======================================================================= */
  {
    id: 'solid-overview',
    chapter: 'solid',
    layout: 'pillars',
    eyebrow: '02 · Principes de Conception Orientée Objet',
    badge: 'Robert C. Martin',
    titlePlain: 'Les 5 Piliers ',
    titleAura: 'S · O · L · I · D',
    subtitle:
      'Cliquez sur une carte pour accéder directement à son étude détaillée avec diagramme UML et code Java avant/après.',
    pillars: [
      {
        letter: 'S',
        name: 'Single Responsibility',
        fr: 'Responsabilité Unique',
        summary: 'Une classe ne doit avoir qu’une seule et unique raison de changer.',
        targetSlide: 3
      },
      {
        letter: 'O',
        name: 'Open / Closed',
        fr: 'Ouvert / Fermé',
        summary: 'Ouvert à l’extension par polymorphisme, fermé à la modification du code existant.',
        targetSlide: 4
      },
      {
        letter: 'L',
        name: 'Liskov Substitution',
        fr: 'Substitution de Liskov',
        summary: 'Tout sous-type doit pouvoir remplacer son type parent sans altérer la cohérence.',
        targetSlide: 5
      },
      {
        letter: 'I',
        name: 'Interface Segregation',
        fr: 'Ségrégation des Interfaces',
        summary: 'Mieux vaut plusieurs petites interfaces ciblées qu’une interface « fourre-tout ».',
        targetSlide: 6
      },
      {
        letter: 'D',
        name: 'Dependency Inversion',
        fr: 'Inversion des Dépendances',
        summary: 'Dépendre d’abstractions (interfaces), jamais d’implémentations concrètes.',
        targetSlide: 7
      }
    ],
    bottomBanner:
      'Objectif global de SOLID : Haute Cohésion interne + Faible Couplage entre modules + Testabilité unitaire maximale.',
    speakerNotes:
      'Transition : présentez brièvement l’acronyme popularisé par Robert C. Martin (« Uncle Bob »), puis détaillez chacun des 5 principes avec un contre-exemple et sa refactorisation Java.'
  },

  /* =======================================================================
     SLIDE 04 — [S] SINGLE RESPONSIBILITY PRINCIPLE
     ======================================================================= */
  {
    id: 'solid-srp',
    chapter: 'solid',
    layout: 'split',
    eyebrow: 'Principes SOLID · [S] — 1 / 5',
    badge: 'SRP',
    titlePlain: 'Single Responsibility ',
    titleAura: 'Principle (SRP)',
    subtitle:
      '« Une classe ne doit avoir qu’une seule raison de changer, c’est-à-dire une seule responsabilité métier ou technique. »',
    diagram: 'srp',
    leftCard: {
      label: 'ANALYSE DU PRINCIPE',
      title: 'Séparer le calcul métier, l’affichage et la persistance',
      bullets: [
        'Problème (« God Class ») : si le format PDF ou le SGBD change, on modifie la classe métier.',
        'Solution : extraire chaque responsabilité dans une classe dédiée à forte cohésion.',
        'Gain direct : classes courtes, réutilisables et faciles à tester isolément.'
      ]
    },
    tabs: [
      {
        id: 'srp-good',
        label: '✅ Respect SRP (Java)',
        kind: 'good',
        code: `// 1. Logique métier pure
public class Report {
    private final String title;
    private final List<Double> values;

    public Report(String title, List<Double> values) {
        this.title = title;
        this.values = values;
    }

    public double average() {
        return values.stream().mapToDouble(Double::doubleValue)
                     .average().orElse(0.0);
    }
    public String getTitle() { return title; }
}

// 2. Mise en forme dédiée
public class ReportPdfFormatter {
    public byte[] toPdf(Report r) {
        return ("PDF: " + r.getTitle() + " = " + r.average()).getBytes();
    }
}

// 3. Persistance dédiée
public class ReportRepository {
    public void save(Report r) { /* INSERT SQL... */ }
}`
      },
      {
        id: 'srp-bad',
        label: '❌ Violation SRP',
        kind: 'bad',
        code: `// ❌ 3 acteurs / raisons de changer dans UNE seule classe !
public class ReportManager {
    private String title;
    private List<Double> values;

    // Raison 1 : Règle de calcul statistique change
    public double calculateAverage() {
        return values.stream().mapToDouble(d -> d).average().orElse(0);
    }

    // Raison 2 : Charte graphique PDF change
    public byte[] exportToPdf() {
        System.out.println("Génération PDF de " + title);
        return new byte[0];
    }

    // Raison 3 : Base de données SQL change
    public void saveToMySql() {
        System.out.println("INSERT INTO reports VALUES (...)");
    }
}`
      }
    ],
    speakerNotes:
      'Astuce d’examen : « Une seule raison de changer » ne veut pas dire « une seule méthode », mais un seul axe d’évolution / un seul acteur métier.'
  },

  /* =======================================================================
     SLIDE 05 — [O] OPEN / CLOSED PRINCIPLE
     ======================================================================= */
  {
    id: 'solid-ocp',
    chapter: 'solid',
    layout: 'split',
    eyebrow: 'Principes SOLID · [O] — 2 / 5',
    badge: 'OCP',
    titlePlain: 'Open / Closed ',
    titleAura: 'Principle (OCP)',
    subtitle:
      '« Les entités logicielles doivent être ouvertes à l’extension, mais fermées à la modification. » (Bertrand Meyer / R. Martin)',
    diagram: 'ocp',
    leftCard: {
      label: 'LEVIER POLYMORPHIQUE',
      title: 'Ajouter un comportement = créer une classe, pas éditer un switch',
      bullets: [
        'Symptôme de violation : de longs blocs if / else if ou switch sur le type d’un objet.',
        'Mécanisme Java : abstraire le point de variation derrière une interface.',
        'Lien direct GoF : les patrons Strategy et Decorator reposent directement sur OCP.'
      ]
    },
    tabs: [
      {
        id: 'ocp-good',
        label: '✅ Respect OCP (Java)',
        kind: 'good',
        code: `public interface DiscountPolicy {
    double apply(double amount);
}

public class StudentDiscount implements DiscountPolicy {
    public double apply(double amount) { return amount * 0.85; }
}

public class VipDiscount implements DiscountPolicy {
    public double apply(double amount) { return amount * 0.70; }
}

// Extension : nouvelle promo SANS toucher PriceCalculator !
public class BlackFridayDiscount implements DiscountPolicy {
    public double apply(double amount) { return amount * 0.50; }
}

// Fermé à la modification, ouvert à toute future politique
public class PriceCalculator {
    public double finalPrice(double amount, DiscountPolicy policy) {
        return policy.apply(amount);
    }
}`
      },
      {
        id: 'ocp-bad',
        label: '❌ Violation OCP',
        kind: 'bad',
        code: `// ❌ Chaque nouvelle promotion oblige à modifier et retester cette classe
public class PriceCalculator {

    public double finalPrice(double amount, String customerType) {
        if ("STUDENT".equals(customerType)) {
            return amount * 0.85;
        } else if ("VIP".equals(customerType)) {
            return amount * 0.70;
        } else if ("BLACK_FRIDAY".equals(customerType)) {
            // Modification risquée du code déjà en production !
            return amount * 0.50;
        }
        return amount;
    }
}`
      }
    ],
    speakerNotes:
      'Montrez le rectangle vert en pointillés sur le diagramme UML : on ajoute BlackFridayDiscount sans toucher une seule ligne de PriceCalculator.'
  },

  /* =======================================================================
     SLIDE 06 — [L] LISKOV SUBSTITUTION PRINCIPLE
     ======================================================================= */
  {
    id: 'solid-lsp',
    chapter: 'solid',
    layout: 'split',
    eyebrow: 'Principes SOLID · [L] — 3 / 5',
    badge: 'LSP',
    titlePlain: 'Liskov Substitution ',
    titleAura: 'Principle (LSP)',
    subtitle:
      '« Si S est un sous-type de T, tout objet de type T peut être remplacé par un objet de type S sans casser les invariants du programme. » (Barbara Liskov)',
    diagram: 'lsp',
    leftCard: {
      label: 'CONTRAT COMPORTEMENTAL',
      title: '« Est-un » mathématique ≠ « Hérite-de » valide en POO',
      bullets: [
        'Piège célèbre : faire hériter Square de Rectangle mutable casse l’invariant largeur × hauteur.',
        'Autre violation typique : lever UnsupportedOperationException dans une méthode redéfinie.',
        'Règle : n’hériter que lorsque le sous-type respecte 100 % du contrat du parent.'
      ]
    },
    tabs: [
      {
        id: 'lsp-good',
        label: '✅ Respect LSP (Java)',
        kind: 'good',
        code: `// Contrat commun immuable et sans effet de bord trompeur
public interface Shape {
    int area();
}

public final class Rectangle implements Shape {
    private final int width;
    private final int height;

    public Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }
    @Override
    public int area() { return width * height; }
}

public final class Square implements Shape {
    private final int side;

    public Square(int side) { this.side = side; }

    @Override
    public int area() { return side * side; }
}`
      },
      {
        id: 'lsp-bad',
        label: '❌ Violation LSP',
        kind: 'bad',
        code: `class Rectangle {
    protected int width, height;
    public void setWidth(int w)  { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int area() { return width * height; }
}

class Square extends Rectangle {
    @Override
    public void setWidth(int w)  { this.width = w; this.height = w; }
    @Override
    public void setHeight(int h) { this.width = h; this.height = h; }
}

// ❌ Test client cassé lorsqu'on passe new Square() :
void verifyArea(Rectangle r) {
    r.setWidth(5);
    r.setHeight(4);
    // Attendu : 20, mais Square renvoie 16 ! Contrat brisé !
    assert r.area() == 20;
}`
      }
    ],
    speakerNotes:
      'Exemple incontournable en cours de POO : en géométrie un carré est un rectangle, mais un objet Square mutable ne se comporte PAS comme un objet Rectangle mutable.'
  },

  /* =======================================================================
     SLIDE 07 — [I] INTERFACE SEGREGATION PRINCIPLE
     ======================================================================= */
  {
    id: 'solid-isp',
    chapter: 'solid',
    layout: 'split',
    eyebrow: 'Principes SOLID · [I] — 4 / 5',
    badge: 'ISP',
    titlePlain: 'Interface Segregation ',
    titleAura: 'Principle (ISP)',
    subtitle:
      '« Aucun client ne doit être forcé de dépendre de méthodes qu’il n’utilise pas. »',
    diagram: 'isp',
    leftCard: {
      label: 'COHÉSION DES CONTRATS',
      title: 'Découper les interfaces « obèses » en interfaces de rôle',
      bullets: [
        'Problème : une grosse interface oblige les classes simples à coder des méthodes vides ou en erreur.',
        'En Java : une classe peut implémenter plusieurs interfaces fines (implements Printable, Scannable).',
        'Lien direct avec LSP : évite de lancer des UnsupportedOperationException.'
      ]
    },
    tabs: [
      {
        id: 'isp-good',
        label: '✅ Respect ISP (Java)',
        kind: 'good',
        code: `public interface Printable { void print(String doc); }
public interface Scannable { String scan(); }
public interface Faxable   { void fax(String doc); }

// Une imprimante d'entrée de gamme n'implémente QUE son besoin
public class BasicPrinter implements Printable {
    @Override
    public void print(String doc) {
        System.out.println("Impression : " + doc);
    }
}

// Un photocopieur pro combine les contrats nécessaires
public class OfficeMultifunction implements Printable, Scannable, Faxable {
    public void print(String doc) { System.out.println("Print: " + doc); }
    public String scan()          { return "Contenu scanné"; }
    public void fax(String doc)   { System.out.println("Fax: " + doc); }
}`
      },
      {
        id: 'isp-bad',
        label: '❌ Violation ISP',
        kind: 'bad',
        code: `// ❌ Interface « polluée » trop large
public interface Machine {
    void print(String doc);
    String scan();
    void fax(String doc);
}

public class BasicPrinter implements Machine {
    @Override
    public void print(String doc) {
        System.out.println("Impression : " + doc);
    }

    @Override
    public String scan() {
        // ❌ Forcé d'implémenter une méthode inutile !
        throw new UnsupportedOperationException("Pas de scanner !");
    }

    @Override
    public void fax(String doc) {
        throw new UnsupportedOperationException("Pas de fax !");
    }
}`
      }
    ],
    speakerNotes:
      'Rappelez que Java n’autorise pas l’héritage multiple de classes, mais autorise l’implémentation multiple d’interfaces : ISP exploite pleinement cette force du langage Java.'
  },

  /* =======================================================================
     SLIDE 08 — [D] DEPENDENCY INVERSION PRINCIPLE
     ======================================================================= */
  {
    id: 'solid-dip',
    chapter: 'solid',
    layout: 'split',
    eyebrow: 'Principes SOLID · [D] — 5 / 5',
    badge: 'DIP',
    titlePlain: 'Dependency Inversion ',
    titleAura: 'Principle (DIP)',
    subtitle:
      '« 1. Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. 2. Tous deux doivent dépendre d’abstractions. »',
    diagram: 'dip',
    leftCard: {
      label: 'INJECTION DE DÉPENDANCES',
      title: 'Inverser le sens des flèches grâce aux interfaces',
      bullets: [
        'Haut niveau = logique métier (OrderService, la valeur ajoutée de l’application).',
        'Bas niveau = détails techniques (MySQL, SMTP, API SMS, système de fichiers).',
        'En injectant l’interface par le constructeur, on peut brancher un Mock en test en 1 ligne !'
      ]
    },
    tabs: [
      {
        id: 'dip-good',
        label: '✅ Respect DIP (Java)',
        kind: 'good',
        code: `// Abstraction possédée par la couche métier
public interface MessageSender {
    void send(String recipient, String content);
}

public class SmtpEmailSender implements MessageSender {
    public void send(String to, String msg) {
        System.out.println("[SMTP] Email envoyé à " + to + " : " + msg);
    }
}

public class TwilioSmsSender implements MessageSender {
    public void send(String to, String msg) {
        System.out.println("[SMS] SMS envoyé à " + to + " : " + msg);
    }
}

// Haut niveau totalement indépendant du détail technique !
public class OrderService {
    private final MessageSender sender;

    public OrderService(MessageSender sender) { // Injection
        this.sender = sender;
    }

    public void confirmOrder(String client) {
        sender.send(client, "Votre commande est confirmée !");
    }
}`
      },
      {
        id: 'dip-bad',
        label: '❌ Violation DIP',
        kind: 'bad',
        code: `public class SmtpEmailSender {
    public void sendEmail(String to, String msg) {
        System.out.println("Envoi SMTP vers " + to);
    }
}

public class OrderService {
    // ❌ Dépendance rigide sur une implémentation concrète bas niveau !
    private final SmtpEmailSender emailSender = new SmtpEmailSender();

    public void confirmOrder(String client) {
        // Impossible de passer aux SMS ni de tester sans serveur SMTP !
        emailSender.sendEmail(client, "Votre commande est confirmée !");
    }
}`
      }
    ],
    speakerNotes:
      'Transition vers GoF : « Maintenant que nous voyons qu’il ne faut plus faire des new Concret() partout (DIP) ni des if/else (OCP), comment organiser concrètement nos objets ? C’est exactement le rôle des Patrons GoF ! »'
  },

  /* =======================================================================
     SLIDE 09 — GOF DESIGN PATTERNS TAXONOMY
     ======================================================================= */
  {
    id: 'gof-taxonomy',
    chapter: 'gof-overview',
    layout: 'taxonomy',
    eyebrow: '03 · Gang of Four (Gamma, Helm, Johnson, Vlissides — 1994)',
    badge: '23 Patrons → 5 Essentiels',
    titlePlain: 'Classification des ',
    titleAura: 'Patrons de Conception GoF',
    subtitle:
      'Un Design Pattern est une solution éprouvée et réutilisable à un problème récurrent de conception orientée objet.',
    families: [
      {
        tag: 'FAMILLE 1 · CRÉATION (5 patrons GoF)',
        title: 'Patrons Créationnels',
        desc: 'Abstraient et contrôlent le processus d’instanciation des objets pour éliminer le couplage au mot-clé new.',
        patterns: [
          { name: 'Singleton', focus: 'Garantir une instance unique et un point d’accès global contrôlé.', slide: 9 },
          { name: 'Factory', focus: 'Déléguer la création d’objets polymorphes sans exposer leurs classes concrètes.', slide: 10 }
        ],
        others: 'Autres : Abstract Factory, Builder, Prototype'
      },
      {
        tag: 'FAMILLE 2 · STRUCTURE (7 patrons GoF)',
        title: 'Patrons Structurels',
        desc: 'Assemblent des classes et des objets en structures plus larges tout en gardant souplesse et efficacité.',
        patterns: [
          { name: 'Decorator', focus: 'Attacher dynamiquement de nouvelles responsabilités à un objet par enveloppement.', slide: 12 }
        ],
        others: 'Autres : Adapter, Facade, Composite, Proxy, Bridge, Flyweight'
      },
      {
        tag: 'FAMILLE 3 · COMPORTEMENT (11 patrons GoF)',
        title: 'Patrons Comportementaux',
        desc: 'Organisent la communication, les algorithmes et la répartition des responsabilités entre objets.',
        patterns: [
          { name: 'Strategy', focus: 'Encapsuler une famille d’algorithmes et les rendre interchangeables à l’exécution.', slide: 11 },
          { name: 'Observer', focus: 'Notifier automatiquement plusieurs objets abonnés lors d’un changement d’état.', slide: 13 }
        ],
        others: 'Autres : Command, Iterator, State, Template Method, Mediator...'
      }
    ],
    speakerNotes:
      'Cite les 4 auteurs du livre fondateur de 1994 (« Design Patterns: Elements of Reusable Object-Oriented Software ») : Erich Gamma, Richard Helm, Ralph Johnson et John Vlissides — surnommés le Gang of Four (GoF).'
  },

  /* =======================================================================
     SLIDE 10 — GOF #1: SINGLETON
     ======================================================================= */
  {
    id: 'gof-singleton',
    chapter: 'creational',
    layout: 'split',
    eyebrow: 'Patron GoF #1 · Famille Création',
    badge: 'Singleton',
    titlePlain: 'Patron ',
    titleAura: 'Singleton',
    subtitle:
      'Garantir qu’une classe ne possède qu’une seule instance en mémoire JVM et fournir un point d’accès global unique à celle-ci.',
    diagram: 'singleton',
    simulator: 'singleton',
    leftCard: {
      label: 'FICHE ARCHITECTURALE',
      title: 'Mécanisme en 3 règles Java strictes',
      bullets: [
        '1. Constructeur private : interdit tout appel externe à new DatabaseConnection().',
        '2. Attribut private static volatile : stocke l’unique référence partagée.',
        '3. Méthode public static getInstance() : instancie paresseusement (lazy) de façon Thread-Safe.'
      ],
      callouts: [
        {
          type: 'good',
          title: 'Cas d’usage typiques',
          body: 'Pool de connexion BDD, Configuration globale, Logger central, Runtime.getRuntime().'
        },
        {
          type: 'bad',
          title: 'Vigilance SOLID !',
          body: 'Abuser du Singleton crée un état global caché qui complique les tests unitaires (tension SRP/DIP).'
        }
      ]
    },
    tabs: [
      {
        id: 'singleton-java',
        label: 'DatabaseConnection.java',
        kind: 'good',
        code: `public final class DatabaseConnection {

    // volatile garantit la visibilité mémoire entre threads JVM
    private static volatile DatabaseConnection instance;

    // 1. Constructeur privé : empêche 'new DatabaseConnection()'
    private DatabaseConnection() {
        System.out.println("Initialisation unique de la connexion...");
    }

    // 2. Double-Checked Locking (Thread-Safe & performant)
    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnection.class) {
                if (instance == null) {
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }

    public void query(String sql) {
        System.out.println("[SQL] " + sql);
    }
}`
      },
      {
        id: 'singleton-usage',
        label: 'Main.java',
        kind: 'default',
        code: `public class Main {
    public static void main(String[] args) {
        // new DatabaseConnection(); // ❌ Erreur de compilation !

        DatabaseConnection db1 = DatabaseConnection.getInstance();
        DatabaseConnection db2 = DatabaseConnection.getInstance();

        db1.query("SELECT * FROM students");

        // Preuve d'unicité de la référence en mémoire :
        System.out.println(db1 == db2); // true (même adresse JVM !)
    }
}`
      }
    ],
    speakerNotes:
      'Astuce bonus pour impressionner le prof : mentionnez le mot-clé volatile du Double-Checked Locking en Java, et cliquez sur l’onglet « ▶ Démo Live » pour prouver que db1 == db2 renvoie la même adresse mémoire @7a81197d !'
  },

  /* =======================================================================
     SLIDE 11 — GOF #2: FACTORY
     ======================================================================= */
  {
    id: 'gof-factory',
    chapter: 'creational',
    layout: 'split',
    eyebrow: 'Patron GoF #2 · Famille Création',
    badge: 'Factory',
    titlePlain: 'Patron ',
    titleAura: 'Factory (Fabrique)',
    subtitle:
      'Centraliser et encapsuler la création d’objets polymorphes pour que le code client ne dépende que de l’interface commune.',
    diagram: 'factory',
    simulator: 'factory',
    leftCard: {
      label: 'DÉCOUPLAGE DE L’INSTANCIATION',
      title: 'Séparer l’utilisation d’un objet de sa fabrication',
      bullets: [
        'Problème : disperser new EmailNotification() dans 40 classes rend toute évolution coûteuse.',
        'Solution : le client demande une Notification à la fabrique sans connaître la classe concrète.',
        'Évolution Factory Method (GoF pur) : des sous-classes de Creator redéfinissent createNotification() pour respecter pleinement OCP.'
      ]
    },
    tabs: [
      {
        id: 'factory-java',
        label: 'NotificationFactory.java',
        kind: 'good',
        code: `public interface Notification {
    void notifyUser(String message);
}

class EmailNotification implements Notification {
    public void notifyUser(String msg) {
        System.out.println("[EMAIL] Envoi SMTP : " + msg);
    }
}

class SmsNotification implements Notification {
    public void notifyUser(String msg) {
        System.out.println("[SMS] Envoi opérateur : " + msg);
    }
}

class PushNotification implements Notification {
    public void notifyUser(String msg) {
        System.out.println("[PUSH] Notification mobile : " + msg);
    }
}

public class NotificationFactory {
    public static Notification create(String channel) {
        return switch (channel.toUpperCase()) {
            case "EMAIL" -> new EmailNotification();
            case "SMS"   -> new SmsNotification();
            case "PUSH"  -> new PushNotification();
            default -> throw new IllegalArgumentException("Canal inconnu");
        };
    }
}`
      },
      {
        id: 'factory-method-gof',
        label: 'FactoryMethod (GoF pur)',
        kind: 'default',
        code: `// Variante Factory Method 100 % conforme à Open/Closed (OCP) :
public abstract class NotificationCreator {

    // La « Factory Method » abstraite déléguée aux sous-classes
    protected abstract Notification createNotification();

    public void sendAlert(String message) {
        Notification notif = createNotification();
        notif.notifyUser(message);
    }
}

public class EmailCreator extends NotificationCreator {
    @Override
    protected Notification createNotification() {
        return new EmailNotification();
    }
}

public class SmsCreator extends NotificationCreator {
    @Override
    protected Notification createNotification() {
        return new SmsNotification();
    }
}`
      }
    ],
    speakerNotes:
      'Très apprécié à l’oral : distinguez clairement la Simple Factory (méthode statique switch très courante) et la Factory Method GoF (classe abstraite NotificationCreator + sous-classes) disponible dans le 2e onglet !'
  },

  /* =======================================================================
     SLIDE 12 — GOF #3: STRATEGY
     ======================================================================= */
  {
    id: 'gof-strategy',
    chapter: 'behavioral-structural',
    layout: 'split',
    eyebrow: 'Patron GoF #3 · Famille Comportement',
    badge: 'Strategy',
    titlePlain: 'Patron ',
    titleAura: 'Strategy',
    subtitle:
      'Définir une famille d’algorithmes, encapsuler chacun dans sa propre classe et les rendre interchangeables à chaud (au runtime).',
    diagram: 'strategy',
    simulator: 'strategy',
    leftCard: {
      label: 'COMPOSITION > HÉRITAGE',
      title: 'Remplacer les conditions complexes par le polymorphisme',
      bullets: [
        'Participants : Context (ShoppingCart), interface Strategy (PaymentStrategy) et ConcreteStrategies.',
        'Flexibilité : le contexte peut changer de stratégie en cours d’exécution via setStrategy().',
        'Exemple réel Java JDK : Collections.sort(list, comparator) où Comparator<T> est une Strategy !'
      ]
    },
    tabs: [
      {
        id: 'strategy-java',
        label: 'PaymentStrategy.java',
        kind: 'good',
        code: `public interface PaymentStrategy {
    void pay(double amount);
}

public class CardStrategy implements PaymentStrategy {
    private final String maskedCard;
    public CardStrategy(String maskedCard) { this.maskedCard = maskedCard; }

    public void pay(double amount) {
        System.out.println(amount + " € payés par Carte " + maskedCard);
    }
}

public class PayPalStrategy implements PaymentStrategy {
    private final String email;
    public PayPalStrategy(String email) { this.email = email; }

    public void pay(double amount) {
        System.out.println(amount + " € réglés via PayPal (" + email + ")");
    }
}

public class ShoppingCart {
    private PaymentStrategy strategy;

    public void setStrategy(PaymentStrategy strategy) {
        this.strategy = strategy; // Changement dynamique au runtime !
    }

    public void checkout(double total) {
        strategy.pay(total);
    }
}`
      },
      {
        id: 'strategy-lambda',
        label: 'Java Moderne (Lambda)',
        kind: 'default',
        code: `public class Main {
    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();

        // 1. Paiement classique par Carte
        cart.setStrategy(new CardStrategy("**** 4242"));
        cart.checkout(120.0);

        // 2. Changement d'algorithme à chaud sur le MÊME panier !
        cart.setStrategy(new PayPalStrategy("etudiant@univ.tn"));
        cart.checkout(85.5);

        // 3. Comme PaymentStrategy est une @FunctionalInterface :
        cart.setStrategy(amount ->
            System.out.println(amount + " € payés en Crypto Web3"));
        cart.checkout(250.0);
    }
}`
      }
    ],
    speakerNotes:
      'Soulignez le lien avec Java 8+ : comme PaymentStrategy n’a qu’une seule méthode abstraite, c’est aussi une interface fonctionnelle utilisable avec une expression lambda !'
  },

  /* =======================================================================
     SLIDE 13 — GOF #4: DECORATOR
     ======================================================================= */
  {
    id: 'gof-decorator',
    chapter: 'behavioral-structural',
    layout: 'split',
    eyebrow: 'Patron GoF #4 · Famille Structure',
    badge: 'Decorator',
    titlePlain: 'Patron ',
    titleAura: 'Decorator (Wrapper)',
    subtitle:
      'Attacher dynamiquement des fonctionnalités supplémentaires à un objet en l’enveloppant dans des objets décorateurs partageant la même interface.',
    diagram: 'decorator',
    simulator: 'decorator',
    leftCard: {
      label: 'EMPILEMENT DYNAMIQUE (« POUPÉES RUSSES »)',
      title: 'Éviter l’explosion combinatoire de sous-classes',
      bullets: [
        'Sans Decorator : EncryptedFile, CompressedFile, EncryptedAndCompressedFile... explosion de classes !',
        'Astuce clé : le décorateur implémente DataSource ET contient un attribut DataSource wrappee.',
        'Exemple réel Java JDK : new BufferedInputStream(new FileInputStream("data.bin")) !'
      ]
    },
    tabs: [
      {
        id: 'decorator-java',
        label: 'DataSourceDecorator.java',
        kind: 'good',
        code: `public interface DataSource {
    void writeData(String data);
}

public class FileDataSource implements DataSource {
    private final String filename;
    public FileDataSource(String filename) { this.filename = filename; }
    public void writeData(String data) {
        System.out.println("Écriture dans " + filename + " -> " + data);
    }
}

public abstract class DataSourceDecorator implements DataSource {
    protected final DataSource wrappee;
    protected DataSourceDecorator(DataSource s) { this.wrappee = s; }
}

public class CompressionDecorator extends DataSourceDecorator {
    public CompressionDecorator(DataSource s) { super(s); }
    public void writeData(String data) {
        super.wrappee.writeData("ZIP(" + data + ")");
    }
}

public class EncryptionDecorator extends DataSourceDecorator {
    public EncryptionDecorator(DataSource s) { super(s); }
    public void writeData(String data) {
        super.wrappee.writeData("AES256[" + data + "]");
    }
}`
      },
      {
        id: 'decorator-usage',
        label: 'Main.java (Empilement)',
        kind: 'default',
        code: `public class Main {
    public static void main(String[] args) {
        // Combinaison sur-mesure à l'exécution :
        DataSource pipeline = new EncryptionDecorator(
                                  new CompressionDecorator(
                                      new FileDataSource("rapport.txt")
                                  )
                              );

        // Chiffre -> Compresse -> Écrit sur disque, de façon transparente !
        pipeline.writeData("Notes_Examen_Architecture");
    }
}`
      }
    ],
    speakerNotes:
      'Ne manquez surtout pas l’onglet « ▶ Démo Live » ici : cochez/décochez Compression, Chiffrement AES et Base64 en direct devant la classe pour voir le code Java d’enveloppement et la transformation de la donnée en temps réel !'
  },

  /* =======================================================================
     SLIDE 14 — GOF #5: OBSERVER
     ======================================================================= */
  {
    id: 'gof-observer',
    chapter: 'behavioral-structural',
    layout: 'split',
    eyebrow: 'Patron GoF #5 · Famille Comportement',
    badge: 'Observer',
    titlePlain: 'Patron ',
    titleAura: 'Observer (Publish / Subscribe)',
    subtitle:
      'Définir une dépendance 1-vers-N entre objets afin que, lorsqu’un Sujet change d’état, tous ses Observateurs abonnés soient notifiés automatiquement.',
    diagram: 'observer',
    simulator: 'observer',
    leftCard: {
      label: 'ARCHITECTURE ÉVÉNEMENTIELLE RÉACTIVE',
      title: 'Supprimer l’attente active (polling) et découpler l’émetteur',
      bullets: [
        'Subject (Observable) : maintient une List<Observer> et expose subscribe(), unsubscribe(), notify().',
        'Faible couplage : le Sujet ignore tout des classes concrètes qui l’écoutent.',
        'Omniprésent : boutons Swing/JavaFX (ActionListener), MVC, Spring Events, RxJava.'
      ]
    },
    tabs: [
      {
        id: 'observer-java',
        label: 'WeatherStation.java',
        kind: 'good',
        code: `public interface Observer {
    void update(double temperature);
}

public class WeatherStation {
    private final List<Observer> observers = new ArrayList<>();
    private double temperature;

    public void subscribe(Observer obs)   { observers.add(obs); }
    public void unsubscribe(Observer obs) { observers.remove(obs); }

    public void setTemperature(double newTemp) {
        this.temperature = newTemp;
        notifyObservers(); // Diffusion automatique !
    }

    private void notifyObservers() {
        for (Observer obs : observers) {
            obs.update(this.temperature);
        }
    }
}

public class PhoneDisplay implements Observer {
    public void update(double temp) {
        System.out.println("[Mobile] Nouvelle météo : " + temp + " °C");
    }
}`
      },
      {
        id: 'observer-usage',
        label: 'Main.java',
        kind: 'default',
        code: `public class Main {
    public static void main(String[] args) {
        WeatherStation station = new WeatherStation();

        Observer phone = new PhoneDisplay();
        Observer alert = temp -> {
            if (temp >= 35.0) {
                System.out.println("[ALERTE CANICULE] " + temp + " °C !");
            }
        };

        station.subscribe(phone);
        station.subscribe(alert);

        station.setTemperature(24.5); // Notifie phone + alert
        station.unsubscribe(phone);   // Désabonnement dynamique !
        station.setTemperature(38.0); // Notifie uniquement alert
    }
}`
      }
    ],
    speakerNotes:
      'Montrez avec le simulateur comment on peut abonner et désabonner des observateurs à chaud sans jamais arrêter ni modifier la classe WeatherStation (respect parfait de OCP et DIP).'
  },

  /* =======================================================================
     SLIDE 15 — GOF × SOLID SYNERGY MATRIX & JDK REAL EXAMPLES
     ======================================================================= */
  {
    id: 'synergy-matrix',
    chapter: 'synthesis',
    layout: 'matrix',
    eyebrow: '06 · Vision Synthétique & Analyse Critique',
    badge: 'GoF × SOLID',
    titlePlain: 'Comment chaque Patron GoF ',
    titleAura: 'met en œuvre SOLID',
    subtitle:
      'Tableau de synthèse croisant nos 5 patrons GoF avec les principes SOLID et leurs implémentations réelles dans la bibliothèque standard Java (JDK).',
    rows: [
      {
        pattern: 'Singleton',
        family: 'Création',
        solidStatus: 'warn',
        solidLabel: '⚠️ Tension SRP / DIP',
        solidExplain: 'Gère son cycle de vie + son métier (2 responsabilités) et crée un couplage global statique.',
        jdkExample: 'Runtime.getRuntime(), Desktop.getDesktop()'
      },
      {
        pattern: 'Factory',
        family: 'Création',
        solidStatus: 'yes',
        solidLabel: '✅ SRP · OCP · DIP',
        solidExplain: 'Isole la logique de construction (SRP) et fait dépendre le client d’une interface produit (DIP).',
        jdkExample: 'Calendar.getInstance(), List.of(), NumberFormat'
      },
      {
        pattern: 'Strategy',
        family: 'Comportement',
        solidStatus: 'yes',
        solidLabel: '✅ SRP · OCP · LSP · DIP',
        solidExplain: 'Chaque algorithme a sa classe (SRP) ; nouveau calcul ajouté sans toucher au Context (OCP).',
        jdkExample: 'java.util.Comparator<T>, javax.swing.LayoutManager'
      },
      {
        pattern: 'Decorator',
        family: 'Structure',
        solidStatus: 'yes',
        solidLabel: '✅ SRP · OCP · LSP',
        solidExplain: 'Enrichit un objet par couches fines (SRP) sans modifier la classe de base (OCP) tout en restant substituable (LSP).',
        jdkExample: 'java.io.BufferedInputStream, Collections.unmodifiableList()'
      },
      {
        pattern: 'Observer',
        family: 'Comportement',
        solidStatus: 'yes',
        solidLabel: '✅ OCP · ISP · DIP',
        solidExplain: 'Le Sujet dépend de l’interface Observer (DIP) et accepte un nombre illimité de nouveaux écouteurs (OCP).',
        jdkExample: 'ActionListener, PropertyChangeListener, Flow.Publisher'
      }
    ],
    speakerNotes:
      'Cette slide fait toujours la différence devant un jury : souligner que Singleton est en tension avec SRP et DIP montre un vrai recul critique d’ingénieur plutôt qu’une récitation par cœur !'
  },

  /* =======================================================================
     SLIDE 16 — INTERACTIVE QUIZ & CONCLUSION
     ======================================================================= */
  {
    id: 'quiz-conclusion',
    chapter: 'synthesis',
    layout: 'conclusion',
    eyebrow: '07 · Validation des Acquis & Conclusion',
    badge: 'Q&R Interactive',
    titlePlain: 'Quiz Express & ',
    titleAura: 'Règles d’Or à Retenir',
    subtitle:
      'Testez la reconnaissance des patrons sur des cas concrets de cours, puis retenez les 3 maximes fondamentales du Génie Logiciel.',
    maxims: [
      {
        num: '01',
        title: 'Programmer vers une interface, pas une implémentation',
        body: 'Déclarez toujours vos variables et paramètres avec le type abstrait (List, Notification, PaymentStrategy) pour préserver l’évolutivité (DIP / LSP).'
      },
      {
        num: '02',
        title: 'Privilégier la composition d’objets à l’héritage de classes',
        body: 'Strategy et Decorator prouvent que déléguer le travail à un objet injecté est bien plus flexible à l’exécution qu’une hiérarchie figée.'
      },
      {
        num: '03',
        title: 'Identifier ce qui varie et l’encapsuler',
        body: 'N’appliquez pas les 23 patrons partout (pas de sur-ingénierie !) : introduisez un patron là où un axe de changement réel apparaît.'
      }
    ],
    quiz: [
      {
        q: 'Cas 1 : Vous voulez calculer les frais de port selon 5 transporteurs interchangeables à l’exécution sans if/else.',
        options: ['Singleton', 'Strategy', 'Observer', 'ISP'],
        answer: 1,
        explain: 'Exact ! Strategy encapsule chaque algorithme de calcul dans une classe dédiée interchangeable au runtime.'
      },
      {
        q: 'Cas 2 : Vous souhaitez ajouter optionnellement du logging, de la compression et du chiffrement autour d’un flux de données.',
        options: ['Factory', 'Singleton', 'Decorator', 'LSP'],
        answer: 2,
        explain: 'Exact ! Decorator enveloppe dynamiquement l’objet de base (« poupées russes ») sans explosion de sous-classes.'
      },
      {
        q: 'Cas 3 : Lorsqu’un produit en rupture revient en stock, 150 clients inscrits doivent recevoir une alerte automatiquement.',
        options: ['Observer', 'Singleton', 'Decorator', 'SRP'],
        answer: 0,
        explain: 'Exact ! Observer (Publish/Subscribe) notifie tous les abonnés enregistrés dès que l’état du Sujet change.'
      }
    ],
    speakerNotes:
      'Conclusion orale : faites participer la salle avec les 3 mini-questions, rappelez qu’il faut éviter le « Patternitis » (mettre des patterns là où le besoin est simple), et ouvrez la séance de questions. Merci de votre attention !'
  }
];
