# Netlify Deployment - Bett Journaal

## Stap 1: Environment Variables Lokaal Instellen

1. Maak een `.env.local` bestand in de root van je project
2. Kopieer de inhoud van `.env.example`
3. Vul in met je Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` = je Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = je Supabase anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` = je Supabase service role key (optioneel)

**Waar vind je deze?**
- Ga naar Supabase dashboard > Settings > API
- Kopieer Project URL en anon public key

## Stap 2: Netlify Account Aanmaken

1. Ga naar https://netlify.com
2. Klik "Sign up" (gratis account)
3. Log in met GitHub

## Stap 3: Project Importeren

1. In Netlify dashboard, klik "Add new site" > "Import an existing project"
2. Kies "Deploy with GitHub"
3. Autoriseer Netlify om toegang te krijgen tot GitHub
4. Selecteer je repository: `bett-journaal`
5. Klik "Import"

## Stap 4: Build Settings

1. **Build command:** `npm run build`
2. **Publish directory:** `.next`
3. **Node version:** 18 (of 20)

## Stap 5: Environment Variables in Netlify

1. Scroll naar "Environment variables"
2. Klik "Add variable"
3. Voeg toe:
   - `NEXT_PUBLIC_SUPABASE_URL` = je Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = je Supabase anon key
4. Klik "Deploy site"

## Stap 6: Wachten op Deployment

1. Wacht 2-3 minuten
2. Je krijgt een URL zoals: `bett-journaal.netlify.app`

## Stap 7: Custom Domain (optioneel)

1. Ga naar "Domain settings"
2. Klik "Add custom domain"
3. Volg de instructies

## Belangrijk voor Next.js op Netlify

Netlify heeft een speciale configuratie nodig voor Next.js. Maak een `netlify.toml` bestand aan (zie hieronder).



