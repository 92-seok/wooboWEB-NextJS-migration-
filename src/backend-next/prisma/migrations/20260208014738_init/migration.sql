-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('RAIN_GAUGE', 'WATER_LEVEL', 'DISPLACEMENT', 'SNOW_GAUGE', 'WARNING_SYSTEM', 'DISPLAY_BOARD', 'GATE_CONTROL', 'OTHER');

-- CreateEnum
CREATE TYPE "ControlStatus" AS ENUM ('START', 'ING', 'END', 'FAIL', 'ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(50),
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "kakao_id" VARCHAR(100),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_authorities" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "authority" VARCHAR(255) NOT NULL,

    CONSTRAINT "user_authorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tokens" (
    "user_id" INTEGER NOT NULL,
    "hashed_token" VARCHAR(255),
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "regions" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "admin_name" VARCHAR(100) NOT NULL,
    "manager" VARCHAR(100),
    "department" VARCHAR(100),
    "contact" VARCHAR(50),
    "memo" VARCHAR(1000),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "region_code" VARCHAR(10) NOT NULL,
    "device_code" VARCHAR(10) NOT NULL,
    "area_code" VARCHAR(10),
    "device_name" VARCHAR(100) NOT NULL,
    "device_type" "DeviceType" NOT NULL,
    "protocol" VARCHAR(20),
    "phone" VARCHAR(50),
    "ip_address" VARCHAR(50),
    "port" VARCHAR(10),
    "last_status" VARCHAR(20),
    "last_updated_at" VARCHAR(50),
    "error_count" INTEGER NOT NULL DEFAULT 5,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" VARCHAR(200),
    "data" TEXT,
    "unit" VARCHAR(20),
    "comment" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcast_logs" (
    "id" SERIAL NOT NULL,
    "device_id" TEXT NOT NULL,
    "command" VARCHAR(10) NOT NULL,
    "param1" VARCHAR(50),
    "param2" VARCHAR(50),
    "param3" VARCHAR(500),
    "param4" VARCHAR(50),
    "status" "ControlStatus" NOT NULL DEFAULT 'START',
    "response_data" VARCHAR(200),
    "response_at" TIMESTAMP(3),
    "user" VARCHAR(50),
    "registered_at" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "display_logs" (
    "id" SERIAL NOT NULL,
    "device_id" TEXT NOT NULL,
    "command" VARCHAR(10) NOT NULL,
    "param1" VARCHAR(50),
    "param2" VARCHAR(50),
    "param3" VARCHAR(500),
    "status" "ControlStatus" NOT NULL DEFAULT 'START',
    "user" VARCHAR(50),
    "registered_at" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "display_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_logs" (
    "id" SERIAL NOT NULL,
    "device_id" TEXT NOT NULL,
    "gate_action" VARCHAR(20),
    "light_action" VARCHAR(20),
    "sound_action" VARCHAR(20),
    "status" "ControlStatus" NOT NULL DEFAULT 'START',
    "user" VARCHAR(50),
    "registered_at" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "regions_is_active_idx" ON "regions"("is_active");

-- CreateIndex
CREATE INDEX "devices_device_type_idx" ON "devices"("device_type");

-- CreateIndex
CREATE INDEX "devices_region_code_idx" ON "devices"("region_code");

-- CreateIndex
CREATE INDEX "devices_error_count_idx" ON "devices"("error_count");

-- CreateIndex
CREATE UNIQUE INDEX "devices_region_code_device_code_key" ON "devices"("region_code", "device_code");

-- CreateIndex
CREATE INDEX "broadcast_logs_status_idx" ON "broadcast_logs"("status");

-- CreateIndex
CREATE INDEX "broadcast_logs_created_at_idx" ON "broadcast_logs"("created_at");

-- CreateIndex
CREATE INDEX "display_logs_status_idx" ON "display_logs"("status");

-- CreateIndex
CREATE INDEX "display_logs_created_at_idx" ON "display_logs"("created_at");

-- CreateIndex
CREATE INDEX "gate_logs_status_idx" ON "gate_logs"("status");

-- CreateIndex
CREATE INDEX "gate_logs_created_at_idx" ON "gate_logs"("created_at");

-- AddForeignKey
ALTER TABLE "user_authorities" ADD CONSTRAINT "user_authorities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_region_code_fkey" FOREIGN KEY ("region_code") REFERENCES "regions"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broadcast_logs" ADD CONSTRAINT "broadcast_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "display_logs" ADD CONSTRAINT "display_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_logs" ADD CONSTRAINT "gate_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
