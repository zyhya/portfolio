export function parseTicketDeleteId(body) {
  if (!body || !Number.isSafeInteger(body.id) || body.id < 1 || body.id > 2147483647) {
    throw new Error('问题编号无效');
  }
  return body.id;
}

export async function deleteTicket(sql, id) {
  const [, deleted] = await sql.transaction([
    sql`UPDATE support_entries SET ticket_id=NULL WHERE ticket_id=${id}`,
    sql`DELETE FROM support_tickets WHERE id=${id} RETURNING id`
  ]);
  return deleted?.[0] || null;
}
