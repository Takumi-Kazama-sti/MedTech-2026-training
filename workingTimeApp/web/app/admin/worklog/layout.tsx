import { AppHeader } from "@/app/components/AppHeader";
import { EmployeeProvider } from "@/app/components/EmployeeProvider";

const LOGIN_PATH = "/admin/login";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <EmployeeProvider loginPath={LOGIN_PATH}>
      <AppHeader loginPath={LOGIN_PATH} />
      {children}
    </EmployeeProvider>
  );
}
