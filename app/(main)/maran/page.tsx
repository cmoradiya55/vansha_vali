import React from 'react'
import { Metadata } from "next";
import MaranComponent from '@/components/MaranComponent/MaranComponent';

export const metadata: Metadata = {
  title: "Maran | Vanshavali",
  description: "Maran Certificate Application",
};

export default function MaranPage() {
  return <MaranComponent />
}