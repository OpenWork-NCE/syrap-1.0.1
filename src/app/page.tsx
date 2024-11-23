import Login from "@/app/(auth)/login/page";
import AuthLayout from "@/app/(auth)/layout"

export default function Page() {
  return (
    <AuthLayout>
			<Login />
		</AuthLayout>
  );
}
