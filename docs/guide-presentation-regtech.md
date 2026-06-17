# RegTech — Guide de présentation & démo

> Document de préparation oral — jury, hackathon PawaPay (PROMOTE 2026), investisseurs ou clients.  
> **Équipe :** EAGLES · **Produit :** Assistant douanier AfCFTA pour PME africaines.  
> **URL démo :** https://regtech.efymotors.com · **API :** https://api-regtech.efymotors.com

---

## Table des matières

1. [Pitch en 30 secondes](#1-pitch-en-30-secondes)
2. [Structure de présentation recommandée (10 min)](#2-structure-de-présentation-recommandée-10-min)
3. [Parcours démo pas à pas](#3-parcours-démo-pas-à-pas)
4. [Tous les modules à expliquer](#4-tous-les-modules-à-expliquer)
5. [Points sur lesquels insister](#5-points-sur-lesquels-insister)
6. [Lexique & expressions à maîtriser](#6-lexique--expressions-à-maîtriser)
7. [Cycles métier à connaître](#7-cycles-métier-à-connaître)
8. [Banque de questions professionnelles](#8-banque-de-questions-professionnelles)
9. [Réponses aux questions pièges](#9-réponses-aux-questions-pièges)
10. [Checklist avant de monter sur scène](#10-checklist-avant-de-monter-sur-scène)

---

## 1. Pitch en 30 secondes

> **RegTech est l’assistant douanier AfCFTA pour les PME africaines.**  
> En quelques clics, un commerçant peut estimer droits de douane et TVA, vérifier l’éligibilité au traitement préférentiel ZLECAf, classer son produit avec l’IA, comparer plusieurs pays de destination, et payer son abonnement en **Mobile Money** via PawaPay.  
> Nous ne remplaçons pas la douane officielle — nous aidons à **décider avant d’expédier**.

---

## 2. Structure de présentation recommandée (10 min)

| Minute | Contenu | Objectif |
|--------|---------|----------|
| 0–1 | Accroche + problème | Montrer que la ZLECAf est complexe pour les PME |
| 1–2 | Solution RegTech | Workflow complet en une plateforme |
| 2–7 | **Démo live** | 5 modules clés (voir section 3) |
| 7–8 | Business model | SaaS + PawaPay + plans FCFA |
| 8–9 | Tech & sécurité | Clerk, API, calcul backend |
| 9–10 | Vision + clôture | Commerce intra-africain, PME d’abord |

**Phrase de clôture :**

> « RegTech transforme la complexité douanière AfCFTA en décisions chiffrées et actionnables — depuis un téléphone, payé en Mobile Money. »

---

## 3. Parcours démo pas à pas

Ordre recommandé pour un impact maximal (≈ 5 minutes de démo).

### Étape 1 — Connexion (15 s)

- Se connecter (Google ou email via Clerk).
- Mentionner : *« Authentification sécurisée, compte personnel, historique sauvegardé. »*

### Étape 2 — Classification IA (1 min)

**Onglet :** HS classification (`?tab=ia`)

1. Saisir une description : *« Import de 50 ordinateurs portables i7 avec accessoires pour revente »*
2. Cliquer **Classify the goods**
3. Montrer : code HS proposé, score de confiance, raisonnement douanier
4. Cliquer **Load into simulator**

**À dire :** *« Pas besoin de connaître le code HS — l’IA propose, l’humain valide. »*

### Étape 3 — Simulateur de taxes (1 min 30)

**Onglet :** Tariff simulator (`?tab=sim`)

1. Vérifier origine / destination / produit / valeur
2. Renseigner les coûts locaux (matière, main-d’œuvre, frais) pour l’origine AfCFTA
3. Lancer la simulation
4. Montrer la page **estimation fiscale** : total en vert, droits, TVA, préférentiel ou standard
5. Optionnel : ouvrir le **certificat pro-forma** (bordereau)

**À dire :** *« En 30 secondes, je sais si mon envoi est éligible AfCFTA et combien ça coûte. »*

### Étape 4 — Règles AfCFTA (1 min)

**Onglet :** AfCFTA rules (`?tab=aft`)

1. Montrer les **réductions progressives** 2025–2030
2. Ouvrir **Is this eligible for AfCFTA?** (validation origine)
3. Montrer la **comparaison multi-destinations** (3 pays côte à côte)

**À dire :** *« Je compare le Nigeria, la Côte d’Ivoire et le Kenya sur le même écran avant de choisir mon marché. »*

### Étape 5 — Batch (45 s)

**Onglet :** Batch processing (`?tab=csv`)

1. Télécharger le modèle Excel
2. Importer un fichier (ou montrer l’aperçu)
3. Montrer le calcul groupé

**À dire :** *« Un transitaire peut traiter tout un catalogue en une fois. »*

### Étape 6 — Historique + Pricing (1 min)

**Onglet :** History → puis Pricing

1. Montrer une simulation sauvegardée, filtre, export
2. Montrer le plan actuel, quotas, analytics
3. Montrer les cartes Starter / Pro / Business
4. *(Si jury PawaPay)* mentionner le paiement MoMo : `?tab=pricing&jury=1` pour mode démo si besoin

**À dire :** *« Tout est tracé. Et on paie en Mobile Money — pas besoin de carte bancaire. »*

### Étape 7 — Cameroun (optionnel, 30 s)

**Onglets :** Cameroon taxation + Import checklist

- Fiscalité CEMAC + checklist e-GUCE / CAMCIS
- **À dire :** *« Ancrage local Cameroun + vision continentale AfCFTA. »*

---

## 4. Tous les modules à expliquer

### Module 1 — Tariff simulator (SIM)

| Élément | Explication |
|---------|-------------|
| **Rôle** | Estimer droits de douane, TVA et total fiscal pour une expédition |
| **Entrées** | Pays origine, destination, code HS, valeur déclarée, coûts locaux, année |
| **Sorties** | Total taxes, taux appliqué, éligibilité AfCFTA, pages estimation + certificat |
| **Valeur** | Décision commerciale avant engagement logistique |

**Vocabulaire à utiliser :** simulation, valeur déclarée, droits de douane, TVA, traitement préférentiel.

---

### Module 2 — HS classification (IA)

| Élément | Explication |
|---------|-------------|
| **Rôle** | Trouver le code douanier à partir d’une description en langage naturel |
| **Entrées** | Description du produit |
| **Sorties** | Code HS, catégorie, score de confiance, suggestions alternatives |
| **Valeur** | Réduit l’erreur de classification (cause n°1 d’erreurs fiscales) |

**Vocabulaire :** nomenclature HS, score de confiance, classification locale ou cloud, correction manuelle.

---

### Module 3 — AfCFTA rules (AFT)

| Élément | Explication |
|---------|-------------|
| **Rôle** | Approfondir les règles d’origine et la stratégie tarifaire |
| **Sous-parties** | Réductions progressives · Validation origine · Comparaison multi-destinations · Biens sensibles (AFT-04) |
| **Valeur** | Optimiser le corridor et l’année de simulation |

**Vocabulaire :** ZLECAf, règles d’origine, R_origin, démantèlement tarifaire, biens sensibles.

---

### Module 4 — Batch processing (CSV)

| Élément | Explication |
|---------|-------------|
| **Rôle** | Simuler des centaines de lignes via CSV ou Excel |
| **Entrées** | Fichier modèle (origine, destination, hsCode, valeurs…) |
| **Sorties** | Rapport consolidé, totaux USD, succès/erreurs par ligne |
| **Valeur** | Productivité transitaires et grossistes |

**Vocabulaire :** traitement par lot, modèle Excel, aperçu des données, recalcul batch.

---

### Module 5 — History (HIST)

| Élément | Explication |
|---------|-------------|
| **Rôle** | Consulter, filtrer et réexporter les simulations passées |
| **Filtres** | Toutes · Préférentiel · Standard · Exclu |
| **Actions** | Détail, certificat, export CSV, impression |
| **Valeur** | Traçabilité pour banque, logistique, audit interne |

**Vocabulaire :** historique, pro-forma, bordereau, statut préférentiel/standard.

---

### Module 6 — Cameroon taxation (CMR)

| Élément | Explication |
|---------|-------------|
| **Rôle** | Estimation fiscale spécifique CEMAC (Cameroun) |
| **Entrées** | Valeur CIF, code HS, origine, année |
| **Sorties** | DDI, DAC, TVA, TCI, RID, coût portuaire estimé |
| **Valeur** | Complément AfCFTA pour le marché camerounais |

**Vocabulaire :** CEMAC, TEC, CIF, landed cost.

---

### Module 7 — Import checklist (CHECKLIST)

| Élément | Explication |
|---------|-------------|
| **Rôle** | Guider l’importateur dans les étapes e-GUCE / CAMCIS |
| **Fonction** | Liste d’étapes cochables, progression sauvegardée |
| **Valeur** | Réduit la friction pour les premiers importateurs |

**Vocabulaire :** guichet unique, e-GUCE, CAMCIS, dédouanement.

---

### Module 8 — Plans & billing (PRICING)

| Élément | Explication |
|---------|-------------|
| **Rôle** | Gérer abonnement, quotas, paiement |
| **Plans** | Free · Starter (3 500 FCFA) · Pro (19 900 FCFA) · Business (99 000 FCFA) |
| **Paiement** | PawaPay — Mobile Money (MTN, Orange, M-Pesa…) dans 20 pays |
| **Valeur** | Modèle SaaS accessible aux PME africaines |

**Vocabulaire :** quota, renouvellement mensuel/annuel, économies AfCFTA estimées, corridor principal.

---

## 5. Points sur lesquels insister

### Pour le jury business / PawaPay

1. **Mobile Money first** — paiement sans carte bancaire, 20 pays PawaPay
2. **PME africaines** — prix en FCFA, plan gratuit, interface simple
3. **Marché réel** — AfCFTA, commerce intra-africain en croissance
4. **Monétisation claire** — SaaS par abonnement, montée Starter → Pro → Business
5. **Démo MoMo live** si possible (sandbox PawaPay)

### Pour le jury technique

1. **Calcul côté backend** — pas de logique fiscale fragile dans le navigateur
2. **Auth Clerk + JWT** — routes protégées, sécurité standard
3. **Architecture propre** — domain / infrastructure / presentation
4. **Batch + IA** — scalabilité usage pro
5. **Déploiement** — Vercel (front) + API dédiée

### Pour le jury métier / douane

1. **Aide à la décision** — ne remplace pas CAMCIS ni SIMPA
2. **AfCFTA natif** — éligibilité, démantèlement 2025–2030, biens sensibles
3. **Règles d’origine** — R_origin, seuil 40 %, certificat brouillon
4. **Multi-destinations** — choix de marché éclairé
5. **Ancrage Cameroun** — CEMAC + checklist e-GUCE

### Messages différenciants (répéter 2–3 fois)

- *« De la description produit au certificat exportable en moins de 2 minutes. »*
- *« Le seul outil pensé AfCFTA + Mobile Money + PME. »*
- *« Si ce n’est pas éligible AfCFTA, on le dit clairement — pas de fausse promesse. »*

---

## 6. Lexique & expressions à maîtriser

### Commerce & douane

| Expression | Définition courte | Exemple de phrase |
|------------|-------------------|-------------------|
| **AfCFTA / ZLECAf** | Zone de libre-échange continentale africaine | « RegTech applique les règles AfCFTA. » |
| **HS / SH** | Nomenclature internationale des marchandises | « Le code HS identifie le produit. » |
| **Origine / Destination** | Pays de départ / d’arrivée (ISO : CMR, NGA, ZAF…) | « Origine Afrique du Sud, destination Nigeria. » |
| **Valeur déclarée** | Base de calcul des droits | « 10 millions FCFA de valeur déclarée. » |
| **Droits de douane** | Taxe à l’import sur la marchandise | « Les droits représentent X % de la valeur. » |
| **TVA** | Taxe sur la valeur ajoutée à l’import | « TVA destination appliquée après les droits. » |
| **Préférentiel** | Tarif réduit grâce à AfCFTA | « Traitement préférentiel accordé. » |
| **Standard** | Tarif normal (non éligible) | « Régime standard — pas d’exonération. » |
| **CIF** | Coût + assurance + fret (base import) | « Valeur CIF pour le Cameroun. » |
| **Pro-forma / bordereau** | Document récapitulatif non officiel | « Bordereau pour la banque ou le transitaire. » |

### AfCFTA

| Expression | Définition courte |
|------------|-------------------|
| **Règles d’origine** | Critères pour qu’un produit soit « africain » |
| **R_origin** | Part de valeur ajoutée locale |
| **Seuil 40 %** | Critère d’éligibilité courant AfCFTA |
| **Démantèlement tarifaire** | Baisse progressive des droits 2025→2030 |
| **Biens sensibles (AFT-04)** | Produits exclus des concessions (autos, textiles…) |
| **Certificat d’origine** | Preuve d’origine pour le dédouanement |
| **PMA / NON_PMA** | Profils pays moins avancés vs autres |

### Cameroun / CEMAC

| Expression | Définition courte |
|------------|-------------------|
| **CEMAC** | Communauté économique Afrique centrale |
| **TEC CEMAC** | Tarif extérieur commun |
| **CAMCIS** | Système douanier camerounais (déclaration) |
| **e-GUCE** | Guichet unique électronique Cameroun |
| **DDI / DAC / TCI / RID** | Composantes fiscales camerounaises |

### Produit RegTech

| Expression | Définition courte |
|------------|-------------------|
| **Simulation** | Estimation — pas liquidation officielle |
| **Quota** | Limite mensuelle par plan |
| **Batch** | Import masse CSV/Excel |
| **Corridor** | Paire origine→destination (ex. ZAF→AGO) |
| **Mobile Money / MoMo** | Paiement via téléphone (MTN, Orange…) |

---

## 7. Cycles métier à connaître

### Cycle utilisateur RegTech

```
Classifier (IA) → Simuler → Vérifier AfCFTA → Comparer destinations
       → Sauvegarder historique → Exporter certificat → (Cameroun) Checklist
```

### Cycle douanier réel (où RegTech s’arrête)

```
Préparation dossier → Déclaration (CAMCIS) → Paiement douane → Mainlevée → Livraison
         ↑
    RegTech intervient ICI (avant déclaration)
```

### Calendrier AfCFTA (à réciter si on vous le demande)

| Année | Réduction indicative |
|-------|----------------------|
| 2025 | 0 % (tarif de base) |
| 2026 | −75 % |
| 2027 | −80 % |
| 2028 | −85 % |
| 2029 | −90 % |
| 2030 | −100 % (exemption totale si éligible) |

### Cycle commercial SaaS

```
Inscription → Plan Free → Usage → Quota atteint → Upgrade PawaPay → Plan actif
```

---

## 8. Banque de questions professionnelles

### Questions jury / investisseur — Produit & marché

1. Quel problème résolvez-vous exactement ?
2. Qui est votre client cible ?
3. Pourquoi maintenant (AfCFTA) ?
4. En quoi êtes-vous différent d’un Excel ou d’un consultant ?
5. Quelle est votre taille de marché ?
6. Comment gagnez-vous de l’argent ?
7. Pourquoi le Mobile Money et pas la carte bancaire ?
8. Que se passe-t-il si l’utilisateur n’est pas éligible AfCFTA ?
9. Couvrez-vous tout le continent ?
10. Quelle est votre vision à 3 ans ?

### Questions jury — Technique

1. Où se fait le calcul fiscal ?
2. Comment sécurisez-vous les données ?
3. Quelle stack utilisez-vous ?
4. Comment gérez-vous les pannes API ?
5. L’IA peut-elle se tromper ?
6. Comment fonctionne le batch à grande échelle ?
7. Comment évitez-vous la fraude sur les quotas ?
8. Clerk ou auth maison — pourquoi ?

### Questions jury — Métier douane

1. RegTech remplace-t-il la douane ?
2. D’où viennent vos taux ?
3. Comment validez-vous l’origine AfCFTA ?
4. Que sont les biens sensibles ?
5. Pourquoi le module Cameroun en plus d’AfCFTA ?
6. Le certificat généré a-t-il valeur légale ?

### Questions jury — PawaPay / business

1. Montrez-nous un paiement.
2. Quels pays MoMo supportez-vous ?
3. Que se passe-t-il après le webhook PawaPay ?
4. Plan gratuit — comment convertissez-vous ?
5. Pourquoi le plan Business à 99 000 FCFA ?

### Questions client / utilisateur

1. Puis-je faire confiance au montant affiché ?
2. Combien de simulations par mois ?
3. Puis-je exporter pour ma banque ?
4. Comment importer mon catalogue Excel ?
5. Mes données sont-elles privées ?

---

## 9. Réponses aux questions pièges

| Question piège | Réponse honnête recommandée |
|----------------|----------------------------|
| « Vous garantissez le taux douanier ? » | **Non.** Estimation basée sur référentiels publics — seule la douane fait foi. |
| « AfCFTA = 0 % partout ? » | **Non.** Dépend éligibilité, année, produit sensible, pays. |
| « L’IA remplace le classificateur ? » | **Non.** Elle accélère la proposition ; l’humain valide. |
| « Vous êtes une douane en ligne ? » | **Non.** Outil d’aide à la décision **avant** déclaration. |
| « Pourquoi pas 100 % gratuit ? » | Coûts API, IA, maintenance — le Free permet de tester. |
| « Et si PawaPay est down ? » | Bannière d’erreur, pas de faux paiement ; retry possible. |

---

## 10. Checklist avant de monter sur scène

### Technique

- [ ] URL prod accessible : https://regtech.efymotors.com
- [ ] Compte de démo connecté (Clerk)
- [ ] API OK : pas de bandeau rouge
- [ ] Fichier Excel batch prêt (modèle téléchargé et rempli)
- [ ] Connexion internet stable
- [ ] Onglet du navigateur en français ou anglais selon jury
- [ ] Mode jury si besoin : `?jury=1` sur Pricing

### Contenu oral

- [ ] Pitch 30 s mémorisé
- [ ] Ordre démo : IA → Sim → AfCFTA → Batch → History → Pricing
- [ ] 3 messages différenciants prêts
- [ ] Limite honnête : « estimation, pas douane officielle »
- [ ] Chiffres plans : Free, 3 500, 19 900, 99 000 FCFA

### À ne pas faire

- [ ] Ne pas promettre 0 % de droits systématiquement
- [ ] Ne pas dire que le certificat remplace un document douanier officiel
- [ ] Ne pas lancer une démo batch sans fichier testé avant
- [ ] Ne pas ignorer une erreur API — l’expliquer calmement

---

## Annexe — Plans & quotas (référence rapide)

| Plan | Prix/mois (FCFA) | Cible | Points clés |
|------|------------------|-------|-------------|
| **Free** | 0 | Étudiants, découverte | 3 sim. / 5 classifications / mois |
| **Starter** | 3 500 | Commerçant occasionnel | 50 sim., batch 20 lignes, PDF |
| **Pro** | 19 900 | PME import/export | Simulations illimitées, batch 500 |
| **Business** | 99 000 | Transitaire, API | Batch illimité, 10 000 appels API |

**Paiement :** PawaPay · **20 pays** · MTN, Orange, M-Pesa, Wave, etc.

---

## Annexe — Stack (si question technique)

| Couche | Technologie |
|--------|-------------|
| Front | React 19, Vite, TypeScript, Tailwind |
| Auth | Clerk |
| API | FastAPI (`api-regtech.efymotors.com`) |
| Paiement | PawaPay |
| Hébergement front | Vercel |
| IA classification | API backend (cloud / local) |

---

*Document généré pour RegTech — EAGLES · PROMOTE 2026. Mettre à jour après chaque évolution majeure du produit.*
