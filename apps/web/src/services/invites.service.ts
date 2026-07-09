import { api } from '@/services/api';
import type { Invite } from '@/types/invites';
import type { UserRole } from '@/shared/lib/types';

export interface SendInviteInput {
  email: string;
  role: UserRole;
  churchId?: string;
}

export interface SendInviteResult {
  email: string;
  expiresAt: string;
  inviteUrl: string;
}

export const invitesService = {
  list: () => api.get<Invite[]>('/users/invite/list'),
  send: (input: SendInviteInput) =>
    api.post<SendInviteResult>('/users/invite', input),
};
