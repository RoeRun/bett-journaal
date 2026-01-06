# Plan: Bett Journaal Webapp voor Stichting Chrono

## Projectoverzicht
Interactieve, cloud-based webapp voor Stichting Chrono: een visueel Bett-journaal waar docenten en staf op Bett hun ervaringen kunnen delen via foto, video, audio en korte teksten. Collega's in Nederland kunnen het journaal bekijken en reageren.

## Gemaakte Keuzes (Requirements)

### Authenticatie & Toegang
- **Beheerders (bijdragers op Bett)**: Google login verplicht
- **Viewers (collega's in Nederland)**: Geen login nodig, direct toegang
- **Reacties**: Naam en rol verplicht bij elke reactie (niet-anoniem)

### Functionaliteiten
- **Tijdlijn**: Per beursdag (4 dagen: dinsdag 20 t/m vrijdag 23 januari), met meerdere sub-items per dag
- **Sub-items**: Meerdere media (foto/video), korte tekst, optionele audio, optioneel actieveld (SMART-doel + eigenaar), handmatige thema's/tags
- **Media upload**: Drag-and-drop, limieten: 50MB video, 10MB foto's
- **Realtime updates**: Binnen minuut zichtbaar (geen directe realtime nodig)
- **Polls/Quiz**: Beheerders maken, viewers kunnen deelnemen (zonder login)
- **Highlights**: Automatische suggesties + handmatige bevestiging door beheerders
- **Thema's/Tags**: Vaste lijst + mogelijkheid nieuwe toe te voegen
- **PDF export**: Kiesbaar wat erin komt (dagen, thema's, etc.)

### Design & UX
- **Speels en kleurrijk**: Tegels/cards met afgeronde hoeken, lichte schaduwen, iconen
- **Animaties**: Bij scroll/upload
- **Responsive**: Volledig mobiel-vriendelijk, vooral voor beheerders op smartphone
- **Tijdlijn**: Overzichtelijk met visuele markeringen per dag en sub-item

## Technische Stack (Advies)

### Frontend
- **Next.js 14** (React framework) met TypeScript
- **Tailwind CSS** voor styling
- **Shadcn UI** voor componenten
- **Framer Motion** voor animaties
- **React Hook Form** voor formulieren
- **Zustand** voor state management

### Backend & Database
- **Supabase** (PostgreSQL database, realtime subscriptions, storage, auth)
  - Database voor tijdlijn, sub-items, reacties, polls, thema's
  - Storage voor media (foto's, video's, audio)
  - Auth voor Google login (alleen beheerders)
  - Realtime subscriptions voor updates (binnen minuut)

### Media & Bestanden
- **Supabase Storage** voor foto's, video's, audio
- **Image optimization** via Next.js Image component
- **Video streaming** via Supabase Storage URLs

### PDF Generatie
- **jsPDF** of **Puppeteer** voor PDF generatie
- **React-PDF** voor client-side PDF generatie

### Hosting & Development
- **Vercel** voor frontend deployment (gebruikt hun build-systeem, geen lokale installatie nodig)
- **Supabase** voor backend (included)
- **GitHub** voor versiebeheer (optioneel, voor Vercel deployment)
- **Notitie**: Bestanden worden handmatig aangemaakt zonder lokale Node.js installatie

## Taak Breakdown

### Fase 1: Project Setup & Basis Structuur
- [ ] **1.1** Next.js project bestanden handmatig aanmaken (package.json, tsconfig.json, etc.)
- [ ] **1.2** Tailwind CSS configuratie bestanden aanmaken
- [ ] **1.3** Shadcn UI componenten bestanden aanmaken
- [ ] **1.4** Supabase client setup bestanden aanmaken
- [ ] **1.5** Environment variables template aanmaken (.env.example)
- [ ] **1.6** Basis project structuur aanmaken (folders, routing, app directory)

**Success criteria**: Alle basis bestanden zijn aangemaakt, structuur is klaar voor deployment via Vercel

---

### Fase 2: Database Schema & Authenticatie
- [ ] **2.1** Database schema ontwerpen en documenteren
  - Tabel: `days` (dag, datum, highlights)
  - Tabel: `sub_items` (dag_id, titel, tekst, media_urls, audio_url, actieveld, eigenaar, thema_ids)
  - Tabel: `media` (sub_item_id, type, url, filename)
  - Tabel: `themes` (naam, kleur, is_custom)
  - Tabel: `sub_item_themes` (sub_item_id, theme_id)
  - Tabel: `reactions` (sub_item_id, naam, rol, tekst, datum)
  - Tabel: `polls` (sub_item_id, vraag, type, opties, resultaten)
  - Tabel: `poll_responses` (poll_id, naam, rol, antwoord)
  - Tabel: `users` (supabase auth, role: admin/viewer)
- [ ] **2.2** Supabase database tabellen aanmaken
- [ ] **2.3** Row Level Security (RLS) policies instellen
  - Beheerders: kunnen alles aanmaken/bewerken
  - Viewers: kunnen alleen lezen en reageren
- [ ] **2.4** Google OAuth configureren in Supabase
- [ ] **2.5** Auth middleware/logic implementeren
- [ ] **2.6** Basis vaste thema's toevoegen aan database

**Success criteria**: Database werkt, Google login werkt voor beheerders, RLS policies actief

---

### Fase 3: Basis UI & Layout
- [ ] **3.1** Basis layout component (header, footer, navigation)
- [ ] **3.2** Mobiel-vriendelijke responsive layout
- [ ] **3.3** Login pagina voor beheerders
- [ ] **3.4** Home/dashboard pagina (tijdlijn overzicht)
- [ ] **3.5** Kleurenschema en design tokens definiëren
- [ ] **3.6** Basis card/tegel component met afgeronde hoeken en schaduwen

**Success criteria**: Basis layout werkt op desktop en mobiel, login flow werkt

---

### Fase 4: Tijdlijn Weergave
- [ ] **4.1** Tijdlijn component per dag (4 dagen)
- [ ] **4.2** Sub-item cards met media preview
- [ ] **4.3** Visuele markeringen per dag en sub-item
- [ ] **4.4** Media viewer (lightbox voor foto's, video player)
- [ ] **4.5** Audio player component
- [ ] **4.6** Scroll animaties implementeren
- [ ] **4.7** Loading states en error handling

**Success criteria**: Tijdlijn toont alle dagen correct, media wordt goed weergegeven, animaties werken

---

### Fase 5: Media Upload (Beheerders)
- [ ] **5.1** Drag-and-drop upload component
- [ ] **5.2** Bestand validatie (type, grootte: 50MB video, 10MB foto)
- [ ] **5.3** Upload naar Supabase Storage
- [ ] **5.4** Progress indicator tijdens upload
- [ ] **5.5** Image optimization/compression
- [ ] **5.6** Multi-file upload ondersteuning
- [ ] **5.7** Upload animaties

**Success criteria**: Beheerders kunnen media uploaden via drag-and-drop, validatie werkt, bestanden worden opgeslagen

---

### Fase 6: Sub-item Aanmaken/Bewerken (Beheerders)
- [ ] **6.1** Formulier voor sub-item aanmaken
  - Tekstveld (korte tekst)
  - Media upload (meerdere)
  - Audio upload (optioneel)
  - Actieveld (SMART-doel tekst + eigenaar)
  - Thema's selecteren/toevoegen
  - Dag selecteren
- [ ] **6.2** Thema selector met vaste lijst + "nieuw thema" optie
- [ ] **6.3** Formulier validatie
- [ ] **6.4** Sub-item opslaan in database
- [ ] **6.5** Mobiel-vriendelijk formulier design
- [ ] **6.6** Edit functionaliteit voor bestaande sub-items

**Success criteria**: Beheerders kunnen sub-items aanmaken met alle velden, thema's kunnen worden toegevoegd

---

### Fase 7: Reacties Systeem
- [ ] **7.1** Reactie formulier component (naam + rol verplicht)
- [ ] **7.2** Reacties weergave per sub-item
- [ ] **7.3** Reacties opslaan in database
- [ ] **7.4** Reacties sorteren (nieuwste eerst)
- [ ] **7.5** Mobiel-vriendelijke reactie interface

**Success criteria**: Viewers kunnen reageren met naam/rol, reacties worden getoond, niet-anoniem

---

### Fase 8: Polls/Quiz Functionaliteit
- [ ] **8.1** Poll aanmaak formulier (beheerders)
  - Vraag
  - Type (meerkeuze, open, rating)
  - Opties (voor meerkeuze)
- [ ] **8.2** Poll weergave component
- [ ] **8.3** Poll deelname formulier (viewers, naam + rol verplicht)
- [ ] **8.4** Poll resultaten weergave
- [ ] **8.5** Poll resultaten opslaan en berekenen

**Success criteria**: Beheerders kunnen polls aanmaken, viewers kunnen deelnemen, resultaten worden getoond

---

### Fase 9: Filtering & Zoeken
- [ ] **9.1** Thema filter component
- [ ] **9.2** Filter logica implementeren
- [ ] **9.3** Dag filter (per dag bekijken)
- [ ] **9.4** Zoek functionaliteit (optioneel)
- [ ] **9.5** Filter state management

**Success criteria**: Viewers kunnen filteren op thema's en dagen, filters werken correct

---

### Fase 10: Highlights Systeem
- [ ] **10.1** Algoritme voor automatische highlight suggesties
  - Meeste reacties
  - Meeste bekeken
  - Polls met meeste deelnemers
- [ ] **10.2** Highlight suggesties weergave voor beheerders
- [ ] **10.3** Handmatige highlight bevestiging interface
- [ ] **10.4** Highlights weergave in tijdlijn (visuele markering)
- [ ] **10.5** Highlights sectie op home pagina

**Success criteria**: Systeem suggereert highlights, beheerders kunnen bevestigen, highlights zijn zichtbaar

---

### Fase 11: PDF Export
- [ ] **11.1** PDF export opties interface
  - Dagen selecteren
  - Thema's selecteren
  - Inclusief/exclusief reacties
  - Inclusief/exclusief polls
- [ ] **11.2** PDF generatie logica
- [ ] **11.3** PDF layout design
- [ ] **11.4** Media in PDF (thumbnails of links)
- [ ] **11.5** PDF download functionaliteit

**Success criteria**: Gebruikers kunnen PDF genereren met gekozen opties, PDF ziet er goed uit

---

### Fase 12: Realtime Updates
- [ ] **12.1** Supabase realtime subscriptions configureren
- [ ] **12.2** Auto-refresh logica (binnen minuut)
- [ ] **12.3** Update notificaties (optioneel, subtiel)
- [ ] **12.4** Conflict handling bij gelijktijdige updates

**Success criteria**: Nieuwe content is binnen minuut zichtbaar voor alle gebruikers

---

### Fase 13: Mobiel Optimalisatie
- [ ] **13.1** Touch-friendly interfaces
- [ ] **13.2** Mobiel upload optimalisatie
- [ ] **13.3** Mobiel media viewer
- [ ] **13.4** Performance optimalisatie voor mobiel
- [ ] **13.5** Offline handling (basis)

**Success criteria**: App werkt perfect op smartphone, uploads zijn snel en betrouwbaar

---

### Fase 14: Testing & Bugfixes
- [ ] **14.1** Functionaliteit testen op desktop
- [ ] **14.2** Functionaliteit testen op mobiel
- [ ] **14.3** Edge cases testen (grote bestanden, veel reacties, etc.)
- [ ] **14.4** Bugfixes
- [ ] **14.5** Performance optimalisatie

**Success criteria**: App werkt stabiel, geen kritieke bugs, goede performance

---

### Fase 15: Deployment
- [ ] **15.1** Vercel project aanmaken
- [ ] **15.2** Environment variables configureren
- [ ] **15.3** Production build testen
- [ ] **15.4** Deploy naar Vercel
- [ ] **15.5** Domain configureren (optioneel)
- [ ] **15.6** Final testing in production

**Success criteria**: App is live en werkt in productie

---

## Database Schema (Conceptueel)

```
days
- id (uuid, primary key)
- day_number (int, 1-4)
- date (date)
- title (text, "Dag 1 - Dinsdag 20 januari")
- highlights (jsonb, array of sub_item_ids)

sub_items
- id (uuid, primary key)
- day_id (uuid, foreign key -> days)
- title (text)
- text (text)
- audio_url (text, nullable)
- action_field_text (text, nullable, SMART-doel)
- action_field_owner (text, nullable)
- created_at (timestamp)
- created_by (uuid, foreign key -> users)

media
- id (uuid, primary key)
- sub_item_id (uuid, foreign key -> sub_items)
- type (text: 'image' | 'video' | 'audio')
- url (text, Supabase Storage URL)
- filename (text)
- order (int)

themes
- id (uuid, primary key)
- name (text, unique)
- color (text, hex color)
- is_custom (boolean, default false)

sub_item_themes
- sub_item_id (uuid, foreign key -> sub_items)
- theme_id (uuid, foreign key -> themes)
- (composite primary key)

reactions
- id (uuid, primary key)
- sub_item_id (uuid, foreign key -> sub_items)
- name (text, required)
- role (text, required)
- text (text)
- created_at (timestamp)

polls
- id (uuid, primary key)
- sub_item_id (uuid, foreign key -> sub_items)
- question (text)
- type (text: 'multiple_choice' | 'open' | 'rating')
- options (jsonb, array voor multiple_choice)
- created_at (timestamp)

poll_responses
- id (uuid, primary key)
- poll_id (uuid, foreign key -> polls)
- name (text, required)
- role (text, required)
- answer (text/jsonb)
- created_at (timestamp)

users (Supabase Auth + custom fields)
- id (uuid, from Supabase Auth)
- email (text, from Supabase Auth)
- role (text: 'admin' | 'viewer', default 'viewer')
- name (text, nullable)
```

## Prioriteiten

**Must Have (MVP)**:
- Fase 1-6: Basis setup, database, tijdlijn, media upload, sub-items aanmaken
- Fase 7: Reacties
- Fase 13: Mobiel optimalisatie (kritiek voor beheerders)

**Should Have**:
- Fase 8: Polls
- Fase 9: Filtering
- Fase 10: Highlights
- Fase 12: Realtime updates

**Nice to Have**:
- Fase 11: PDF export
- Extra animaties en polish

## Volgende Stappen

1. Wacht op goedkeuring van dit plan
2. Start met Fase 1 zodra goedgekeurd
3. Iteratief werken: elke fase testen voordat volgende fase start

