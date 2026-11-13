import { AppHeader } from "@/app/components/AppHeader";
import { EmployeeProvider } from "@/app/components/EmployeeProvider";

const LOGIN_PATH = "/login";

export default function MemberLayout({ children }: LayoutProps<"/">) {
  return (
    <EmployeeProvider loginPath={LOGIN_PATH}>
      <AppHeader loginPath={LOGIN_PATH} />
      {children}
    </EmployeeProvider>
  );
}
