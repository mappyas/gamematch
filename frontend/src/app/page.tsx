import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { RecruitmentSection } from '@/components/RecruitmentSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'PartyFinder - ゲームのパーティ募集サイト',
  description: 'Apex、Valorant、フォートナイトなど人気ゲームのパーティメンバーをPC・PlayStation・Xbox・Switchで簡単に募集・参加できるサービスです。',
  keywords: ['ゲーム', 'パーティ募集', 'Apex', 'Valorant', 'フォートナイト', 'マルチプレイ', 'オンラインゲーム'],
  openGraph: {
    title: 'PartyFinder - ゲームのパーティ募集サイト',
    description: 'Apex、Valorant、フォートナイトなど人気ゲームのパーティメンバーを簡単に募集・参加',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <HeroSection />
      <RecruitmentSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
