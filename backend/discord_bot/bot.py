"""
Discord Bot for Party Recruitment
Discordチャット上でパーティ募集を行い、バックエンドAPIと連携します
"""

import os
import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv
import aiohttp
import asyncio
from typing import Optional
from discord.ext import tasks

# 環境変数を読み込み
load_dotenv()

# 環境変数から設定を取得
DISCORD_BOT_TOKEN = os.getenv('DISCORD_BOT_TOKEN')
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:8000')

# Intents設定（必要な権限を有効化）
intents = discord.Intents.default()
intents.message_content = True  # メッセージ内容を読み取る
intents.members = True  # メンバー情報を取得
intents.voice_states = True  # VC状態を監視（Phase 1で追加）

# Botインスタンスを作成
bot = commands.Bot(command_prefix='!', intents=intents)

# ゲーム一覧（APIから取得するか、ハードコードするか）
GAMES = []

async def fetch_startup_data():
    global GAMES
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BACKEND_API_URL}/accounts/api/games/") as response:
            if response.status == 200:
                GAMES = await response.json()
                print("GAMELIST取得成功")
            else:
                print(f"Failed to fetch games: {response.status}")

# ============================================
# ゲーム選択用 Select Menu
# ============================================

class GameSelect(discord.ui.Select):
    """ゲーム選択ドロップダウン"""
    
    def __init__(self):
        options = [
            discord.SelectOption(
                label=game["name"],
                value=str(game["id"]),
                description=f"{game['name']}をこのサーバーのゲームに設定",
                default=(game["id"] == 1)  # APEXをデフォルト
            )
            for game in GAMES
        ]
        super().__init__(
            placeholder="ゲームを選択してください",
            min_values=1,
            max_values=1,
            options=options
        )
    
    async def callback(self, interaction: discord.Interaction):
        """ゲーム選択時の処理"""
        game_id = int(self.values[0])
        game_name = next(g["name"] for g in GAMES if g["id"] == game_id)
        
        # バックエンドAPIにサーバー設定を保存
        async with aiohttp.ClientSession() as session:
            url = f"{BACKEND_API_URL}/accounts/api/discord/server/setting/"
            data = {
                'discord_server_id': str(interaction.guild.id),
                'discord_server_name': interaction.guild.name,
                'game_id': game_id,
                'default_max_slots': 2,
            }
            
            try:
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        await interaction.response.send_message(
                            f"✅ このサーバーのゲームを **{game_name}** に設定しました！",
                            ephemeral=True
                        )
                    else:
                        error_text = await response.text()
                        print(f"Setup error: {error_text}")
                        await interaction.response.send_message(
                            "❌ 設定の保存に失敗しました",
                            ephemeral=True
                        )
            except Exception as e:
                print(f"Setup error: {e}")
                await interaction.response.send_message(
                    "❌ サーバーとの通信に失敗しました",
                    ephemeral=True
                )


class GameSelectView(discord.ui.View):
    """ゲーム選択画面"""
    
    def __init__(self):
        super().__init__(timeout=60)
        self.add_item(GameSelect())


# ============================================
# 募集作成用 モーダル
# ============================================

