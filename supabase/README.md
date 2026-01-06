# Supabase Setup Instructies

## Stap 1: Supabase Project Aanmaken

1. Ga naar https://supabase.com
2. Maak een account aan (of log in)
3. Klik op "New Project"
4. Kies een naam (bijv. "bett-journaal")
5. Kies een database password (bewaar dit goed!)
6. Kies een regio (bijv. "West Europe")
7. Wacht tot het project klaar is (duurt een paar minuten)

## Stap 2: Database Schema Installeren

1. Ga naar je Supabase project dashboard
2. Klik op "SQL Editor" in het linker menu
3. Open het bestand `supabase/schema.sql` uit dit project
4. Kopieer de hele inhoud
5. Plak het in de SQL Editor
6. Klik op "Run" (of druk op Ctrl+Enter)
7. Controleer of er geen errors zijn

## Stap 3: Google OAuth Instellen

1. Ga naar "Authentication" > "Providers" in het linker menu
2. Klik op "Google"
3. Schakel "Enable Google provider" in
4. Je hebt een Google OAuth Client ID en Secret nodig:
   - Ga naar https://console.cloud.google.com
   - Maak een nieuw project of kies een bestaand project
   - Ga naar "APIs & Services" > "Credentials"
   - Klik op "Create Credentials" > "OAuth client ID"
   - Kies "Web application"
   - Voeg toe aan "Authorized redirect URIs": `https://[jouw-project-id].supabase.co/auth/v1/callback`
   - Kopieer de Client ID en Client Secret
5. Plak deze in Supabase bij Google provider settings
6. Sla op

## Stap 4: Storage Bucket Aanmaken

1. Ga naar "Storage" in het linker menu
2. Klik op "New bucket"
3. Naam: `media` (of een andere naam)
4. Maak het bucket **public** (zodat iedereen media kan bekijken)
5. Sla op

## Stap 5: Storage Policies Instellen

1. Ga naar "Storage" > "Policies"
2. Klik op je `media` bucket
3. Voeg een policy toe:
   - Policy name: "Public read access"
   - Allowed operation: SELECT
   - Policy definition: `true` (iedereen kan lezen)
4. Voeg nog een policy toe:
   - Policy name: "Admin write access"
   - Allowed operation: INSERT, UPDATE, DELETE
   - Policy definition: 
     ```sql
     EXISTS (
       SELECT 1 FROM users
       WHERE users.id = auth.uid() AND users.role = 'admin'
     )
     ```

## Stap 6: Environment Variables

1. Ga naar "Settings" > "API" in Supabase
2. Kopieer de volgende waarden:
   - Project URL
   - anon/public key
   - service_role key (let op: deze is geheim!)
3. Maak een `.env.local` bestand in je project root
4. Plak de waarden in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=je_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=je_anon_key
   SUPABASE_SERVICE_ROLE_KEY=je_service_role_key
   ```

## Stap 7: Admin Gebruiker Aanmaken

1. Laat een beheerder inloggen via Google OAuth
2. Ga naar "SQL Editor" in Supabase
3. Voer deze query uit (vervang EMAIL met het email van de beheerder):
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'EMAIL_VAN_BEHEERDER';
   ```

Klaar! Je Supabase setup is compleet.

