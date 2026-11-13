import z from "zod";

export type AttendanceParam = "work_in" | "work_out" | "break_in" | "break_out";
export type CurrentAttendanceParam = "work_out" | "work_in" | "break_in" | "finished";
export const NEXT_PARAM: Record<AttendanceParam, CurrentAttendanceParam> = {
  "work_in": "work_in",
  "work_out": "finished",
  "break_in": "break_in",
  "break_out": "work_in",
};

export const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export interface AttendanceResponse {
  attendanceParam: AttendanceParam;
  recordedAt: string;
}
export interface CurrentAttendanceResponse {
  currentAttendance: CurrentAttendanceParam;
}

export interface MonthlyWorklogResponse {
  id: string;
  employeeName: string;
  workYearMonth: string;
  workInCount: number;
  workOutCount: number;
  workingTime: number;
  breakingTime: number;
  overWorkingTime: number;
}
export interface MonthlyWorklogEmployees {
  id: string;
  employeeName: string;
}