class RecruitmentModal(discord.ui.Modal, title='🎮 パーティ募集を作成'):
    """募集作成モーダル"""
    
    def __init__(self, game_id: int, game_name: str):
        super().__init__()
        self.game_id = game_id
        self.game_name = game_name
    
    # タイトル入力
    title_input = discord.ui.TextInput(
        label='募集タイトル',
        placeholder='例: ギスギスなし！　など',
        required=True,
        max_length=20
    )

    rank_input = discord.ui.TextInput(
        label='ランク条件',
        placeholder='例: ランク〇〇↑、問わない　など',
        required=True,
        max_length=10
    )

    slot_input  = discord.ui.TextInput(
        label='募集人数（自分含む）',
        required=True,
        max_length=2
        
    )

    async def on_submit(self, interaction: discord.Interaction):
        """モーダル送信時の処理"""
        await interaction.response.defer()
        
        if not self.slot_input.value.isdigit():
            await interaction.followup.send(
                "❌ 募集人数は数字で入力してください",
                ephemeral=True
            )
            return
            
        slot = int(self.slot_input.value)
        if not (2 <= slot <= 10):
            await interaction.followup.send(
                "❌ 募集人数は2以上の数字で入力してください",
                ephemeral=True
            )
            return
        # バックエンドAPIに募集を登録
        async with aiohttp.ClientSession() as session:
            url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/create/"
            data = {
                'game': self.game_id,
                'discord_server_id': str(interaction.guild.id),
                'discord_channel_id': str(interaction.channel.id),
                'discord_owner_id': str(interaction.user.id),
                'discord_owner_username': interaction.user.name,
                'title': self.title_input.value,
                'rank': self.rank_input.value,
                'max_slots': int(self.slot_input.value),
            }
            
            try:
                async with session.post(url, json=data) as response:
                    if response.status == 201:
                        result = await response.json()
                        recruitment_data = result['recruitment']
                        recruitment_id = recruitment_data['id']
                        
                        # Embedメッセージを作成
                        embed = create_recruitment_embed(recruitment_data, self.game_name)
                        
                        # ボタンUIを作成
                        view = RecruitmentView(recruitment_id, int(self.slot_input.value), is_full=False)
                        
                        # メッセージを送信
                        message = await interaction.followup.send(embed=embed, view=view)
                        
                        # メッセージIDをバックエンドに送信して保存
                        update_url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/{recruitment_id}/update/"
                        update_data = {'discord_message_id': str(message.id)}
                        async with session.post(update_url, json=update_data) as update_response:
                            if update_response.status == 200:
                                print(f"✅ 募集を作成しました (ID: {recruitment_id})")
                            else:
                                print(f"⚠️ error: {update_response.status}")
                    elif response.status == 404:
                        print(f"❌ DB未登録ユーザー")
                        await interaction.followup.send("❌ 先にWEBサイトで登録が必要です。https://matcha-gg.com/", ephemeral=True)
                    elif response.status == 400:
                        error_data = await response.json()
                        error_message = error_data.get('error', '募集の作成に失敗しました')
                        print(f"❌ 募集作成エラー: {error_message}")
                        await interaction.followup.send(
                            f"❌ {error_message}",
                            ephemeral=True
                        )
                    else:
                        error_text = await response.text()
                        print(f"❌ 募集作成エラー: {response.status} - {error_text}")
                        await interaction.followup.send(
                            "❌ 募集の作成に失敗しました。サーバー管理者に連絡してください。",
                            ephemeral=True
                        )
            except Exception as e:
                print(f"❌ エラー: {e}")
                await interaction.followup.send(
                    "❌ サーバーとの通信に失敗しました。後でもう一度お試しください。",
                    ephemeral=True
                )


# ============================================
# 参加/退出ボタン
# ============================================

