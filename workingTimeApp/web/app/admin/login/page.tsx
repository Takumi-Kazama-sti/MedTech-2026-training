import { LoginForm } from "@/app/components/LoginForm";

// 管理者（2）と開発者（99）だけログインできる
const ADMIN_ROLES = ["2", "99"];

export default function AdminLoginPage() {
  return <LoginForm
    title="勤怠管理 管理者ログイン"
    redirectTo="/admin/worklog"
    allowedRoles={ADMIN_ROLES}
  />;
}