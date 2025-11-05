// Utility to categorize join-related error messages from backend into user-friendly toasts.
// Patterns are matched case-insensitively on the provided message.

export function categorizeJoinError(raw) {
  const msg = String(raw || '').toLowerCase();
  const match = (s) => msg.includes(s);
  if (match('already') && match('member')) return { type: 'already-member', level: 'info', message: 'You are already a member of this project.' };
  if (match('archiv')) return { type: 'archived', level: 'error', message: 'Project is archived and cannot be joined.' };
  if (match('private') || match('forbidden')) return { type: 'private', level: 'error', message: 'Private project – access denied.' };
  if (match('invite') && match('required')) return { type: 'invite-only', level: 'error', message: 'Invite required to join this project.' };
  if (match('disabled') && match('join')) return { type: 'disabled', level: 'error', message: 'Joining is currently disabled for this project.' };
  if (match('limit') && (match('reached') || match('full'))) return { type: 'limit-reached', level: 'error', message: 'Project membership limit reached.' };
  if (match('unauthorized') || match('invalid token')) return { type: 'unauthorized', level: 'warn', message: 'Session expired. Please sign in again.' };
  return { type: 'generic', level: 'error', message: 'Could not join project. Please try again.' };
}
