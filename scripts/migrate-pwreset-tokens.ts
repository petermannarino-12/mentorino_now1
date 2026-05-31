import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

const TOKEN_HASH_LENGTH = 64;
const isAlreadyHashed = (token: string) => /^[a-f0-9]{64}$/i.test(token);

async function migrate() {
  const { data: rows, error } = await supabase
    .from('password_reset_tokens')
    .select('id, token')
    .is('used', false);

  if (error) {
    console.error('Query error:', error);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('No unexpired tokens found to migrate.');
    return;
  }

  let migrated = 0;

  for (const row of rows) {
    if (isAlreadyHashed(row.token)) {
      continue;
    }

    const hashed = createHash('sha256').update(row.token).digest('hex');

    const { error: updateError } = await supabase
      .from('password_reset_tokens')
      .update({ token: hashed })
      .eq('id', row.id);

    if (updateError) {
      console.error(`Failed to migrate token ${row.id}:`, updateError);
    } else {
      migrated++;
    }
  }

  console.log(`Migrated ${migrated} plaintext tokens to SHA-256 hashes.`);
}

migrate().catch(console.error);
