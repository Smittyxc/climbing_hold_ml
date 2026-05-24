CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY default gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT
);

CREATE TYPE hold_type AS ENUM ('hand', 'foot', 'start', 'end', 'unassigned');

CREATE TABLE IF NOT EXISTS holds (
  id UUID PRIMARY KEY default gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  coord_a DECIMAL,
  coord_b DECIMAL,
  coord_c DECIMAL,
  coord_d DECIMAL 
);

CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY default gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS route_holds (
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  hold_id UUID REFERENCES holds(id) ON DELETE CASCADE,
  type hold_type,
  PRIMARY KEY (route_id, hold_id)
);