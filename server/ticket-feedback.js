export function parseTicketFeedback(body) {
  if (!body || !Number.isSafeInteger(body.id) || body.id < 1 || body.id > 2147483647 ||
      typeof body.resolved !== 'boolean') throw new Error('请选择有效问题和解决状态');
  return {id:body.id,resolved:body.resolved};
}

export async function saveTicketFeedback(sql, user, {id,resolved}) {
  // The first feedback wins. A delayed client cannot reopen an admin-resolved ticket.
  const rows = await sql`UPDATE support_tickets
    SET resolved=${resolved},feedback_resolved=${resolved},feedback_at=NOW(),feedback_by=${user.username}
    WHERE id=${id} AND (author=${user.username} OR ${user.role==='admin'})
      AND feedback_resolved IS NULL AND resolved=FALSE
    RETURNING id,resolved,feedback_resolved,feedback_at`;
  if (rows.length) return rows[0];
  const existing = await sql`SELECT id,resolved,feedback_resolved,feedback_at FROM support_tickets
    WHERE id=${id} AND (author=${user.username} OR ${user.role==='admin'})`;
  return existing[0] || null;
}
