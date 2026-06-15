# Architecture Frontend — RegTech (`Front-End/`)

Stack : **React 19**, **Vite 6**, **Tailwind CSS 4**, **lucide-react**, **motion**, **@clerk/react**.

## Arborescence `src/`

```
Front-End/src/
├── main.tsx
├── index.css
├── domain/
│   └── reference/regtechData.ts   # Pays, produits HS, calendrier AfCFTA
├── application/
│   └── ports/RegTechApiPort.ts
├── infrastructure/
│   ├── http/apiClient.ts
│   ├── http/regtechApi.ts
│   └── repositories/HttpRegTechRepository.ts
└── presentation/
    ├── layout/RegTechShell.tsx    # Shell applicatif (sidebar, onglets)
    ├── features/
    │   ├── tariff-calculator/SimulateurTaxes.tsx
    │   ├── classification/IntelligentClassifier.tsx
    │   └── export/                # DeclarationSummary, MetricsChart, BatchLoader
    ├── components/auth/ClerkAuthButton.tsx
    └── providers/ClerkTokenBridge.tsx
```

## Flux

```
RegTechShell (presentation)
  → features (formulaires, résultats)
    → regtechApi (infrastructure) + jeton Clerk (Bearer)
      → Back POST /api/v1/simulate | classify | batch
```

Les référentiels **pays** et **produits HS** sont chargés depuis le Back (`GET /api/v1/countries`, `/tariffs`) via `ReferenceDataProvider`. Seul le calendrier AfCFTA reste local (`afcftaSchedules.ts`).

## Règles par couche

| Couche | Autorisé | Interdit |
|--------|----------|----------|
| domain | Types, référentiels statiques, fuzzyFindProducts | fetch, React |
| application | Ports | Implémentation HTTP |
| infrastructure | apiClient, regtechApi | JSX |
| presentation | Composants, état UI, providers | Logique métier durable |

## Alignement CCT

- Modules SIM, AFT, IA, EXP, AUTH
- Thème clair / sombre (EXP-04)
- Historique localStorage (EXP-05)
- Appels `/api/v1/*` versionnés ([ADR-007](../docs/decisions/007-api-rest-versionnee.md))
