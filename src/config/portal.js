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
 * THE SCHOOL IS IDENTIFIED BY THE HOST, and by nothing else. Both applications
 * answer on a Mt Cedar subdomain, so the address itself already says which
 * school this is. Nothing below carries an /s/{slug} path segment: a slug in
 * the URL would be a second source of truth about the school's identity, free
 * to disagree with the host, and it is exactly that disagreement which used to
 * hand a Mt Cedar child a picker listing every other school. One school, one
 * name, in one place.
 */

/**
 * ResultPeak AI: assessments, exams and result sheets, on the school's own
 * subdomain.
 */
export const PORTAL = 'https://portal.mtcedarbritishinternationalsch.com.ng';

/**
 * JDSmartLearn: lessons, summaries, practice questions and assignments, on the
 * school's own subdomain.
 *
 * These two constants are the only place either host is written down. A move
 * to a different platform, or a new school reusing this site, is an edit to
 * these two lines and nothing else.
 */
export const LEARN = 'https://learn.mtcedarbritishinternationalsch.com.ng';

/**
 * Launch flags, one per destination.
 *
 * A single site-wide flag could not express the situation we are actually in,
 * where assessments and lessons went live at different times. Anything false
 * renders as an inert "opening soon" card. A child's first experience of the
 * school's site should not be a failed login.
 */

/** ResultPeak is live and serving Mt Cedar on the portal subdomain. */
export const examLive = true;

/** JDSmartLearn is live and serving Mt Cedar on the learn subdomain. */
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
 * Flip when ResultPeak ships a standalone result lookup (username + code ->
 * published term result sheet). Until then the results card explains how
 * result sheets are issued instead of linking into a flow that only exists
 * immediately after sitting a paper.
 */
export const resultLookupLive = false;

/** True when any student-facing destination works, for page-level messaging. */
export const portalLive = examLive || lessonsLive;

export const links = {
  /** Student sign-in for an exam or assessment. The host names the school. */
  exam: `${PORTAL}/start`,
  /** Entrance examination for prospective students. */
  entrance: `${PORTAL}/start/entrance`,
  /** Student sign-in for lessons: the subdomain's own front door. */
  lessons: `${LEARN}/`,
  /** Standalone result lookup. Gated by resultLookupLive. */
  results: `${PORTAL}/results`,
  /** Marks, exams and result sheets. ResultPeak routes tutors and admins by role. */
  staffResultPeak: `${PORTAL}/admin/login`,
  /** Lesson authoring. A tutor's Firebase claims already carry the school. */
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
