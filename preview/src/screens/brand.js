/*
 * White-label brand resolution.
 *
 * The same Teambridge experience ships under two identities: as itself in
 * the standalone sandbox, and as **Sage Work** inside Sage HCM. Rather
 * than fork the screens, the handful of places that say a product name
 * out loud read it from here.
 *
 * The active brand is set once per route in main.jsx, synchronously,
 * before the tree renders — so a plain module value is enough and every
 * component (including module-level helpers like the demo toast, which
 * can't hold React state) sees the same answer.
 */

export const TEAMBRIDGE_BRAND = {
  id: 'teambridge',
  /** Product name shown in chrome and copy. */
  product: 'Teambridge',
  /** How the AI layer is referred to when it isn't a named specialist. */
  ai: 'Teambridge AI',
  /** Sender name on agent-authored messages and briefings. */
  sender: 'Teambridge',
}

export const SAGE_WORK_BRAND = {
  id: 'sage-work',
  product: 'Sage Work',
  ai: 'Sage Work AI',
  sender: 'Sage Work',
}

let current = TEAMBRIDGE_BRAND

export function setBrand(brand) {
  current = brand ?? TEAMBRIDGE_BRAND
}

export function getBrand() {
  return current
}

/** True when the experience is running white-labelled inside a host product. */
export function isWhiteLabelled() {
  return current.id !== 'teambridge'
}
