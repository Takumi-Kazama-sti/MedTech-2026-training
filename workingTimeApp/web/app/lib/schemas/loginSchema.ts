import z from 'zod';

export const loginFormSchema = z.object({
  loginId: z
    .string()
    .min(1, "ユーザーIDを入力してください")
    .max(50, "ユーザーIDは50文字以内です"),
  loginPassword: z
    .string()
    .min(1, "パスワードを入力してください"),
}, { error: "ユーザーIDもしくはパスワードを間違えています" });

export type LoginForm = z.infer<typeof loginFormSchema>;

export interface LoginEmployee {
  id: string;
  employeeName: string;
  role: string;
}