class RecruitmentView(discord.ui.View):
    """募集メッセージに表示されるボタンUI"""
    
    def __init__(self, recruitment_id: int, max_slots: int, is_full: bool = False):
        super().__init__(timeout=None)
        self.recruitment_id = recruitment_id
        self.max_slots = max_slots
    
        if not is_full:
            join_btn = discord.ui.Button(
                label='参加する',
                style=discord.ButtonStyle.green,
                emoji='✅',
                custom_id='join_button'
            )
            join_btn.callback = self.join_button
            self.add_item(join_btn)

        web_btn = discord.ui.Button(
            label='WEBで開く',
            style=discord.ButtonStyle.link,
            url=f"https://matcha-gg.com/profile",
            emoji='🌐'
        )
        self.add_item(web_btn)
    
    async def join_button(self, interaction: discord.Interaction):
        """参加ボタン"""
        await interaction.response.defer(ephemeral=True)
        
        async with aiohttp.ClientSession() as session:
            url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/{self.recruitment_id}/join/"
            data = {
                'discord_user_id': str(interaction.user.id),
                'discord_username': interaction.user.name
            }
            
            try:
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        recruitment_data = result['recruitment']
                        print(f"current_slots={recruitment_data.get('current_slots')}, max_slots={recruitment_data.get('max_slots')}, is_full={recruitment_data.get('is_full')}")


                        await interaction.followup.send(
                            f"✅ 募集に参加しました！ ({recruitment_data['current_slots']}/{self.max_slots})",
                            ephemeral=True
                        )

                        if recruitment_data.get('status') == 'ongoing' and not recruitment_data.get('vc_channel_id'):
                            vc_channel = await create_private_vc_channel(
                                interaction.guild,
                                recruitment_data
                            )

                            if vc_channel:
                                update_url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/{self.recruitment_id}/update/"
                                update_data = {'vc_channel_id': str(vc_channel.id)}
                                async with session.post(update_url, json=update_data) as update_response:
                                    if update_response.status == 200:
                                        print(f"✅ VCチャンネルID保存: {vc_channel.id}")
                                        # recruitment_dataを更新
                                    recruitment_data['vc_channel_id'] = str(vc_channel.id)
                        elif recruitment_data.get('status') == 'ongoing' and recruitment_data.get('vc_channel_id'):
                            vc_channel = interaction.guild.get_channel(int(recruitment_data.get('vc_channel_id')))
                            if vc_channel:
                                await add_vc_permission(vc_channel, str(interaction.user.id))

                        await self.update_recruitment_message(interaction, recruitment_data)
                                                 
                        # Phase 1: 満員になったらVC招待を送信
                        if recruitment_data.get('is_full'):
                            await check_and_send_vc_invite(recruitment_data)
                        
                    elif response.status == 400:
                        error = await response.json()
                        await interaction.followup.send(
                            f"❌ {error.get('error', '参加できませんでした')}",
                            ephemeral=True
                        )
                    else:
                        await interaction.followup.send("❌ エラーが発生しました", ephemeral=True)
            except Exception as e:
                print(f"Error joining recruitment: {e}")
                await interaction.followup.send("❌ サーバーとの通信に失敗しました", ephemeral=True)
    
    async def update_recruitment_message(self, interaction: discord.Interaction, recruitment_data: dict):
        """募集メッセージを更新"""
        try:
            game_name = recruitment_data.get('game_name', '')
            print(f"🔍 更新前: current_slots={recruitment_data.get('current_slots')}, max_slots={recruitment_data.get('max_slots')}, is_full={recruitment_data.get('is_full')}")
            embed = create_recruitment_embed(recruitment_data, game_name)

            if recruitment_data.get('is_full'):
                new_view = RecruitmentView(self.recruitment_id, self.max_slots, is_full=True)
                await interaction.message.edit(embed=embed, view=new_view)
            else:
                new_view = RecruitmentView(self.recruitment_id, self.max_slots, is_full=False)
                await interaction.message.edit(embed=embed, view=new_view)
        except Exception as e:
            print(f"Error updating message: {e}")


# ============================================
# Embed作成
# ============================================

def create_recruitment_embed(recruitment_data: dict, game_name: str = '') -> discord.Embed:
    """募集情報のEmbedメッセージを作成"""
    title = recruitment_data.get('title', 'パーティ募集')
    rank = recruitment_data.get('rank', '')
    current_slots = recruitment_data.get('current_slots', 0)
    max_slots = recruitment_data.get('max_slots', 3)
    status = recruitment_data.get('status', 'open')
    participants = recruitment_data.get('participants_list', [])
    owner_name = recruitment_data.get('discord_owner_username', '')
    is_full = recruitment_data.get('is_full', False)
    vc_channel_id = recruitment_data.get('vc_channel_id')
    print(f"🔍 Embed作成: current_slots={current_slots}, max_slots={max_slots}, is_full={is_full}, participants={len(participants)}")

    if is_full:
        embed_title = f"~~{title}~~"
        color = discord.Color.greyple()
    else:
        embed_title = f"{title}"
        color = discord.Color.green()
   
    embed = discord.Embed(title=embed_title, color=color)
    
    # ランク条件
    if rank:
        if is_full:
            rank_text = f"~~{rank}~~"
            embed.add_field(name="~~ランク条件~~", value=f" {rank_text}", inline=True)
        else:
            rank_text = rank    
            embed.add_field(name="ランク条件", value=f" {rank_text}", inline=True)
    
    # 参加者リスト
    participant_lines = []

    if owner_name:
        participant_lines.append(f"👑 {owner_name}")
    if participants:
        for p in participants:
            participant_lines.append(f"• {p['discord_username']}")
    
    participant_text = '\n'.join(participant_lines) if participant_lines else "まだ参加者がいません"
    participant_header = f"~~参加者 ({current_slots}/{max_slots})~~" if is_full else f"参加者 ({current_slots}/{max_slots})"


    embed.add_field(
        name=participant_header,
        value=participant_text,
        inline=False
    )
    
    if status == 'ongoing' and vc_channel_id:
        vc_link = f"<#{vc_channel_id}>"
        embed.add_field(
            name="VC", 
            value=vc_link, 
            inline=False
        )
    
    if is_full:
        embed.set_footer(text="この募集は満員です")
    else:
        embed.set_footer(text="下のボタンから参加・退出できます")
    
    return embed


