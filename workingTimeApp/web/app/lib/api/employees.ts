import { request } from "./login";
import type { AttendanceParam, AttendanceResponse, CurrentAttendanceResponse, MonthlyWorklogResponse } from "../schemas/employeeSchema";

// 打刻API
export async function attendance(id: string, attendanceParam: AttendanceParam) {
  return request<AttendanceResponse>(
    `/employees/${encodeURIComponent(id)}/attendance`, {
    method: "POST",
    body: JSON.stringify({ attendanceParam }),
  });
}

// 現在の打刻状態取得API
export async function getCurrentAttendance(id: string, signal?: AbortSignal) {
  return request<CurrentAttendanceResponse>(
    `/employees/${encodeURIComponent(id)}/attendance/status`,
    { signal },
  );
}

// 月別従業員勤務一覧取得API(管理者用)
export async function getMonthlyWorklogs(yearMonth?: string, employeeId?: string, signal?: AbortSignal) {
  return request<MonthlyWorklogResponse[]>(
    `/admin/monthly-worklogs`,
    {
      query: {
        yearMonth: yearMonth,
        employeeId: employeeId,
      },
      signal
    },
  );
}

//従業員作成
export async function createEmployee(loginId: string, loginName: string, loginPassword: string, role: string, signal?: AbortSignal) {
  return request<>(
    `admin/employees/create`,
    {
      body: JSON.stringify({
        loginId,
        loginName,
        loginPassword,
        role,
      }),
      signal,
    },
  );
}

//従業員無効化
export async function deactivateEmployee(loginId: string, signal?: AbortSignal) {
  return request<>(
    `admin/employees/deactivate`,
    {
      body: JSON.stringify({ loginId }),
      signal,
    },
  );
}