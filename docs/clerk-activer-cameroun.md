# Activer les numéros Cameroun (+237) dans Clerk

L’application RegTech ne peut pas autoriser le Cameroun dans le code : c’est le **SMS allowlist** de votre instance Clerk.

Application du projet : `app_3EdCISA6pWatOI514YUyYbnogLX`

## Étapes (Dashboard)

1. Ouvrir [Clerk Dashboard](https://dashboard.clerk.com) → application **RegTech**.
2. Menu **Configure** → **SMS** (ou **User & authentication** → onglet lié au téléphone).
3. Onglet **Settings** → section **SMS allowlist** (liste des pays autorisés).
4. Rechercher **Cameroon** (ou **CM**, indicatif **+237**) et **l’activer**.
5. Enregistrer si un bouton **Save** est affiché.

Vérifier aussi **User & authentication** → **Phone** :

- **Sign-up with phone** : activé si vous exigez le téléphone à l’inscription.
- **Verify at sign-up** : recommandé (OTP par SMS).

## Après activation

1. Rechargez http://localhost:5173 (Ctrl+F5).
2. Reprenez l’inscription avec le numéro au format **+237 6XX XXX XXX** (E.164).
3. Champ **Username** : pas d’email — utiliser par ex. `vaneck_dongmo` (lettres, chiffres, `-`, `_` uniquement).

## Notes

- En **mode développement**, les SMS sont en général gratuits ; en **production**, un forfait Clerk payant peut être requis pour l’envoi de SMS.
- Si l’OTP n’arrive pas, vérifiez le crédit SMS / les logs dans **SMS** → **Logs** du Dashboard.

## Lien rapide

Depuis `Front-End/` :

```powershell
.\scripts\open-clerk-sms-cameroon.ps1
```

Puis activez **Cameroon** manuellement dans la page ouverte.