# ============================================
# スラッシュコマンド（on_readyは末尾のRedis版を使用）
# ============================================

@bot.tree.command(name="setup", description="このサーバーで使用するゲームを設定します（管理者用）")
async def setup(interaction: discord.Interaction):
    """サーバー設定コマンド"""
    # 管理者チェック（オプション）
    if not interaction.user.guild_permissions.administrator:
        await interaction.response.send_message("❌ このコマンドは管理者のみ使用できます", ephemeral=True)
        return
    
    view = GameSelectView()
    await interaction.response.send_message(
        "🎮 **サーバー設定**\n\nこのサーバーで募集するゲームを選択してください：",
        view=view,
        ephemeral=True
    )


@bot.tree.command(name="recruit", description="パーティ募集を作成します")
async def recruit(interaction: discord.Interaction):
    """募集作成コマンド（モーダル版）"""
    
    # サーバー設定を取得
    async with aiohttp.ClientSession() as session:
        url = f"{BACKEND_API_URL}/accounts/api/discord/server/{interaction.guild.id}/setting/"
        
        try:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not data.get('exists'):
                        # サーバー設定がない場合
                        await interaction.response.send_message(
                            "⚠️ このサーバーはまだ設定されていません。\n"
                            "管理者が `/setup` コマンドでゲームを設定してください。",
                            ephemeral=True
                        )
                        return
                    
                    setting = data['setting']
                    game_id = setting['game_id']
                    game_name = setting['game_name']
                    
                    # モーダルを表示
                    modal = RecruitmentModal(game_id, game_name)
                    await interaction.response.send_modal(modal)
                else:
                    await interaction.response.send_message(
                        "❌ サーバー設定の取得に失敗しました",
                        ephemeral=True
                    )
        except Exception as e:
            print(f"Error getting server setting: {e}")
            await interaction.response.send_message(
                "❌ サーバーとの通信に失敗しました",
                ephemeral=True
            )




@bot.event
async def on_command_error(ctx, error):
    """エラーハンドリング"""
    print(f'Error: {error}')
    await ctx.send(f'エラーが発生しました: {error}')


# ============================================
# Phase 1: VC管理機能
# ============================================

@bot.event
async def on_voice_state_update(member, before, after):
    """ボイスチャンネルの参加・退出を監視"""
    # VCに参加した場合
    if before.channel is None and after.channel is not None:
        print(f"✅ {member.name} が {after.channel.name} に参加しました")
        # ここでVC参加記録をAPIに送信可能
        
    # VCから退出した場合
    elif before.channel is not None and after.channel is None:
        print(f"👋 {member.name} が {before.channel.name} から退出しました")
        # Phase 4: VC退出時に評価DM送信をスケジュール
        # 実際の実装では、参加時刻を記録し、30分以上の滞在時間を計算
        # ここでは簡易実装として、退出時に即座に評価DM送信
        # await send_rating_dm_after_vc(member, before.channel)


