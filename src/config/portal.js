/**
 * Every link from this static site into the two applications.
 *
 * The site itself stays a plain static Astro build. It never talks to
 * Firebase and never holds a credential. It only points at the two Vercel
 * deployments, so this file is the whole integration surface.
 *
 * ResultPeak and JDSmartLearn both accept /s/{slug} as a school's permanent
 * sign-in address, which pre-selects the school and leaves the student typing
 * only their username and access code.
 */

/** Mt Cedar's slug in the shared Firebase project. Permanent once issued. */
export const SCHOOL_SLUG = 'mt-cedar';

/** ResultPeak AI: assessments, exams and result sheets. */
export const PORTAL = 'https://portal.mtcedarbritishinternationalsch.com.ng';

/** JDSmartLearn: lessons, summaries and practice questions. */
export const LEARN = 'https://learn.mtcedarbritishinternationalsch.com.ng';

/**
 * Flip to true only once the school is onboarded in ResultPeak and the
 * readiness check is green, with every active student holding a username and an
 * access code, both subdomains resolving over HTTPS.
 *
 * While false, the portal cards render as "opening soon" and point nowhere.
 * A child's first experience of the school's site should not be a failed login.
 */
export const portalLive = false;

/**
 * Set true when ResultPeak ships a standalone result lookup (school + username
 * + code -> published term result sheet). Until then the results card explains
 * how result sheets are issued instead of linking into a flow that only exists
 * immediately after sitting a paper.
 */
export const resultLookupLive = false;

export const links = {
  /** Student sign-in for an exam or assessment. */
  exam: `${PORTAL}/s/${SCHOOL_SLUG}`,
  /** Student sign-in for lessons, using the same username and code as the exam portal. */
  lessons: `${LEARN}/s/${SCHOOL_SLUG}`,
  /** Standalone result lookup. Gated by resultLookupLive. */
  results: `${PORTAL}/results/lookup`,
  /** Tutors and school admins both authenticate here; ResultPeak routes by role. */
  staffResultPeak: `${PORTAL}/admin/login`,
  /** Lesson authoring for tutors. */
  staffLearn: `${LEARN}/tutor/sign-in`,
};

/**
 * Resolves a portal destination against the launch flags, so no page has to
 * repeat the conditional. Returns null when the destination is not live yet;
 * callers render a non-clickable card instead of a broken link.
 */
export function portalHref(key) {
  if (!portalLive) return null;
  if (key === 'results' && !resultLookupLive) return null;
  return links[key] ?? null;
}
