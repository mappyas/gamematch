// Discord Recruitment types
export type DiscordRecruitment = {
    id: number;
    game: number;
    game_name: string;
    icon: string;
    discord_message_id: string;
    discord_channel_id: string;
    discord_server_id: string;
    discord_owner_id: string;
    discord_owner_username: string;
    title: string;
    rank: string;
    max_slots: number;
    current_slots: number;
    participants: string;
    participants_list: { discord_user_id: string; discord_username: string }[];
    status: 'open' | 'ongoing' | 'closed' | 'cancelled';
    vc_channel_id?: string;
    is_full: boolean;
    created_at: string;
    updated_at: string;
};