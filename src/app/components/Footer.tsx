import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 py-8 text-slate-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 text-sm md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} PlantHub. สงวนลิขสิทธิ์.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy" className="transition hover:text-white">
            นโยบายความเป็นส่วนตัว
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            เงื่อนไขการใช้บริการ
          </Link>
          <Link href="mailto:support@planthub.com" className="transition hover:text-white">
            ติดต่อเรา
          </Link>
        </div>
      </div>
    </footer>
  );
}
