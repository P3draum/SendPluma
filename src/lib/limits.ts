export type SupportTier = 'free' | 'supporter' | 'founder';

export const getLimiteCartas = (tier?: SupportTier | string | null): number => {
  if (tier === 'founder') return Infinity;
  if (tier === 'supporter') return 20;
  return 5; // Free tier default
};

export const getTierDisplayName = (tier?: SupportTier | string | null): string => {
  if (tier === 'founder') return 'Founder';
  if (tier === 'supporter') return 'Supporter';
  return 'Free';
};
