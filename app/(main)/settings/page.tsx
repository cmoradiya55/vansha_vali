import { Metadata } from "next";
import SettingsComponent from '@/components/SettingComponent/SettingComponent';

export const metadata: Metadata = {
  title: "Settings | Vanshavali",
  description: "Settings Application",
};

export default function SettingsPage() {
  return <SettingsComponent />
}