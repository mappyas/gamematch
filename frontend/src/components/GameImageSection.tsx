// 'use client'
// import { Game } from '@/types/profile';

// type GameImageSectionProps = {
//     selectedGame?: Game;
// }

// export function GameImageSection({ selectedGame }: GameImageSectionProps) {
//     return (
//         <div className="animate-slideUp absolute top-40 left-0 right-0 w-full h-[600px] -z-10">
//             {/* バナー画像 */}
//             <div className="absolute inset-0">
//                 <img
//                     src={selectedGame?.bannerUrl}
//                     alt={selectedGame?.name}
//                     className="w-full h-full object-cover"
//                 />
//             </div>

//             {/* 上部フェードアウト（Navbarとの境目を自然に） */}
//             <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />

//             {/* 下部フェードアウト（コンテンツとの境目を自然に） */}
//             <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
//         </div>
//     );
// }