async def send_vc_invite_to_participants(recruitment_id: int, guild_id: int, participant_ids: list):
    """募集参加者にVC招待URLをDM送信"""
    try:
        guild = bot.get_guild(int(guild_id))
        if not guild:
            print(f"❌ サーバーが見つかりません: {guild_id}")
            return
        
        # 空いているVCを検索（カテゴリ内の空のVCを探す）
        # 実際の実装では、DiscordServerSetting から voice_category_id を取得して使用
        available_vc = None
        for channel in guild.voice_channels:
            if len(channel.members) == 0:  # 空のVCを見つけた
                available_vc = channel
                break
        
        if not available_vc:
            print("❌ 空いているVCが見つかりません")
            return
        
        # 30分期限の招待URLを生成
        invite = await available_vc.create_invite(
            max_age=1800,  # 30分
            max_uses=len(participant_ids),  # 参加者数分
            unique=True
        )
        
        # 各参加者にDM送信
        for user_id in participant_ids:
            try:
                user = await bot.fetch_user(int(user_id))
                embed = discord.Embed(
                    title="🎮 ボイスチャット招待",
                    description=f"募集が満員になりました！\n下記のリンクからボイスチャットに参加してください。",
                    color=discord.Color.green()
                )
                embed.add_field(name="ボイスチャンネル", value=available_vc.name, inline=False)
                embed.add_field(name="招待リンク", value=invite.url, inline=False)
                embed.set_footer(text="招待リンクは30分間有効です")
                
                await user.send(embed=embed)
                print(f"✅ {user.name} にVC招待を送信しました")
            except discord.Forbidden:
                print(f"⚠️ {user_id} へのDM送信が拒否されました")
            except Exception as e:
                print(f"❌ DM送信エラー ({user_id}): {e}")
        
        print(f"📢 VC招待URLを送信しました: {available_vc.name}")
        
    except Exception as e:
        print(f"❌ VC招待送信エラー: {e}")

async def create_private_vc_channel(guild, recruitment_data: dict):
    """募集用のプライベートVCチャンネルを作成"""
    try:
        recruitment_id = recruitment_data.get('id')
        title = recruitment_data.get('title')
        participants = recruitment_data.get('participants_list', [])
        owner_id = recruitment_data.get('discord_owner_id')

        #チャンネル名
        channel_name = f"{title} (ID:{recruitment_id})"

        all_participants = [owner_id] + [p['discord_user_id'] for p in participants]

        category = None
        for cat in guild.categories:
            if any('vc' in channel.name.lower() for channel in cat.voice_channels):
                category = cat
                break
        
        overwrites = {
            guild.default_role: discord.PermissionOverwrite(
                view_channel=True,
                connect=False,
                ),
                guild.me: discord.PermissionOverwrite(
                    view_channel=True,
                    connect=True,
                    manage_channels=True
                )
        }
        
        for user_id in all_participants:
            try:
                member = await guild.fetch_member(int(user_id))
                overwrites[member] = discord.PermissionOverwrite(
                    view_channel = True,
                    connect = True,
                    speak = True
                )
            except Exception as e:
                print(f"メンバー取得失敗({user_id}): {e}")

        vc_channel = await guild.create_voice_channel(
            name=channel_name,
            category=category,
            overwrites=overwrites
        )

        print(f"✅ プライベートVCチャンネルを作成しました: {vc_channel.name}")
        return vc_channel

    except Exception as e:
        print(f"❌ VC作成エラー: {e}")
        import traceback
        traceback.print_exc()
        return None

async def add_vc_permission(vc_channel, user_id: str):
    """VCチャンネルにユーザーの権限を追加"""
    try:
        guild = vc_channel.guild
        member = await guild.fetch_member(int(user_id))
        
        await vc_channel.set_permissions(
            member,
            view_channel=True,
            connect=True,
            speak=True
        )
        
        print(f"✅ VC権限付与: {member.name} → {vc_channel.name}")
        return True
        
    except Exception as e:
        print(f"❌ VC権限付与エラー ({user_id}): {e}")
        return False

