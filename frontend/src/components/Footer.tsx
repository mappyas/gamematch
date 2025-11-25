import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-xs">
              PT
            </div>
            <span className="text-sm text-gray-500">
              © 2025 PartyFinder. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">利用規約</Link>
            <Link href="#" className="hover:text-white transition-colors">プライバシーポリシー</Link>
            <Link href="#" className="hover:text-white transition-colors">お問い合わせ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

