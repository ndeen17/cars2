// Demo reference values — all editable in the UI where they matter.
// These are illustrative, not live market feeds.
export const FX_NGN_PER_USD   = 1500   // ₦ per US$
export const PETROL_NGN_PER_L = 1000   // ₦ per litre (pump price, demo reference)
export const HOME_NGN_PER_KWH = 210    // ₦ per kWh, home/estate tariff
export const ICE_L_PER_100KM  = 11     // comparable petrol car, mixed driving

export const naira = n => '₦' + Math.round(n).toLocaleString('en-NG')
export const priceUsd = str => Number(String(str).replace(/[^0-9.]/g, '')) || 0
