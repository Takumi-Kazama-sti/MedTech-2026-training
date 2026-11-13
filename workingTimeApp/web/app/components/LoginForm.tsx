"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button, Card, CardHeader, CardContent, TextField, Alert } from "@mui/material"
import { login, logout } from "@/app/lib/api/login";
import { loginFormSchema, type LoginForm as LoginFormValues } from "@/app/lib/schemas/loginSchema";

// 認証エラーは原因を区別せず同じ文言にする
const AUTH_ERROR_MESSAGE = "ユーザーIDまたはパスワードが不正です";

type FieldErrors = Partial<Record<keyof LoginFormValues, string>>;

interface LoginFormProps {
  title: string;
  // ログイン成功後の移動先
  redirectTo: string;
  // 指定した権限以外はログインさせない（未指定なら全員）
  allowedRoles?: string[];
}

export function LoginForm({ title, redirectTo, allowedRoles }: LoginFormProps) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    // 送信前に入力の形をチェックする
    const formData = new FormData(event.currentTarget);
    const parsed = loginFormSchema.safeParse({
      loginId: formData.get("loginId"),
      loginPassword: formData.get("loginPassword"),
    });
    if (!parsed.success) {
      const errors = z.flattenError(parsed.error).fieldErrors;
      setFieldErrors({ loginId: errors.loginId?.[0], loginPassword: errors.loginPassword?.[0] });
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    try {
      const result = await login(parsed.data.loginId, parsed.data.loginPassword);
      if (allowedRoles && !allowedRoles.includes(result.role)) {
        await logout().catch(() => { });
        setFormError(AUTH_ERROR_MESSAGE);
        return;
      }
      router.replace(redirectTo);
    } catch {
      setFormError(AUTH_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader title={title} />
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <TextField
              name="loginId"
              label="ユーザーID"
              autoComplete="username"
              fullWidth
              error={!!fieldErrors.loginId}
              helperText={fieldErrors.loginId}
            />
            <TextField
              name="loginPassword"
              type="password"
              label="パスワード"
              autoComplete="current-password"
              fullWidth
              error={!!fieldErrors.loginPassword}
              helperText={fieldErrors.loginPassword}
            />
            {/* {formError && <Alert severity="error">{formError}</Alert>} */}
            <Button type="submit" variant="contained" loading={isSubmitting}>
              ログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
