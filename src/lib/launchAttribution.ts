import { supabase } from '@/lib/supabase';

const ATTRIBUTION_KEY = 'post_launch_attribution';
const CAMPAIGN = 'post_launch_analytics';

export type LaunchAttribution = {
  referralId: string;
  launchProductId: string;
};

const isUuid = (value: string | null): value is string =>
  !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const captureLaunchAttribution = (search: string): LaunchAttribution | null => {
  const params = new URLSearchParams(search);
  const referralId = params.get('ref');
  const launchProductId = params.get('product');

  if (params.get('source') !== 'launch' || params.get('campaign') !== CAMPAIGN || !isUuid(referralId) || !isUuid(launchProductId)) {
    return null;
  }

  const attribution = { referralId, launchProductId };
  localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  return attribution;
};

export const getLaunchAttribution = (): LaunchAttribution | null => {
  try {
    const value = JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || 'null');
    return isUuid(value?.referralId) && isUuid(value?.launchProductId) ? value : null;
  } catch {
    localStorage.removeItem(ATTRIBUTION_KEY);
    return null;
  }
};

export const recordLaunchArrival = async (attribution: LaunchAttribution) => {
  const { error } = await supabase.from('launch_post_attributions').insert({
    referral_id: attribution.referralId,
    launch_product_id: attribution.launchProductId,
    source: 'launch',
    campaign: CAMPAIGN,
  });

  // A revisit is expected and does not need a second arrival row.
  if (error?.code !== '23505') throw error;
};

export const claimLaunchAttribution = async () => {
  const attribution = getLaunchAttribution();
  if (!attribution) return false;

  const { data, error } = await supabase.rpc('claim_launch_post_attribution', {
    p_referral_id: attribution.referralId,
  });
  if (error) throw error;
  return data === true;
};
