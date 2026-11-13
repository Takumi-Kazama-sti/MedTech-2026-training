import { LoginForm } from "@/app/components/LoginForm";

export default function LoginPage() {
  return <LoginForm
    title="勤怠管理 ログイン"
    redirectTo="/attendance"
  />;
}
