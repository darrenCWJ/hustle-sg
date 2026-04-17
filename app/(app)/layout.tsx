import { SiteNav } from "@/components/nav/SiteNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
    </>
  );
}
