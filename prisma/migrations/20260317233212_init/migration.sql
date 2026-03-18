-- CreateEnum
CREATE TYPE "level_of_jewish_enum" AS ENUM ('Fully Observant', 'Trad + Modern', 'Holiday Jew', 'Spiritual / Reform', 'Cultural Jew');

-- CreateEnum
CREATE TYPE "long_distance_enum" AS ENUM ('Yes', 'No');

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birthday" VARCHAR(10) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "instagram_url" TEXT NOT NULL,
    "living_location" TEXT NOT NULL,
    "originally_from" TEXT NOT NULL,
    "hobbies" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "level_of_jewish" "level_of_jewish_enum" NOT NULL,
    "open_to_long_distance" "long_distance_enum" NOT NULL,
    "min_age" INTEGER,
    "max_age" INTEGER,
    "photo_names" TEXT[],

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);
