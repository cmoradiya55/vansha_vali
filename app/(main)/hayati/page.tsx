import { Metadata } from "next";
import HayatiComponent from '@/components/HayatiComponent/HayatiComponent';

export const metadata: Metadata = {
  title: "Hayati | Vanshavali",
  description: "Hayati Certificate Application",
};

export default function HayatiPage() {
  return <HayatiComponent />
}