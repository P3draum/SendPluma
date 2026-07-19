import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Este é um stub para o webhook de pagamentos (Stripe ou Mercado Pago)
// que atualiza a coluna `support_tier` na tabela `profiles`.
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Aqui você validaria a assinatura do webhook
    // ex: const event = stripe.webhooks.constructEvent(...)

    // Supondo que recebemos o ID do usuário e o novo tier:
    const { userId, newTier } = payload; 
    // newTier deve ser 'supporter' ou 'founder'

    if (!userId || !newTier) {
      return NextResponse.json({ error: 'Faltam parâmetros' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ support_tier: newTier })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar support_tier:', error);
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler falhou' }, { status: 400 });
  }
}
