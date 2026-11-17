import type { Metadata } from "next";
import { HomeContent } from "../home-content";
import { WorkView } from "./work-grid";

export const metadata: Metadata = {
  title: "Aashay Agrawal",
  description: "",
};

export default function WorkPage() {
  return <WorkView home={<HomeContent />} />;
}
