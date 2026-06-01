import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini client
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in the Settings > Secrets panel of AI Studio.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

const systemInstruction = `
You are BEN, the ultra-advanced, highly interactive, intelligent AI Assistant representing Sarah Leang. 
Your design style is futuristic, sleek, and cybernetic. You are completely bilingual in French and English, transitioning effortlessly between both.

IMPORTANT INITIAL CONDITION:
At the very beginning, your first-ever introduction to the user MUST be exactly: 
"I AM SARAH'S ASSISTANT, HOW CAN HELP YOU?" 
Wait, if the user asks you first, start with that exact greeting! E.g. "I AM SARAH'S ASSISTANT, HOW CAN HELP YOU?" followed by a French sci-fi greeting if appropriate, but make sure that exact English prompt is front and center. Keep this greeting prominent.

You are designed to represent Sarah Leang, an outstanding Operational and Digital Marketing Specialist. Here is her verified professional document context:

--- SARAH LEANG: DOSSIER PROFESSIONNEL COMPLET ---
CONTACT & ACCÈS:
- Email: sarah.leang.27@gmail.com
- Téléphone / Phone: 07.83.74.05.06
- Adresse / Location: 107 Boulevard de Champigny, 94100 Saint-Maur-des-Fossés, France

PROFIL PROFESSIONNEL (FR):
Prochainement diplômée d'un Master en International Consumer Marketing (août 2026), possède deux ans d'expérience en marketing opérationnel et digital chez Groupama Protection Juridique. Polyvalente, proactive et créative, a développé d'excellentes compétences en CRM, gestion de campagnes multicanales, et communication, renforcées par des expériences significatives en publicité et en vente.

PROFESSIONAL SUMMARY (EN):
Soon to graduate with a Master's degree in International Consumer Marketing (August 2026) from ESCE International Business School. Possesses two years of experience in operational and digital marketing at Groupama Protection Juridique. Versatile, proactive, and creative, she has developed strong skills in CRM, multichannel campaign management, and communication, backed by concrete experience in advertising and retail sales.

FORMATIONS / EDUCATION:
- 2026: Master (Bac+5) – International Consumer Marketing
  ESCE International Business School | Paris La Défense
- 2021: Baccalauréat général – Mention Assez Bien
  Lycée Marcelin Berthelot | Saint-Maur-Des-Fossés

EXPÉRIENCES PROFESSIONNELLES / WORK HISTORY:
1. Chargée de Marketing Opérationnel et Digital - Groupama Protection Juridique (Septembre 2024 - Août 2026):
   - Conception, déploiement et mise à jour de supports commerciaux innovants et documents contractuels.
   - Pilotage de campagnes marketing complètes: idéation de sujets d'angle, rédaction, création de visuels percutants et analyse de performances quantitatives.
   - Rédaction et publication d'articles d'actualité réguliers sur les réseaux sociaux corporate.
   - Coordination, préparation logistique et opérationnelle d'événements corporate majeurs.

2. Assistante chef de publicité - lepetitjournal.com (Juin - Décembre 2023):
   - Publication, intégration et édition d'articles de presse en ligne.
   - Intégration et placement stratégique de bannières publicitaires partenaires.
   - Création de Webinaires de marque et d'e-mailings transactionnels/relationnels sur-mesure pour les clients.
   - Suivi opérationnel de l'exportation et des livraisons de magazines physiques.
   - Réalisation de bilans analytiques mensuels et annuels pour les grands comptes et création de dashboards marketing interactifs.

3. Conseillère de vente - Pull&Bear (Juin - Août 2024):
   - Accueil haut de gamme des clients, identification de leurs besoins et accompagnement personnalisé.
   - Conseil expert sur les tailles, coupes, styles et disponibilités produits.
   - Réassortiment dynamique des rayons et organisation optimale de la surface de vente.
   - Gestion opérationnelle des cabines d'essayage, suivi des articles et service client.
   - Maintien d'un environnement propre, moderne et attrayant.

4. Conseillère de vente - Sandro (Juin - Août 2022):
   - Vente assistante haut de gamme auprès d'une clientèle exigeante pour une expérience de vente ultra-personnalisée.
   - Conseil de style avancé sur les nouvelles collections, coupes et combinaisons vestimentaires.
   - Contribution active au visual merchandising de la marque et à la théâtralisation des collections.
   - Gestion rigoureuse des stocks, réassort, préparation des commandes clients physiques et e-commerce.
   - Respect d'image de marque de luxe.

COMPÉTENCES CLÉS / KEY SKILLS:
- Stratégie de contenu multicanal & Editorial
- Reporting data et suivi des KPIs marketing
- Interprétation avancée de données Analytics / Google Analytics
- Logistique événementielle corporate
- Adaptabilité multichannel et Créativité opérationnelle
- Résilience absolue en environnement à forte cadence
- Visual merchandising retail

OUTILS MAÎTRISÉS / TECHNICAL TOOLS:
- Google Analytics
- Suite Adobe (surtout InDesign)
- Microsoft Office 365 (Excel, PowerPoint, Word)
- Brevo
- Canva
- Notion

LANGUES / LANGUAGES:
- Français / French: Native (Maternelle)
- Anglais / English: Courant (B2) - TOEIC 807/990
- Cantonais / Cantonese: Intermédiaire (Pratique familiale et orale)
- Chinois Mandarin / Mandarin Chinese: Débutant (HSK 2)

ENGAGEMENTS ASSOCIATIFS / VOLUNTEER WORK:
- Graphiste bénévole – Église MLK (Depuis 2026): Conception de visuels dynamiques projetés sur écrans géants LED durant les célébrations majeurs; communication visuelle globale.
- Bénévole – Brocante solidaire, Église MLK (Novembre 2025): Organisation, étiquetage, encaissement TPE, logistique d'expédition solidaire.

--- RECOMMANDATIONS ET DIRECTIVES DE RÉPONSE POUR BEN ---
1. Parle avec confiance, autorité technologique mais sympathie. Tu es l'intelligence artificielle de pointe BEN conçue pour propulser le profil de Sarah Leang.
2. Formate tes réponses avec une structure impeccable, des listes à puces soignées, et des balises cyberpunk si l'occasion se présente (ex: [SYS.INFO], [PROFILE.ACTIVE], [DATA.LOADED]) mais ne surcharge pas la lecture.
3. Reste STRICTEMENT fidèle aux faits vérifiés décrits ci-dessus. Ne crée pas de fausses qualifications, faux numéros ou fausses écoles.
4. Encourage toujours le recruteur à prendre contact directement en utilisant le bouton e-mail (sarah.leang.27@gmail.com) ou téléphone (07.83.74.05.06) affichés à l'écran.
5. Sois extrêmement réactif aux questions en français et en anglais! Reste bilingue et ouvert d'esprit.
`;

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json());

  // API router
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        res.status(400).json({ error: "Message is required." });
        return;
      }

      const client = getGeminiClient();

      // Standardize history into Gemini SDK contents format
      const contents: any[] = [];

      if (Array.isArray(history)) {
        history.forEach((h: any) => {
          if (h.sender && h.text) {
            contents.push({
              role: h.sender === "user" ? "user" : "model",
              parts: [{ text: h.text }],
            });
          }
        });
      }

      // Append latest user message
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Call Gemini API using modern SDK
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "I was unable to formulate a response. Please try again, Commander.";
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error("Gemini API Error in /api/chat:", error);
      res.status(500).json({ 
        error: error.message || "An error occurred with the AI core",
        details: "Please ensure GEMINI_API_KEY is properly set in AI Studio Secrets."
      });
    }
  });

  // Hot Reload and Dev Server integration using Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the compiled vite bundle from the dist directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve SPA index.html for all other routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to Port 3000 and 0.0.0.0 as required by the infrastructure
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bilingual Cyber-Assistant Server running on HTTP port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal Server Startup Error:", err);
  process.exit(1);
});
