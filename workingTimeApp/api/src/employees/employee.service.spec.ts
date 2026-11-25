import { Test } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { EmployeeService } from "./employee.service";

describe("EmployeeService", () => {
  let service: EmployeeService;

  const prismaMock = {
    employee: { findUnique: vi.fn() },
    attendance: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    break: { create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: typeof txMock) => unknown) =>
      fn(txMock),
    ),
  };

  const txMock = {
    attendance: { update: vi.fn() },
    employeeMonthlyIndex: { upsert: vi.fn() },
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(EmployeeService);
  });

  describe("attendance - 出勤休憩", () => {
    beforeEach(() => {
      prismaMock.employee.findUnique.mockResolvedValue({ id: "employee1" });
    });

    it("未出勤状態で出勤ができる", async () => {
      prismaMock.attendance.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prismaMock.attendance.create.mockResolvedValue({ id: 1 });
      const result = await service.attendance("employee1", "work_in");

      expect(result).toMatchObject({
        attendanceId: 1,
        attendanceParam: "work_in",
      });
      expect(prismaMock.attendance.create).toHaveBeenCalledTimes(1);
    });

    it("勤務中状態で休憩開始ができる", async () => {
      prismaMock.attendance.findFirst.mockResolvedValueOnce({
        id: 1,
        breaks: [],
      });
      prismaMock.break.create.mockResolvedValue({ id: 10 });

      const result = await service.attendance("employee1", "break_in");
      expect(result).toMatchObject({ attendanceParam: "break_in" });
      expect(prismaMock.break.create).toHaveBeenCalledWith({
        data: { attendanceId: 1, breakInTime: expect.any(Date) },
      });
    });

    it("休憩中状態で休憩終了できる", async () => {
      prismaMock.attendance.findFirst.mockResolvedValueOnce({
        id: 1,
        breaks: [
          {
            id: 10,
            attendanceId: 1,
            breakInTime: new Date(),
            breakOutTime: null,
          },
        ],
      });
      prismaMock.break.update.mockResolvedValue({ id: 10 });

      const result = await service.attendance("employee1", "break_out");
      expect(result).toMatchObject({
        attendanceId: 10,
        attendanceParam: "break_out",
      });
      expect(prismaMock.break.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { breakOutTime: expect.any(Date) },
      });
    });
  });

  // 退勤時には実働時間計算が入るため別テストとして管理
  describe("attendance - 退勤", () => {
    const WORK_DATE = new Date("2026-11-24");
    const WORK_IN_TIME = new Date("2026-11-24T00:00:00Z");

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2026-11-24T09:00:00Z"));
      prismaMock.employee.findUnique.mockResolvedValue({
        id: "employee1",
        name: "テスト従業員1",
      });
      prismaMock.attendance.findFirst.mockResolvedValueOnce({
        id: 1,
        breaks: [],
      });
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("出勤状態で出勤終了できる(通常 - 休憩1h)", async () => {
      txMock.attendance.update.mockResolvedValue({
        id: 1,
        workDate: WORK_DATE,
        workInTime: WORK_IN_TIME,
        breaks: [
          {
            id: 10,
            attendanceId: 1,
            breakInTime: new Date("2026-11-24T03:00:00Z"),
            breakOutTime: new Date("2026-11-24T04:00:00Z"),
          },
        ],
      });
      const result = await service.attendance("employee1", "work_out");
      expect(result).toMatchObject({
        attendanceId: 1,
        attendanceParam: "work_out",
      });
      expect(txMock.employeeMonthlyIndex.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            workMonthlyTime: 8 * 3600,
            breakMonthlyTime: 3600,
            overTime: 0,
          }),
        }),
      );
    });

    it("出勤状態で出勤終了できる(休憩なし)", async () => {
      txMock.attendance.update.mockResolvedValue({
        id: 1,
        workDate: WORK_DATE,
        workInTime: WORK_IN_TIME,
        breaks: [],
      });
      await service.attendance("employee1", "work_out");
      expect(txMock.employeeMonthlyIndex.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            workMonth: "2026-11",
            workMonthlyTime: 9 * 3600,
            breakMonthlyTime: 0,
            overTime: 3600,
          }),
        }),
      );
    });

    it("出勤状態で出勤終了できる(境界値 - 残業1m)", async () => {
      vi.setSystemTime(new Date("2026-11-24T09:01:00Z"));
      txMock.attendance.update.mockResolvedValue({
        id: 1,
        workDate: WORK_DATE,
        workInTime: WORK_IN_TIME,
        breaks: [
          {
            id: 10,
            attendanceId: 1,
            breakInTime: new Date("2026-11-24T03:00:00Z"),
            breakOutTime: new Date("2026-11-24T04:00:00Z"),
          },
        ],
      });
      await service.attendance("employee1", "work_out");
      expect(txMock.employeeMonthlyIndex.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            workMonthlyTime: 8 * 3600 + 60,
            breakMonthlyTime: 3600,
            overTime: 60,
          }),
        }),
      );
    });

    it("出勤状態で出勤終了できる(通常 - 休憩2回)", async () => {
      vi.setSystemTime(new Date("2026-11-24T10:00:00Z"));
      txMock.attendance.update.mockResolvedValue({
        id: 1,
        workDate: WORK_DATE,
        workInTime: WORK_IN_TIME,
        breaks: [
          {
            id: 10,
            attendanceId: 1,
            breakInTime: new Date("2026-11-24T03:00:00Z"),
            breakOutTime: new Date("2026-11-24T04:00:00Z"),
          },
          {
            id: 11,
            attendanceId: 1,
            breakInTime: new Date("2026-11-24T07:00:00Z"),
            breakOutTime: new Date("2026-11-24T08:00:00Z"),
          },
        ],
      });
      await service.attendance("employee1", "work_out");
      expect(txMock.employeeMonthlyIndex.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            workMonthlyTime: 8 * 3600,
            breakMonthlyTime: 2 * 3600,
            overTime: 0,
          }),
        }),
      );
    });
  });
});
