-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TEACHER', 'VICE_PRINCIPAL');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "patronymic" TEXT,
    "date_of_birth" DATE NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TEACHER',
    "avatar" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
