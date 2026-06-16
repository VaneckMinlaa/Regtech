import { BATCH_COLUMNS } from "@/presentation/features/export/batchColumnDefs";

export const BATCH_GUIDE_BLOCKS: [string, string][] = [
  [
    "Étape 1 — Ouvrir le modèle",
    [
      "1. Décompressez le fichier ZIP téléchargé.",
      "2. Ouvrez « 01_Modele_Simulations_RegTech.xlsx » (pas le guide PDF).",
      "3. Vous verrez directement le tableau à remplir avec des exemples.",
    ].join("\n"),
  ],
  [
    "Étape 2 — Remplir vos simulations",
    [
      "• Une ligne = une simulation douanière.",
      "• Ligne 4 : formats attendus (ex. CMR, ex. 851712…) — ne pas importer telle quelle.",
      "• Lignes bleues : exemples concrets que vous pouvez garder, modifier ou supprimer.",
      "• Lignes jaunes : vos lignes à compléter.",
      "• Montants en devise locale du pays d'origine.",
    ].join("\n"),
  ],
  [
    "Étape 3 — Importer dans RegTech",
    [
      "1. Enregistrez le modèle rempli.",
      "2. RegTech → Traitement par lot → Importer CSV ou Excel.",
      "3. Sélectionnez « 01_Modele_Simulations_RegTech.xlsx ».",
      "4. Le calcul des taxes et l'éligibilité AfCFTA démarrent automatiquement.",
    ].join("\n"),
  ],
  [
    "Colonnes du modèle",
    BATCH_COLUMNS.map((c) => `• ${c.label} — ${c.hint}`).join("\n"),
  ],
  [
    "Codes pays (ISO 3 lettres)",
    "CMR Cameroun · NGA Nigeria · GHA Ghana · CIV Côte d'Ivoire · KEN Kenya · SEN Sénégal · ZAF Afrique du Sud",
  ],
  [
    "Années de simulation AfCFTA",
    "2025 : tarif plein · 2026 : −75 % · 2027 : −80 % · 2028 : −85 % · 2029 : −90 % · 2030 : exemption totale",
  ],
];

export const BATCH_GUIDE_SUBTITLE =
  "Ce guide accompagne le modèle « 01_Modele_Simulations_RegTech.xlsx ». Importez uniquement le modèle Excel dans RegTech.";
