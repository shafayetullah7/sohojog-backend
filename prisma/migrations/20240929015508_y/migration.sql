-- CreateTable
CREATE TABLE "team_member_roles" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL,

    CONSTRAINT "team_member_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_member_roles_membershipId_role_key" ON "team_member_roles"("membershipId", "role");

-- AddForeignKey
ALTER TABLE "team_member_roles" ADD CONSTRAINT "team_member_roles_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "team_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
