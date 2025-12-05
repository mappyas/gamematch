'use client'
import { Game } from '@/types/profile';

type GameImageSectionProps = {
    selectedGame?: Game;
}

export function GameImageSection({ selectedGame }: GameImageSectionProps) {
    return (
        <div className="mt-8 mb-8 animate-slideUp">
            <div className="rounded-2xl overflow-hidden glow">
                <div className="bg-gradient-to-br from-red-600/30 via-purple-600/30 to-blue-600/30 h-80 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJy Z2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                    <div className="relative z-10 text-center">
                        <img
                            src={selectedGame?.bannerUrl}
                            alt={selectedGame?.name}
                            className="w-full h-full object-cover"
                        />

                    </div>
                </div>
            </div>
        </div>
    );
}
