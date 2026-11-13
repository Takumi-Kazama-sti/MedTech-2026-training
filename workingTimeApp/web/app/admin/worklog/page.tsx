"use client";

import { Table, TableBody, TableHead, TableContainer, TableRow, TableCell, Paper, TextField, Typography, MenuItem, Autocomplete } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmployeeProvider, useEmployee } from "@/app/components/EmployeeProvider";
import * as employees from "@/app/lib/api/employees";
import { ApiError } from "@/app/lib/api/login";
import type { MonthlyWorklogResponse, MonthlyWorklogEmployees } from "@/app/lib/schemas/employeeSchema";
import { formatTimes } from "./timeFormat";

export default function AdminMonthlyWorkLogPage() {
  const router = useRouter();
  const employee = useEmployee();
  const [rows, setRows] = useState<MonthlyWorklogResponse[]>([]);
  const [searchEmployee, setSearchEmployee] = useState<MonthlyWorklogEmployees[]>([]);
  const [searchWorkMonth, setSearchWorkMonth] = useState("");
  const [searchEmployeeName, setSearchEmployeeName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    if (!employee) return;
    employees.getMonthlyWorklogs(searchWorkMonth, searchEmployeeName, controller.signal)
      .then((res) => {
        setRows(res);
        setSearchEmployee(
          res.map((res) => ({ id: res.id, employeeName: res.employeeName }))
        );
        setErrorMessage("");
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/admin/login");
          return;
        }
        setErrorMessage("月別従業員勤務一覧の取得に失敗しました");
      });
    return () => controller.abort();
  }, [searchEmployeeName, searchWorkMonth, employee]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-slate-100 px-4">
      {/* 検索欄 */}
      <div className="w-full max-w-5xl">
        <Typography className="text-xl mb-5">検索欄</Typography>
        <div className="mb-10 flex flex-wrap gap-4">
          <TextField
            label="年月"
            className="w-44"
            placeholder="2026-10"
            value={searchWorkMonth}
            onChange={(e) => setSearchWorkMonth(e.target.value.trim())}
            slotProps={{ htmlInput: { maxLength: 7, inputMode: "numeric" } }}
            sx={{ backgroundColor: "#FFFFFF" }}
          />
          <Autocomplete
            className="w-44"
            options={searchEmployee}
            getOptionLabel={(e) => e.employeeName}
            getOptionValue={(e) => e.id}
            value={searchEmployeeName || null}
            onChange={(_, value) => setSearchEmployeeName(value ?? "")}
            noOptionsText="指定なし"
            renderInput={(params) => (
              <TextField {...params} label="従業員" sx={{ backgroundColor: "#FFFFFF" }} />
            )}
          />
        </div>
      </div>
      <div className="w-full max-w-5xl">
        <Typography className="text-lg mb-5">月別従業員勤務一覧</Typography>
        <TableContainer component={Paper} className="mx-auto mt-8">
          <Table
            size="small"
            className="min-w-[720px] table-fixed [&_td]:border [&_td]:border-slate-300 [&_th]:border [&_th]:border-slate-300"
          >
            <TableHead>
              <TableRow className="bg-slate-100">
                <TableCell className="font-bold">ユーザー名</TableCell>
                <TableCell className="font-bold">出勤年月</TableCell>
                <TableCell align="right" className="font-bold">出勤回数</TableCell>
                <TableCell align="right" className="font-bold">退勤回数</TableCell>
                <TableCell align="right" className="font-bold">実働</TableCell>
                <TableCell align="right" className="font-bold">休憩</TableCell>
                <TableCell align="right" className="font-bold">時間外</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell className="truncate">{row.employeeName}</TableCell>
                  <TableCell className="truncate">{row.workYearMonth}</TableCell>
                  <TableCell align="right" className="tabular-nums">{row.workInCount}</TableCell>
                  <TableCell align="right" className="tabular-nums">{row.workOutCount}</TableCell>
                  <TableCell align="right" className="tabular-nums">{formatTimes(row.workingTime)}</TableCell>
                  <TableCell align="right" className="tabular-nums">{formatTimes(row.breakingTime)}</TableCell>
                  <TableCell align="right" className="tabular-nums">{formatTimes(row.overWorkingTime)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </main>
  );
}