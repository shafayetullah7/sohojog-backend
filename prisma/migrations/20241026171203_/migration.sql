-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profilePicture_fkey" FOREIGN KEY ("profilePicture") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
