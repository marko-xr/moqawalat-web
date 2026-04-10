import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const StickyActions = dynamic(() => import("@/components/StickyActions"), {
  ssr: false
});

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <StickyActions />
    </>
  );
}
