"use client";

import { Button } from "@mui/material";
import { Clock } from "@/app/components/Clock";
import { useEmployee } from "@/app/components/EmployeeProvider";
import * as employees from "@/app/lib/api/employees";
import { useEffect, useState } from "react";
import { ApiError } from "@/app/lib/api/login";
import { useRouter } from "next/navigation";
import { NEXT_PARAM, type AttendanceParam, type CurrentAttendanceParam } from "@/app/lib/schemas/employeeSchema";

export default function AttendancePage() {
  const router = useRouter();
  const employee = useEmployee();
  const [currentParam, setCurrentParam] = useState<CurrentAttendanceParam | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!employee) return;
    const controller = new AbortController();
    employees.getCurrentAttendance(employee.id, controller.signal)
      .then((res) => setCurrentParam(res.currentAttendance))
      .catch((e) => {
        if (controller.signal.aborted) return;
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/login");
          return;
        }
        setErrorMessage("打刻状態の取得に失敗しました。");
      });
    return () => controller.abort();
  }, [employee]);

  async function handleClick(id: string, param: AttendanceParam) {
    try {
      const attendanceInfo = await employees.attendance(id, param);
      setCurrentParam(NEXT_PARAM[attendanceInfo.attendanceParam]);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          router.replace("/login");
          return;
        }
        setErrorMessage(e.message);
        return;
      }
      setErrorMessage("通信に失敗しました");
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-slate-100 px-4">
      <div className="pb-10">
        <Clock />
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="flex w-80 gap-6">
          <Button
            variant="outlined"
            className="h-14 flex-1 text-lg"
            sx={{
              color: "#FFFFFF",
              borderColor: "#006400",
              backgroundColor: "#006400",
            }}
            onClick={() => employee ? handleClick(employee.id, "work_in") : null}
            disabled={currentParam !== "work_out"}
          >
            出勤
          </Button>
          <Button
            variant="outlined"
            className="h-14 flex-1 text-lg"
            sx={{
              color: "#FFFFFF",
              borderColor: "#ff0000",
              backgroundColor: "#ff0000",
            }}
            onClick={() => employee ? handleClick(employee.id, "work_out") : null}
            disabled={currentParam !== "work_in"}
          >
            退勤
          </Button>
        </div>
        <div className="flex w-80 gap-6">
          <Button variant="outlined" className="flex-1"
            onClick={() => employee ? handleClick(employee.id, "break_in") : null}
            disabled={currentParam !== "work_in"}
          >
            休憩開始
          </Button>
          <Button variant="outlined" className="flex-1"
            onClick={() => employee ? handleClick(employee.id, "break_out") : null}
            disabled={currentParam !== "break_in"}
          >
            休憩終了
          </Button>
        </div>
      </div>
    </main>
  );
}
