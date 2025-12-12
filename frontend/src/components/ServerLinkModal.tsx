'use client';

import { useState } from 'react';
import { Modal } from './Modal';

type ServerLinkModalProps = {
    isOpen: boolean;
    onClose: () => void;
}

export function ServerLinkModal({ isOpen, onClose }: ServerLinkModalProps) {

    const [isModalOpen, setIsModalOpen] = useState(false);


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Discordサーバーをリンクする">
            <div className="flex flex-col gap-4">
                <li>
                    <a
                        href="https://discord.gg/MGWytmks"
                    >
                        ApexServer
                    </a>

                </li>

            </div>
        </Modal>

    )


}