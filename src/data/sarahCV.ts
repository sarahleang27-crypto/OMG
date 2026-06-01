export interface CustomExperience {
  role: string;
  company: string;
  period: string;
  highlights: string[];
}

export interface CustomEducation {
  year: string;
  degree: string;
  school: string;
  location: string;
}

export interface CustomVolunteering {
  role: string;
  organization: string;
  period: string;
  highlights: string[];
}

export interface SarahCV {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  summary_en: string;
  experiences: CustomExperience[];
  education: CustomEducation[];
  skills: string[];
  tools: string[];
  languages: {
    language: string;
    level: string;
    details?: string;
  }[];
  associative: CustomVolunteering[];
}

export const sarahLeangCV: SarahCV = {
  name: "Sarah Leang",
  title: "Marketing Opérationnel & Digital Specialist",
  email: "sarah.leang.27@gmail.com",
  phone: "07.83.74.05.06",
  location: "107 Boulevard de Champigny, 94100 Saint-Maur-des-Fossés, France",
  summary: "Prochainement diplômée d’un Master en International Consumer Marketing (août 2026), je possède deux ans d’expérience en marketing opérationnel et digital chez Groupama Protection Juridique. Polyvalente et créative, j’ai développé des compétences en CRM, gestion de campagnes et communication, renforcées par des expériences en publicité et en vente.",
  summary_en: "Soon to graduate with a Master's degree in International Consumer Marketing (August 2026), I possess two years of experience in operational and digital marketing at Groupama Protection Juridique. Versatile and creative, I have developed competencies in CRM, campaign management, and communication, bolstered by experiences in advertising and retail sales.",
  experiences: [
    {
      role: "Chargée de Marketing Opérationnel et Digital",
      company: "Groupama Protection Juridique",
      period: "Septembre 2024 - Août 2026",
      highlights: [
        "Contribution au développement et à la mise à jour des supports commerciaux et contractuels.",
        "Mise en œuvre de campagnes marketing : proposition de sujets, rédaction, création de visuels et analyse des performances.",
        "Rédaction et publication d’articles d'actualité pour les réseaux sociaux.",
        "Coordination de la préparation et de la logistique d’événements corporate."
      ]
    },
    {
      role: "Assistante chef de publicité",
      company: "lepetitjournal.com",
      period: "Juin - Décembre 2023",
      highlights: [
        "Publication, mise en place et modification d'articles de presse.",
        "Mise en place de bannières publicitaires de partenaires sur le site.",
        "Création de Webinaires et d'e-mailing personnalisés pour les clients.",
        "Suivi de l’exportation et des livraisons des magazines d'information du journal.",
        "Rédaction des bilans mensuels et annuels des clients partenaires et création de dashboards marketing."
      ]
    },
    {
      role: "Conseillère de vente",
      company: "Pull&Bear",
      period: "Juin - Août 2024",
      highlights: [
        "Accueil des clients et accompagnement personnalisé dans leur processus d'achat.",
        "Conseil sur les tailles, les styles et les disponibilités produits en magasin.",
        "Réassort des rayons et organisation globale de la boutique.",
        "Gestion des cabines d’essayage et suivi rigoureux des articles.",
        "Contribution active au maintien d’un environnement de vente propre, ordonné et accueillant."
      ]
    },
    {
      role: "Conseillère de vente",
      company: "Sandro",
      period: "Juin - Août 2022",
      highlights: [
        "Accueil et accompagnement d’une clientèle exigeante dans une expérience de vente sur-mesure hyper-personnalisée.",
        "Conseil pointu sur les collections, les coupes de vêtements et les associations de styles correspondants.",
        "Participation active à la mise en place du visual merchandising et à la valorisation des collections en surface de vente.",
        "Gestion minutieuse des stocks, réassortiment des pièces clés et préparation de commandes clients.",
        "Respect absolu des standards visuels de la boutique et de l’image de marque premium."
      ]
    }
  ],
  education: [
    {
      year: "2026",
      degree: "Master (Bac+5) – International Consumer Marketing",
      school: "ESCE International Business School",
      location: "Paris La Défense"
    },
    {
      year: "2021",
      degree: "Baccalauréat général – Mention Assez Bien",
      school: "Lycée Marcelin Berthelot",
      location: "Saint-Maur-Des-Fossés"
    }
  ],
  skills: [
    "Stratégie de contenu multicanal",
    "Reporting et KPIs marketing",
    "Interprétation de données Analytics",
    "Logistique événementielle",
    "Adaptabilité multichannel et créativité",
    "Résilience en environnement rapide",
    "Visual merchandising boutique"
  ],
  tools: [
    "Google Analytics",
    "Adobe Suite (InDesign)",
    "Microsoft Office 365 (Excel, PowerPoint, Word)",
    "Brevo",
    "Canva",
    "Notion"
  ],
  languages: [
    {
      language: "Français",
      level: "Langue Native",
      details: "Bilingue / Native speaker"
    },
    {
      language: "Anglais",
      level: "Courant (B2)",
      details: "TOEIC 807/990"
    },
    {
      language: "Cantonais",
      level: "Intermédiaire",
      details: "Maîtrise orale et familiale"
    },
    {
      language: "Chinois Mandarin",
      level: "Débutant (HSK 2)",
      details: "Bases linguistiques solides"
    }
  ],
  associative: [
    {
      role: "Graphiste bénévole",
      organization: "Église MLK",
      period: "Depuis 2026",
      highlights: [
        "Conception et mise en forme de supports visuels diffusés sur écrans LED géants lors des grandes célébrations hebdomadaires.",
        "Création de contenus graphiques adaptés et sur-mesure pour la communication globale d'événements spécifiques."
      ]
    },
    {
      role: "Bénévole – Brocante solidaire",
      organization: "Église MLK",
      period: "Novembre 2025",
      highlights: [
        "Participation active de terrain à l’organisation logistique globale et à la mise en place des stands.",
        "Étiquetage et valorisation intelligente des objets mis en vente solidaire.",
        "Gestion efficace des encaissements physiques et des paiements par terminaux bancaires (TPE)."
      ]
    }
  ]
};
