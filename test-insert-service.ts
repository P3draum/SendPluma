import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // use service role

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: birds, error: birdsError } = await supabase.from('birds').select('id').limit(1);
  if (birdsError || !birds || birds.length === 0) {
    console.error('Error fetching birds', birdsError);
    return;
  }

  const birdId = birds[0].id;
  const dummySenderId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'; // Need a valid profile!
  
  // Create a profile just for testing
  await supabase.from('profiles').insert([
    { id: '11111111-1111-1111-1111-111111111111', username: 'testuser' }
  ]).select();

  const dadosDaCarta = {
    sender_id: '11111111-1111-1111-1111-111111111111',
    bird_id: birdId,
    recipient_name: 'Destinatário',
    recipient_contact: 'amigo@exemplo.com',
    notification_method: 'email',
    content: 'Hello world',
    origin_name: 'Londrina',
    origin_lat: -23.3102,
    origin_lng: -51.1627,
    destination_name: 'Cambe',
    dest_lat: -23.2758,
    dest_lng: -51.2783,
    distance_km: 12.34567, // Float with >2 decimals
    eta_timestamp: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('letters')
    .insert([
      {
        sender_id: dadosDaCarta.sender_id, // UUID do usuário autenticado
        bird_id: dadosDaCarta.bird_id,
        recipient_name: dadosDaCarta.recipient_name,
        recipient_contact: dadosDaCarta.recipient_contact,
        notification_method: dadosDaCarta.notification_method,
        content: dadosDaCarta.content,
        origin_name: dadosDaCarta.origin_name,
        origin_lat: Number(dadosDaCarta.origin_lat), // Forçando conversão numérica
        origin_lng: Number(dadosDaCarta.origin_lng),
        destination_name: dadosDaCarta.destination_name,
        dest_lat: Number(dadosDaCarta.dest_lat),
        dest_lng: Number(dadosDaCarta.dest_lng),
        status: 'in_transit',
        distance_km: Number(dadosDaCarta.distance_km),
        eta_timestamp: dadosDaCarta.eta_timestamp
      }
    ]);

  if (error) {
    console.error("❌ ERRO FATAL AO SALVAR CARTA:");
    console.error("Mensagem:", error.message);
    console.error("Detalhes:", error.details); 
    console.error("Dica:", error.hint);
    return;
  }

  console.log("✅ Carta despachada com sucesso!", data);
}

run();
