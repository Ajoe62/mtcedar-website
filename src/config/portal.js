/**
 * Every link from this static site into the two applications.
 *
 * The site itself stays a plain static Astro build. It never talks to
 * Firebase and never holds a credential. It only points at URLs, so this
 * file is the whole integration surface.
 *
 * ResultPeak serves each school at /s/{slug}, which pre-selects the school
 * and leaves the student typing only their username and access code. The
 * generic /start entry exists too, but it makes the student pick the school
 * from a list first, so we always prefer the school-scoped address.
 */

/** Mt Cedar's slug in the shared Firebase project. Confirmed by the school. */
export const SCHOOL_SLUG = 'mt-cedar';

/**
 * ResultPeak AI: assessments, exams and result sheets.
 *
 * This was previously a vanity subdomain (portal.mtcedar...com.ng) which was
 * never provisioned and returned a Vercel 404 on every request. Point at the
 * canonical host until a subdomain is actually configured and verified.
 */
export const PORTAL = 'https://resultpeakai.com';

/**
 * JDSmartLearn: lessons, summaries and practice questions.
 *
 * No live deployment yet. The learn.mtcedar...com.ng subdomain was never
 * provisioned either, so every lessons destination stays gated below until
 * there is a real address to send a child to.
 */
export const LEARN = null;

/**
 * Launch flags, one per destination.
 *
 * A single site-wide flag could not express the situation we are actually in,
 * where assessments are live but lessons have nowhere to point yet. Anything
 * false renders as an inert "opening soon" card. A child's first experience of
 * the school's site should not be a failed login.
 */

/** ResultPeak is live and Mt Cedar is onboarded at /s/mt-cedar. */
export const examLive = true;

/** Flip when JDSmartLearn has a deployed URL and LEARN above is set. */
export const lessonsLive = false;

/**
 * Entrance assessment for applicants, linked from the admissions page.
 *
 * Set false out of season, or if the entrance paper is not configured in
 * ResultPeak, and the admissions callout disappears rather than sending a
 * prospective family into an empty sign-in.
 */
export const entranceLive = true;

/**
 * Flip when ResultPeak ships a standalone result lookup (school + username +
 * code -> published term result sheet). Until then the results card explains
 * how result sheets are issued instead of linking into a flow that only exists
 * immediately after sitting a paper.
 */
export const resultLookupLive = false;

/** True when any student-facing destination works, for page-level messaging. */
export const portalLive = examLive || lessonsLive;

export const links = {
  /** The school's front door: school already chosen, username and code only. */
  student: `${PORTAL}/s/${SCHOOL_SLUG}`,
  /** Student sign-in for an exam or assessment. Same front door. */
  exam: `${PORTAL}/s/${SCHOOL_SLUG}`,
  /** Entrance examination for prospective students. Not yet linked from admissions. */
  entrance: `${PORTAL}/s/${SCHOOL_SLUG}/entrance`,
  /** Student sign-in for lessons. Gated by lessonsLive until LEARN exists. */
  lessons: LEARN ? `${LEARN}/s/${SCHOOL_SLUG}` : null,
  /** Standalone result lookup. Gated by resultLookupLive. */
  results: `${PORTAL}/results`,
  /** Tutors and school admins both authenticate here; ResultPeak routes by role. */
  staffResultPeak: `${PORTAL}/admin/login`,
  /** Lesson authoring for tutors. Gated with the rest of JDSmartLearn. */
  staffLearn: LEARN ? `${LEARN}/tutor/sign-in` : null,
};

/**
 * Resolves a portal destination against the launch flags, so no page has to
 * repeat the conditional. Returns null when the destination is not live yet;
 * callers render a non-clickable card instead of a broken link.
 */
export function portalHref(key) {
  if (key === 'lessons' || key === 'staffLearn') {
    return lessonsLive ? links[key] ?? null : null;
  }
  if (key === 'results' && !resultLookupLive) return null;
  if (key === 'entrance' && !entranceLive) return null;
  if (!examLive) return null;
  return links[key] ?? null;
}
