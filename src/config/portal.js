/**
 * Every link from this static site into the two applications.
 *
 * The site itself stays a plain static Astro build. It never talks to
 * Firebase and never holds a credential. It only points at URLs, so this
 * file is the whole integration surface.
 *
 * THE SHAPE OF THE JOURNEY, and why it is not a set of raw outbound links.
 * A visitor who clicks "Portal" lands on OUR chooser first (/portal), picks
 * one of three doors, and only then crosses into an application. Every screen
 * before the crossing carries the school's crest, colours and wording, and the
 * screen that does the crossing says which application it is handing them to.
 * Sending a parent straight from a school page into an unfamiliar product is
 * what made the portal feel like somebody else's software.
 *
 * Both applications serve /s/{slug}, which pre-selects Mt Cedar and leaves the
 * student typing only a username and access code. Always prefer the
 * school-scoped address over a generic front door that asks them to find their
 * own school in a list.
 */

/**
 * Mt Cedar's slug on ResultPeak: the `slug` field stored on the school
 * document, which is what /s/{slug} looks up there.
 */
export const SCHOOL_SLUG = 'mt-cedar';

/**
 * Mt Cedar's slug on JDSmartLearn, which is NOT the same string, and this is a
 * bug in JDSmartLearn rather than a naming choice anybody made.
 *
 * ResultPeak reads the stored `slug` field. JDSmartLearn never reads that
 * field: findSchoolBySlug() in src/lib/db/resultpeak.ts matches against
 * schoolSlug(school.name), which slugifies the full registered name. So the one
 * school answers to two different addresses:
 *
 *   resultpeakai.com/s/mt-cedar                              -> 200
 *   jdsmartlearn.vercel.app/s/mt-cedar                       -> ?school=change
 *   jdsmartlearn.vercel.app/s/mt-cedar-british-international-school -> sign-in
 *
 * Verified against both deployments. The failure is the worst one in the whole
 * journey: `?school=change` opens the picker listing every school in the shared
 * project, so a Mt Cedar child clicking "Open my lessons" is asked to find
 * their own school in a list of other people's. That single screen is most of
 * why the portal reads as somebody else's software.
 *
 * DELETE THIS CONSTANT once JDSmartLearn prefers the stored `slug` field, and
 * point both links back at SCHOOL_SLUG. Until then the site works around it
 * rather than sending children somewhere that visibly fails.
 */
export const LEARN_SLUG = 'mt-cedar-british-international-school';

/**
 * ResultPeak AI: assessments, exams and result sheets.
 *
 * This was previously a vanity subdomain (portal.mtcedar...com.ng) which was
 * never provisioned and returned a Vercel 404 on every request. Point at the
 * canonical host until a subdomain is actually configured and verified.
 */
export const PORTAL = 'https://resultpeakai.com';

/**
 * JDSmartLearn: lessons, summaries, practice questions and assignments.
 *
 * The Vercel deployment, for the same reason as above: learn.mtcedar...com.ng
 * was never provisioned, and a vanity address that 404s is worse than a plain
 * one that works. Swap both constants the day the subdomains resolve; nothing
 * else in the site needs touching.
 */
export const LEARN = 'https://jdsmartlearn.vercel.app';

/**
 * Launch flags, one per destination.
 *
 * A single site-wide flag could not express the situation we are actually in,
 * where assessments and lessons went live at different times. Anything false
 * renders as an inert "opening soon" card. A child's first experience of the
 * school's site should not be a failed login.
 */

/** ResultPeak is live and Mt Cedar is onboarded at /s/mt-cedar. */
export const examLive = true;

/** JDSmartLearn is deployed and serves Mt Cedar at /s/mt-cedar. */
export const lessonsLive = true;

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
  /** Student sign-in for an exam or assessment. School already chosen. */
  exam: `${PORTAL}/s/${SCHOOL_SLUG}`,
  /** Entrance examination for prospective students. */
  entrance: `${PORTAL}/s/${SCHOOL_SLUG}/entrance`,
  /**
   * Student sign-in for lessons.
   *
   * JDSmartLearn's /s/{slug} route stores the school in a cookie on the phone
   * and forwards to sign-in, so the child never picks a school from a list.
   */
  lessons: `${LEARN}/s/${LEARN_SLUG}`,
  /** Standalone result lookup. Gated by resultLookupLive. */
  results: `${PORTAL}/results`,
  /** Marks, exams and result sheets. ResultPeak routes tutors and admins by role. */
  staffResultPeak: `${PORTAL}/admin/login`,
  /** Lesson authoring. No slug: a tutor's Firebase claims already carry the school. */
  staffLearn: `${LEARN}/tutor`,
  /**
   * The school administrator's door.
   *
   * The same address as staffResultPeak, and deliberately named separately.
   * Staff and administrators are told to go to different places by the people
   * who train them, so the site says two names even where one host answers
   * both. If ResultPeak ever splits the two, only this line changes.
   */
  admin: `${PORTAL}/admin/login`,
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

/**
 * Which application a destination belongs to.
 *
 * The handoff line on every outbound card is generated from this rather than
 * typed per card, so no card can quietly stop naming where it is sending
 * somebody. Naming the destination is the whole point: a visitor who is told
 * "this opens JDSmartLearn, the school's lessons app" reads the next screen as
 * part of Mt Cedar, and one who is not reads it as a stranger's website.
 */
export const APPS = {
  resultpeak: {
    name: 'ResultPeak',
    role: "the school's assessment and results system",
  },
  jdsmartlearn: {
    name: 'JDSmartLearn',
    role: "the school's lessons and assignments platform",
  },
};

export function appFor(key) {
  if (key === 'lessons' || key === 'staffLearn') return APPS.jdsmartlearn;
  if (key === 'exam' || key === 'entrance' || key === 'results') return APPS.resultpeak;
  if (key === 'staffResultPeak' || key === 'admin') return APPS.resultpeak;
  return null;
}