async def remove_vc_permission(vc_channel, user_id: str):
    """VCチャンネルからユーザーの権限を削除"""
    try:
        guild = vc_channel.guild
        member = await guild.fetch_member(int(user_id))
        
        await vc_channel.set_permissions(
            member,
            overwrite=None  # 権限を削除
        )
        
        print(f"✅ VC権限削除: {member.name} → {vc_channel.name}")
        return True
        
    except Exception as e:
        print(f"❌ VC権限削除エラー ({user_id}): {e}")
        return False

async def delete_vc_channel(vc_channel_id: str, guild):
    """VCチャンネルを削除"""
    try:
        channel = guild.get_channel(int(vc_channel_id))
        if channel:
            await channel.delete()
            print(f"✅ VC削除: {channel.name}")
            return True
        return False
    except Exception as e:
        print(f"❌ VC削除エラー ({vc_channel_id}): {e}")
        return False

async def check_and_delete_vc(recruitment_data: dict, bot):
    """VCチャンネルを削除する"""
    try:
        vc_channel_id = recruitment_data.get('vc_channel_id')
        server_id = recruitment_data.get('discord_server_id')

        if not vc_channel_id or not server_id:
            return
        
        guild = bot.get_guild(int(server_id))
        if not guild:
            print(f"サーバが見つかりません: {server_id}")
            return
        
        await delete_vc_channel(vc_channel_id, guild)

    except Exception as e:
        print(f"VC削除エラー: {e}")

@tasks.loop(minutes=5)
async def cleanup_closed_vcs():
    """closed状態のVCチャンネルを定期的に削除"""
    print("🔍 VCクリーンアップタスク実行中...")
    
    async with aiohttp.ClientSession() as session:
        url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/?status=closed"
        
        try:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    recruitments = data.get('recruitments', [])
                    
                    print(f"📋 closed募集数: {len(recruitments)}")

                    for recruitment in recruitments:
                        print(f"  チェック中: ID={recruitment.get('id')}, vc={recruitment.get('vc_channel_id')}")
                        # closedでvc_channel_idがあるものを削除
                        if recruitment.get('status') == 'closed' and recruitment.get('vc_channel_id'):
                            server_id = recruitment.get('discord_server_id')
                            vc_channel_id = recruitment.get('vc_channel_id')
                            
                            if server_id:
                                guild = bot.get_guild(int(server_id))
                                if guild:
                                    await delete_vc_channel(vc_channel_id, guild)
                                    
                                    # DBのvc_channel_idをクリア
                                    update_url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/{recruitment.get('id')}/update/"
                                    update_data = {'vc_channel_id': None}
                                    async with session.post(update_url, json=update_data) as update_response:
                                        if update_response.status == 200:
                                            print(f"✅ VC削除完了: {vc_channel_id}")
                                            
        except Exception as e:
            print(f"❌ VCクリーンアップエラー: {e}")
    print("✅ VCクリーンアップタスク完了")

@cleanup_closed_vcs.before_loop
async def before_cleanup():
    """Botが準備完了するまで待機"""
    await bot.wait_until_ready()


# 募集参加時の処理を拡張（RecruitmentView.join_buttonを更新）
# 満員になったらVC招待を送信
async def check_and_send_vc_invite(recruitment_data: dict):
    """募集が満員になったらVC招待を送信"""
    if recruitment_data.get('is_full'):
        # 参加者のDiscord IDリストを取得
        participants = recruitment_data.get('participants_list', [])
        owner_id = recruitment_data.get('discord_owner_id')
        
        # 募集者も含める
        all_participants = [owner_id] + [p['discord_user_id'] for p in participants]
        
        guild_id = recruitment_data.get('discord_server_id')
        recruitment_id = recruitment_data.get('id')
        
        # VC招待を送信
        await send_vc_invite_to_participants(recruitment_id, guild_id, all_participants)


#  ============================================
# Phase 4: ユーザ評価システム
# ============================================

