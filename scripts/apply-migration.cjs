// One-time script to apply the messages table migration
// Usage: node scripts/apply-migration.cjs <DATABASE_URL>
const { Client } = require('pg');

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/apply-migration.cjs <DATABASE_URL>');
    process.exit(1);
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  const sql = `
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages (receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages (sender_id, receiver_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
`;

  try {
    await client.query(sql);
    console.log('Migration applied successfully — messages table created.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
