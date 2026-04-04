import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyActions from "@/components/StickyActions";

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
