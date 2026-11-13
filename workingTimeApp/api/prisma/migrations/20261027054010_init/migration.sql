-- CreateTable
CREATE TABLE "roles" (
    "id" INTEGER NOT NULL,
    "role_name" VARCHAR(20) NOT NULL,
    "role_detail" VARCHAR(50),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "login_id" VARCHAR(50) NOT NULL,
    "login_password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" SERIAL NOT NULL,
    "employee_id" UUID NOT NULL,
    "work_date" DATE NOT NULL,
    "work_in_time" TIMESTAMPTZ NOT NULL,
    "work_out_time" TIMESTAMPTZ,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breaks" (
    "id" SERIAL NOT NULL,
    "attendance_id" INTEGER NOT NULL,
    "break_in_time" TIMESTAMPTZ NOT NULL,
    "break_out_time" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "breaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_monthly_indexes" (
    "id" SERIAL NOT NULL,
    "employee_id" UUID NOT NULL,
    "employee_name" VARCHAR(50) NOT NULL,
    "work_month" DATE NOT NULL,
    "work_in_count" INTEGER NOT NULL DEFAULT 0,
    "work_out_count" INTEGER NOT NULL DEFAULT 0,
    "work_monthly_time" INTEGER NOT NULL DEFAULT 0,
    "break_monthly_time" INTEGER NOT NULL DEFAULT 0,
    "over_time" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "employee_monthly_indexes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_login_id_key" ON "employees"("login_id");

-- CreateIndex
CREATE INDEX "attendances_employee_id_work_date_idx" ON "attendances"("employee_id", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "employee_monthly_indexes_employee_id_work_month_key" ON "employee_monthly_indexes"("employee_id", "work_month");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breaks" ADD CONSTRAINT "breaks_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_monthly_indexes" ADD CONSTRAINT "employee_monthly_indexes_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
