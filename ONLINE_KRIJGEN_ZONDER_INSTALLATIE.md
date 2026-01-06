# App Online Krijgen - Zonder Installatie

## ✅ Het KAN! Volledig gratis en zonder installatie

Je hebt 3 opties, allemaal **100% gratis** en **zonder installatie**:

---

## 🚀 OPTIE 1: Via GitHub Web Interface (Aanbevolen)

### Wat je nodig hebt:
- GitHub account (gratis)
- Supabase account (gratis)
- Vercel account (gratis)

### Stap 1: GitHub Repository Aanmaken (2 minuten)

1. Ga naar https://github.com
2. Maak account aan (als je die nog niet hebt) - **GRATIS**
3. Klik rechtsboven op je profiel > "Your repositories"
4. Klik groene knop "New"
5. Repository name: `bett-journaal`
6. Kies "Public" (gratis)
7. **NIET** aanvinken: "Add a README file"
8. Klik "Create repository"

### Stap 2: Code Uploaden via GitHub Web Interface (5 minuten)

**Methode A: Via GitHub Desktop (optioneel, maar makkelijker)**
- Download GitHub Desktop: https://desktop.github.com (één keer installeren, daarna niet meer nodig)
- Log in met GitHub account
- Klik "Add" > "Add Existing Repository"
- Selecteer deze map (C:\Users\KimRunhaar\Cursor Kim\Bett)
- Klik "Publish repository"
- Klaar!

**Methode B: Via Web (zonder installatie)**
1. In je GitHub repository, klik op "uploading an existing file"
2. Sleep alle bestanden uit deze map naar GitHub
3. Klik "Commit changes"
4. **Let op:** Je moet alle mappen en bestanden uploaden (app/, components/, lib/, etc.)

### Stap 3: Supabase Setup (5 minuten)

1. Ga naar https://supabase.com
2. Klik "Start your project" (gratis account)
3. Log in met GitHub (of maak account)
4. Klik "New Project"
5. Vul in:
   - **Name:** `bett-journaal`
   - **Database Password:** (kies een sterk wachtwoord, bewaar dit!)
   - **Region:** `West Europe (Frankfurt)`
6. Klik "Create new project"
7. Wacht 2 minuten tot project klaar is

### Stap 4: Database Schema Installeren (2 minuten)

1. In Supabase dashboard: klik op "SQL Editor" (linker menu)
2. Open het bestand `supabase/schema.sql` uit deze map
3. Kopieer **alle** tekst (Ctrl+A, Ctrl+C)
4. Plak in Supabase SQL Editor
5. Klik groene knop "Run" (of druk F5)
6. Controleer: je zou "Success. No rows returned" moeten zien

### Stap 5: Google OAuth Instellen (5 minuten)

1. Ga naar https://console.cloud.google.com
2. Log in met Google account
3. Klik op project dropdown (bovenaan) > "New Project"
4. Project name: `bett-journaal-oauth`
5. Klik "Create"
6. Wacht tot project klaar is, selecteer het
7. Ga naar "APIs & Services" > "Credentials" (linker menu)
8. Klik "Create Credentials" > "OAuth client ID"
9. Als gevraagd: "Configure consent screen"
   - User Type: External
   - App name: `Bett Journaal`
   - User support email: jouw email
   - Developer contact: jouw email
   - Klik "Save and Continue" (3x)
10. Terug naar Credentials:
    - Application type: "Web application"
    - Name: `Bett Journaal OAuth`
    - **Authorized redirect URIs:** Kopieer deze URL uit Supabase:
      - Ga naar Supabase > Authentication > Providers > Google
      - Kopieer de "Redirect URL" (ziet eruit als: `https://xxxxx.supabase.co/auth/v1/callback`)
      - Plak in Google Console
    - Klik "Create"
11. **Kopieer Client ID en Client Secret**
12. Terug naar Supabase:
    - Ga naar Authentication > Providers > Google
    - Enable Google provider: AAN
    - Plak Client ID en Client Secret
    - Klik "Save"

### Stap 6: Storage Bucket Aanmaken (2 minuten)

1. In Supabase: ga naar "Storage" (linker menu)
2. Klik "New bucket"
3. Name: `media`
4. **Public bucket:** AAN (zodat iedereen media kan bekijken)
5. Klik "Create bucket"

### Stap 7: Vercel Deployment (3 minuten)

1. Ga naar https://vercel.com
2. Klik "Sign Up" > Log in met GitHub
3. Klik "Add New Project"
4. Import Git Repository: selecteer `bett-journaal`
5. Klik "Import"
6. **Framework Preset:** Next.js (automatisch gedetecteerd)
7. **Environment Variables:** Klik "Add" en voeg toe:
   
   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: (vind in Supabase: Settings > API > Project URL)
   
   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (vind in Supabase: Settings > API > anon public key)
   
8. Klik "Deploy"
9. Wacht 2-3 minuten
10. **🎉 JE APP IS LIVE!** Je krijgt een URL zoals: `bett-journaal.vercel.app`

### Stap 8: Admin Gebruiker Aanmaken (2 minuten)

1. Ga naar je live app URL
2. Klik "Inloggen"
3. Log in met Google
4. Terug naar Supabase: ga naar "SQL Editor"
5. Voer deze query uit (vervang EMAIL met jouw Google email):

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'jouw-email@gmail.com';
```

6. Klik "Run"
7. Refresh je app
8. Je ziet nu "Nieuw Item" knop in de header!

---

## 🎯 OPTIE 2: Via Vercel Direct Upload (Alternatief)

Als je GitHub niet wilt gebruiken:

1. Maak een ZIP van deze hele map
2. Ga naar https://vercel.com
3. Klik "Add New Project"
4. Kies "Upload" (in plaats van GitHub)
5. Upload je ZIP
6. Volg verder vanaf Stap 7 hierboven

**Let op:** Bij deze methode moet je bij elke update opnieuw uploaden.

---

## 📱 OPTIE 3: Via GitHub Codespaces (Voor Development)

1. Push code naar GitHub (zie Optie 1)
2. In GitHub repository: klik "Code" > "Codespaces" > "Create codespace"
3. Wacht tot environment klaar is
4. In terminal: `npm install` (wacht 2 minuten)
5. In terminal: `npm run dev`
6. Je krijgt een URL om app te bekijken

---

## ✅ Wat krijg je?

- **Gratis hosting** (Vercel)
- **Gratis database** (Supabase - 500MB gratis)
- **Gratis storage** (Supabase - 1GB gratis)
- **Gratis domain** (bett-journaal.vercel.app)
- **Geen installatie nodig** (alles via web)

## 💰 Kosten: €0,00

Alle services hebben een gratis tier die ruim voldoende is voor dit project!

---

## 🆘 Hulp Nodig?

- **GitHub problemen:** https://docs.github.com
- **Supabase problemen:** https://supabase.com/docs
- **Vercel problemen:** https://vercel.com/docs

---

## ⚡ Snelle Checklist

- [ ] GitHub repository aangemaakt
- [ ] Code geüpload naar GitHub
- [ ] Supabase project aangemaakt
- [ ] Database schema geïnstalleerd
- [ ] Google OAuth ingesteld
- [ ] Storage bucket aangemaakt
- [ ] Vercel project aangemaakt
- [ ] Environment variables ingesteld
- [ ] App gedeployed
- [ ] Admin gebruiker aangemaakt
- [ ] Eerste item toegevoegd!

**Totaal tijd: ~20 minuten** ⏱️