class RatingView(discord.ui.View):
    """ユーザ評価用のUIView"""
    
    def __init__(self, rated_users: list, recruitment_id: int):
        super().__init__(timeout=1800)  # 30分タイムアウト
        self.rated_users = rated_users  # 評価対象ユーザのリスト
        self.recruitment_id = recruitment_id
        self.ratings = {}  # {user_id: rating}
        
        # デフォルトで全員を5つ星に設定
        for user in rated_users:
            self.ratings[user['discord_user_id']] = 5
    
    @discord.ui.button(label='評価を送信', style=discord.ButtonStyle.green, emoji='✅')
    async def submit_ratings(self, interaction: discord.Interaction, button: discord.ui.Button):
        """評価を送信"""
        await interaction.response.defer(ephemeral=True)
        
        # バックエンドAPIに評価を送信
        # 実際の実装ではAPIエンドポイントを作成
        async with aiohttp.ClientSession() as session:
            for user in self.rated_users:
                rating_data = {
                    'recruitment_id': self.recruitment_id,
                    'rater_discord_id': str(interaction.user.id),
                    'rater_discord_username': interaction.user.name,
                    'rated_discord_id': user['discord_user_id'],
                    'rated_discord_username': user['discord_username'],
                    'rating': self.ratings.get(user['discord_user_id'], 5),
                    'is_auto_submitted': False
                }
                url = f"{BACKEND_API_URL}/accounts/api/discord/ratings/submit/"
                await session.post(url, json=rating_data)
                print(f"📊 評価送信: {rating_data}")
        
        await interaction.followup.send("✅ 評価を送信しました！", ephemeral=True)
        self.stop()
    
    async def on_timeout(self):
        """30分後の自動送信"""
        print(f"⏰ 評価が30分でタイムアウト、自動送信します (Recruitment #{self.recruitment_id})")
        # デフォルト評価（全員5つ星）を自動送信
        # 実際にはAPIに送信


async def send_rating_dm(user: discord.User, other_participants: list, recruitment_id: int):
    """VC退出後に評価DMを送信"""
    try:
        if not other_participants:
            return
        
        embed = discord.Embed(
            title="⭐ パーティメンバーを評価",
            description="一緒にプレイしたメンバーを評価してください。\n評価しない場合、30分後に自動的に全員を★5で送信します。",
            color=discord.Color.blue()
        )
        
        # 参加者リストを表示
        participants_text = "\n".join([f"• {p['discord_username']}" for p in other_participants])
        embed.add_field(name="メンバー", value=participants_text, inline=False)
        embed.set_footer(text="デフォルトは全員★5です | 30分後に自動送信されます")
        
        view = RatingView(other_participants, recruitment_id)
        await user.send(embed=embed, view=view)
        print(f"✅ {user.name} に評価DMを送信しました")
        
    except discord.Forbidden:
        print(f"⚠️ {user.name} へのDM送信が拒否されました")
    except Exception as e:
        print(f"❌ 評価DM送信エラー: {e}")


# ============================================
# Redis Pub/Sub: バックエンドからの通知受信
# ============================================

async def redis_subscriber():
    """Redis Pub/Subでバックエンドからの通知を受信"""
    import redis.asyncio as aioredis
    import os
    
    redis_host = os.environ.get('REDIS_HOST', '127.0.0.1')
    redis_port = int(os.environ.get('REDIS_PORT', 6379))
    
    print(f"🔌 Redisconnecting...: {redis_host}:{redis_port}")
    
    try:
        r = aioredis.Redis(host=redis_host, port=redis_port, decode_responses=True)
        pubsub = r.pubsub()
        await pubsub.subscribe('discord_bot_notifications')
        
        print("✅ Ready for Redis Pub/Sub: discord_bot_notifications")
        
        async for message in pubsub.listen():
            if message['type'] == 'message':
                try:
                    import json
                    data = json.loads(message['data'])
                    print(f"📨 Redis通知受信: {data.get('type')}")
                    
                    if data.get('type') == 'create_embed':
                        await handle_create_embed_notification(data)
                        
                except Exception as e:
                    print(f"❌ Redis通知処理エラー: {e}")
                    
    except Exception as e:
        print(f"❌ Redis connect error: {e}")


