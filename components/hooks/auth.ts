
import { cookies } from "next/headers";

const DEFAULT_USER_ID = "user_local_dev";

export function auth() {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value ?? DEFAULT_USER_ID;

  return {
    userId,
    protect() {
     
    },
  };
}