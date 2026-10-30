import CategorySetting from "@/features/category/components/CategorySetting";
import InviteCodeSetting from "@/features/invite/components/InviteCodeSetting";

export default function SettingServer() {
  return (
    <>
      <InviteCodeSetting />
      <CategorySetting />
    </>
  );
}
