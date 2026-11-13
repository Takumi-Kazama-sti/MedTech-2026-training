"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginEmployee } from "../lib/schemas/loginSchema";
import { getEmployee } from "../lib/api/login";


const EmployeeContext = createContext<LoginEmployee | null>(null);

// ログイン時に保存した従業員情報を、下の画面すべてに配る
export function EmployeeProvider({ loginPath, children }: { loginPath: string; children: React.ReactNode }) {
  const router = useRouter();
  const [employee, setEmployee] = useState<LoginEmployee | null>(null);

  // 従業員情報かトークンがなければログイン画面へ戻す
  useEffect(() => {
    const controller = new AbortController();

    getEmployee(controller.signal)
      .then(setEmployee)
      .catch(() => {
        if (controller.signal.aborted) return;
        router.replace(loginPath)
      });
    return () => controller.abort();
  }, [router, loginPath]);

  return <EmployeeContext value={employee}>{children}</EmployeeContext>;
}

// 各画面から従業員情報(従業員名・権限のみ)を取り出す関数
export function useEmployee() {
  return useContext(EmployeeContext);
}