async def handle_create_embed_notification(data: dict):
    """フロントエンドからの募集作成通知を処理"""
    try:
        recruitment_id = data.get('recruitment_id')
        webhook_url = data.get('webhook_url')
        channel_id = data.get('channel_id')
        owner_avatar = data.get('owner_avatar')
        owner_username = data.get('owner_username')
        
        print(f"🔧 Embed作成処理開始: recruitment_id={recruitment_id}")
        print(f"📥 recieveddata: webhook_url={bool(webhook_url)}, channel={channel_id}, avatar={bool(owner_avatar)}, username={owner_username}")
        
        # バックエンドから募集詳細を取得
        async with aiohttp.ClientSession() as session:
            url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/{recruitment_id}/"
            async with session.get(url) as response:
                if response.status != 200:
                    print(f"❌ 募集詳細取得エラー: {response.status}")
                    return
                result = await response.json()
                recruitment_data = result['recruitment']
        
        game_name = recruitment_data.get('game_name', '')
        embed = create_recruitment_embed(recruitment_data, game_name)
        view = RecruitmentView(recruitment_id, recruitment_data.get('max_slots', 4), is_full=False)
        
        message = None
        
        # Webhook経由で投稿（ユーザー名義）
        if webhook_url:
            try:
                async with aiohttp.ClientSession() as session:
                    webhook = discord.Webhook.from_url(webhook_url, session=session)
                    message = await webhook.send(
                        embed=embed,
                        view=view,
                        username=owner_username,
                        avatar_url=owner_avatar if owner_avatar else None,
                        wait=True
                    )
                    print(f"✅ Webhook経由でEmbed投稿: message_id={message.id}")
            except Exception as webhook_error:
                print(f"⚠️ Webhook投稿エラー、通常投稿にフォールバック: {webhook_error}")
        
        # Webhookがない、または失敗した場合は通常投稿
        if not message and channel_id:
            channel = bot.get_channel(int(channel_id))
            if channel:
                message = await channel.send(embed=embed, view=view)
                print(f"✅ 通常投稿でEmbed送信: message_id={message.id}")
            else:
                print(f"❌ チャンネルが見つかりません: {channel_id}")
                return
        
        # メッセージIDをバックエンドに保存
        if message:
            async with aiohttp.ClientSession() as session:
                update_url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/{recruitment_id}/update/"
                update_data = {'discord_message_id': str(message.id)}
                async with session.post(update_url, json=update_data) as update_response:
                    if update_response.status == 200:
                        print(f"✅ メッセージID保存完了: {message.id}")
                    else:
                        print(f"⚠️ メッセージID保存エラー: {update_response.status}")
                        
    except Exception as e:
        print(f"❌ Embed作成処理エラー: {e}")
        import traceback
        traceback.print_exc()


@bot.event
async def on_ready():
    """Botが起動したときに実行（Redis subscriberを追加）"""
    print(f'✅ Botが起動しました: {bot.user.name}')
    print(f'Bot ID: {bot.user.id}')
    print('------')
    
    if not hasattr(bot, 'startup_completed'):
        await fetch_startup_data()
        bot.startup_completed = True
        print("Startup data fetched successfully")
        
        # Redis subscriberをバックグラウンドで開始
        asyncio.create_task(redis_subscriber())
        print("🔄 Redis subscriberを開始しました")

    try:
        synced = await bot.tree.sync()
        print(f'✅ {len(synced)} 個のコマンドを同期しました')
    except Exception as e:
        print(f'❌ コマンド同期エラー: {e}')
    
    if not cleanup_closed_vcs.is_running():
        cleanup_closed_vcs.start()
        print("🔄 VCクリーンアップタスクを開始しました")


def main():
    """メイン関数: Botを起動"""
    if not DISCORD_BOT_TOKEN:
        print("❌ エラー: DISCORD_BOT_TOKENが設定されていません")
        print(".envファイルを確認してください")
        return
    
    print("🚀 Discord Botを起動中...")
    print("📝 Phase 1: VC管理機能が有効です")
    print("📝 Phase 4: ユーザ評価システムが有効です")
    print("📝 Redis Pub/Sub: フロントエンド連携が有効です")
    try:
        bot.run(DISCORD_BOT_TOKEN)
    except Exception as e:
        print(f"❌ Bot起動エラー: {e}")


if __name__ == "__main__":
    main()



