-- Bett Journaal Database Schema voor Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Days table (4 dagen: dinsdag 20 t/m vrijdag 23 januari)
CREATE TABLE days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_number INTEGER NOT NULL UNIQUE CHECK (day_number BETWEEN 1 AND 4),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  highlights JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Themes table (vaste thema's + custom)
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sub items table (workshops, stands, ontmoetingen, etc.)
CREATE TABLE sub_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  text TEXT,
  audio_url TEXT,
  action_field_text TEXT,
  action_field_owner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Media table (foto's, video's, audio)
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sub_item_id UUID NOT NULL REFERENCES sub_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio')),
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sub item themes (many-to-many)
CREATE TABLE sub_item_themes (
  sub_item_id UUID NOT NULL REFERENCES sub_items(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  PRIMARY KEY (sub_item_id, theme_id)
);

-- Reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sub_item_id UUID NOT NULL REFERENCES sub_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sub_item_id UUID NOT NULL REFERENCES sub_items(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'open', 'rating')),
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll responses table
CREATE TABLE poll_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sub_items_day_id ON sub_items(day_id);
CREATE INDEX idx_sub_items_created_at ON sub_items(created_at DESC);
CREATE INDEX idx_media_sub_item_id ON media(sub_item_id);
CREATE INDEX idx_media_order ON media("order");
CREATE INDEX idx_reactions_sub_item_id ON reactions(sub_item_id);
CREATE INDEX idx_reactions_created_at ON reactions(created_at DESC);
CREATE INDEX idx_polls_sub_item_id ON polls(sub_item_id);
CREATE INDEX idx_poll_responses_poll_id ON poll_responses(poll_id);
CREATE INDEX idx_sub_item_themes_sub_item_id ON sub_item_themes(sub_item_id);
CREATE INDEX idx_sub_item_themes_theme_id ON sub_item_themes(theme_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_item_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;

-- Days: Everyone can read, only admins can write
CREATE POLICY "Days are viewable by everyone" ON days
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert days" ON days
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update days" ON days
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Themes: Everyone can read, only admins can write
CREATE POLICY "Themes are viewable by everyone" ON themes
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert themes" ON themes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update themes" ON themes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Users: Everyone can read, only admins can write
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Sub items: Everyone can read, only admins can write
CREATE POLICY "Sub items are viewable by everyone" ON sub_items
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert sub items" ON sub_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update sub items" ON sub_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete sub items" ON sub_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Media: Everyone can read, only admins can write
CREATE POLICY "Media are viewable by everyone" ON media
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert media" ON media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete media" ON media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Sub item themes: Everyone can read, only admins can write
CREATE POLICY "Sub item themes are viewable by everyone" ON sub_item_themes
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert sub item themes" ON sub_item_themes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete sub item themes" ON sub_item_themes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Reactions: Everyone can read and write (no login needed for viewers)
CREATE POLICY "Reactions are viewable by everyone" ON reactions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert reactions" ON reactions
  FOR INSERT WITH CHECK (true);

-- Polls: Everyone can read, only admins can write
CREATE POLICY "Polls are viewable by everyone" ON polls
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert polls" ON polls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Poll responses: Everyone can read and write (no login needed for viewers)
CREATE POLICY "Poll responses are viewable by everyone" ON poll_responses
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert poll responses" ON poll_responses
  FOR INSERT WITH CHECK (true);

-- Insert initial data: 4 days
INSERT INTO days (day_number, date, title) VALUES
  (1, '2025-01-20', 'Dag 1 - Dinsdag 20 januari'),
  (2, '2025-01-21', 'Dag 2 - Woensdag 21 januari'),
  (3, '2025-01-22', 'Dag 3 - Donderdag 22 januari'),
  (4, '2025-01-23', 'Dag 4 - Vrijdag 23 januari');

-- Insert initial themes (vaste thema's)
INSERT INTO themes (name, color, is_custom) VALUES
  ('Workshop', '#3B82F6', false),
  ('Stand', '#10B981', false),
  ('Ontmoeting', '#F59E0B', false),
  ('Technologie', '#8B5CF6', false),
  ('Onderwijs', '#EC4899', false),
  ('Innovatie', '#06B6D4', false),
  ('Netwerken', '#F97316', false),
  ('Inspiratie', '#EF4444', false);

-- Function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

