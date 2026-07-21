import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <div className="flex justify-center px-6 py-8">
        <Logo />
      </div>
      <div className="flex flex-1 items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
