export const FOLLOWUP_DELAY = 60 * 1000;

// Only the latest completed question in a conversation receives an idle prompt.
export function followupDue(turns, lastQuestionAt, now, busy = false) {
  const turn = turns?.at(-1);
  if (busy || !turn?.ticketId || turn.status !== 'done' ||
      typeof turn.feedbackResolved === 'boolean' || !Number.isFinite(turn.completedAt)) return false;
  return now - Math.max(turn.completedAt, lastQuestionAt || 0) >= FOLLOWUP_DELAY;
}
