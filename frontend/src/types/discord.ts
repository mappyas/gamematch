// Discord Recruitment types
export type DiscordRecruitment = {
    id: number;
    game: number;
    game_name: string;
    title: string;
    rank: string;
    discord_owner_id: string;
    discord_owner_username: string;
    max_slots: number;
    current_slots: number;
    participants_list: { discord_user_id: string; discord_username: string }[];
    status: string;
    is_full: boolean;
    created_at: string;
};
