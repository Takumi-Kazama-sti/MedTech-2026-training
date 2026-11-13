import { z } from 'zod';

export const loginRequestSchema = z.object({
  loginId: z
    .string({ error: 'ログインIDは必須です' })
    .min(1, 'ログインIDは必須です')
    .max(50, 'ログインIDは50文字以内です'),
  loginPassword: z
    .string({ error: 'パスワードは必須です' })
    .min(1, 'パスワードは必須です'),
}, { error: 'リクエストボディが不正です' });

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export interface LoginResponse {
  responseToken: string;
  employeeName: string;
  role: string;
}
