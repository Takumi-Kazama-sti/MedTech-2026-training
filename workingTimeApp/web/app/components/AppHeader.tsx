"use client";

import { useRouter } from "next/navigation";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useEmployee } from "@/app/components/EmployeeProvider";
import { logout } from "../lib/api/login";

// ログイン後の画面で共通のヘッダー（左：ユーザー名、右：ログアウト）
export function AppHeader({ loginPath }: { loginPath: string }) {
  const router = useRouter();
  const employee = useEmployee();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace(loginPath);
    }
  }

  return (
    <AppBar position="static">
      <Toolbar className="justify-between">
        <Typography>ユーザー：{employee?.employeeName}</Typography>
        <Button color="inherit" variant="outlined" onClick={handleLogout}>
          ログアウト
        </Button>
      </Toolbar>
    </AppBar>
  );
}
