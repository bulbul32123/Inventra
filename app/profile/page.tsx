import { DashboardLayout } from "@/components/layout/dashboard-layout";
import ProfilePage from "@/components/profile/ProfilePage";
export const metadata = {
  title: "User Profile | Inventra System Configuration",
};
export default function Profile() {
  return (
    <DashboardLayout>
      <ProfilePage />
    </DashboardLayout>
  );
}

// Task for this project

// 2. Create Categories like products
