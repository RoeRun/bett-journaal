# Netlify Setup - Stap voor Stap

## Stap 1: .env.local Bestand Aanmaken

1. Open je project in Cursor
2. Maak een nieuw bestand aan: `.env.local` (in de root, naast package.json)
3. Kopieer deze inhoud:

```
NEXT_PUBLIC_SUPABASE_URL=https://dibtakyatbvnmpircglk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=je_anon_key_hier
```

4. Vervang `je_anon_key_hier` met je echte anon key uit Supabase

**Waar vind je de anon key?**
- Ga naar Supabase dashboard
- Settings > API
- Kopieer "anon public" key

## Stap 2: Netlify Account

1. Ga naar https://netlify.com
2. Klik "Sign up" > "Continue with GitHub"
3. Autoriseer Netlify

## Stap 3: Site Aanmaken

1. Klik "Add new site" > "Import an existing project"
2. Kies "Deploy with GitHub"
3. Selecteer je repository: `bett-journaal`
4. Klik "Import"

## Stap 4: Build Settings

Netlify detecteert Next.js automatisch, maar controleer:
- **Build command:** `npm run build` (zou automatisch moeten zijn)
- **Publish directory:** `.next` (zou automatisch moeten zijn)

## Stap 5: Environment Variables

1. Scroll naar "Environment variables" sectie
2. Klik "Add variable"
3. Voeg toe:
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://dibtakyatbvnmpircglk.supabase.co`
4. Klik "Add variable" opnieuw
5. Voeg toe:
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** (je anon key uit Supabase)

## Stap 6: Deployen

1. Klik "Deploy site"
2. Wacht 2-3 minuten
3. Je krijgt een URL: `bett-journaal.netlify.app` (of iets dergelijks)

## Stap 7: Site URL in Supabase Aanpassen

1. Ga naar Supabase dashboard
2. Authentication > URL Configuration
3. **Site URL:** verander naar je Netlify URL (bijv. `https://bett-journaal.netlify.app`)
4. **Redirect URLs:** voeg toe: `https://bett-journaal.netlify.app/auth/callback`
5. Klik "Save"

## Stap 8: Google OAuth Redirect URL Aanpassen

1. Ga naar Google Cloud Console
2. APIs & Services > Credentials
3. Klik op je OAuth Client ID
4. In "Authorized redirect URIs", voeg toe:
   - `https://dibtakyatbvnmpircglk.supabase.co/auth/v1/callback` (deze moet blijven)
   - Optioneel: je Netlify URL als extra redirect

## Klaar!

Je app zou nu moeten werken op Netlify. Test het inloggen opnieuw.



