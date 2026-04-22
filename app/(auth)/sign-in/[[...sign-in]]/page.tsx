import { redirect } from "next/navigation";

export default function Page() {
 redirect('/api/auth/set-user?userId=user_local_dev')
}