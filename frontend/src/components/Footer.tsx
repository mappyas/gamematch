'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ServerLinkModal } from './ServerLinkModal';

export function Footer() {

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="py-12 border-t  border-[var(--gaming-border)] bg-[#0a0a0f] relative mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* ロゴ・説明 */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold tracking-tight text-white">
                  Matcha.gg
                </span>
              </div>
              <p className="text-sm text-[var(--gaming-text-sub)] max-w-sm">
                Connect with gamers on Discord for Apex, Valorant, LoL, and more.
                Find parties instantly and start playing.
              </p>
            </div>

            {/* リンク */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Service</h4>
              <ul className="space-y-2 text-sm text-[var(--gaming-text-sub)]">
                <li>
                  <Link href="/" className="hover:text-[var(--gaming-accent)] transition-colors">
                    Recruitments
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="hover:text-[var(--gaming-accent)] transition-colors"
                  >
                    Join Discord
                  </button>
                </li>
              </ul>
            </div>


          </div>

          <div className="pt-8 border-t border-[var(--gaming-border)] text-center text-sm text-[var(--gaming-text-sub)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Matcha.gg. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {/* SNS Links could go here */}
            </div>
          </div>
        </div>
      </footer>
      <ServerLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
