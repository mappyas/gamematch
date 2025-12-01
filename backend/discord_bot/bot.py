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

# 環境変数を読み込み
load_dotenv()

# 環境変数から設定を取得
DISCORD_BOT_TOKEN = os.getenv('DISCORD_BOT_TOKEN')
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:8000')

# Intents設定（必要な権限を有効化）
intents = discord.Intents.default()
intents.message_content = True  # メッセージ内容を読み取る
intents.members = True  # メンバー情報を取得

# Botインスタンスを作成
bot = commands.Bot(command_prefix='!', intents=intents)

# ゲーム一覧（APIから取得するか、ハードコードするか）
GAMES = [
    {"id": 1, "name": "Apex Legends"},
    {"id": 2, "name": "VALORANT"},
    {"id": 3, "name": "League of Legends"},
    {"id": 4, "name": "Fortnite"},
    {"id": 5, "name": "Overwatch 2"},
]


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
                'default_max_slots': 3,
            }
            
            try:
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        await interaction.response.send_message(
                            f"✅ このサーバーのゲームを **{game_name}** に設定しました！\n"
                            f"これで `/recruit` コマンドが使えます。",
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
    
    def __init__(self, game_id: int, game_name: str, max_slots: int = 3):
        super().__init__()
        self.game_id = game_id
        self.game_name = game_name
        self.max_slots = max_slots
    
    # タイトル入力
    title_input = discord.ui.TextInput(
        label='募集タイトル',
        placeholder='例: カジュアル一緒にやりませんか？',
        required=True,
        max_length=100
    )
    
    # 説明入力
    description_input = discord.ui.TextInput(
        label='詳細説明（任意）',
        style=discord.TextStyle.paragraph,
        placeholder='例: 楽しくやりましょう！初心者歓迎です',
        required=False,
        max_length=500
    )
    
    async def on_submit(self, interaction: discord.Interaction):
        """モーダル送信時の処理"""
        await interaction.response.defer()
        
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
                'description': self.description_input.value or '',
                'max_slots': self.max_slots,
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
                        view = RecruitmentView(recruitment_id, self.max_slots)
                        
                        # メッセージを送信
                        message = await interaction.followup.send(embed=embed, view=view)
                        
                        # メッセージIDをバックエンドに送信して保存
                        update_url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/{recruitment_id}/update/"
                        update_data = {'discord_message_id': str(message.id)}
                        async with session.post(update_url, json=update_data) as update_response:
                            if update_response.status == 200:
                                print(f"✅ 募集を作成しました (ID: {recruitment_id})")
                            else:
                                print(f"⚠️ メッセージID更新に失敗: {update_response.status}")
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
    
    def __init__(self, recruitment_id: int, max_slots: int):
        super().__init__(timeout=None)
        self.recruitment_id = recruitment_id
        self.max_slots = max_slots
    
    @discord.ui.button(label='参加する', style=discord.ButtonStyle.green, emoji='✅', custom_id='join_button')
    async def join_button(self, interaction: discord.Interaction, button: discord.ui.Button):
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
                        await interaction.followup.send(
                            f"✅ 募集に参加しました！ ({recruitment_data['current_slots']}/{self.max_slots})",
                            ephemeral=True
                        )
                        await self.update_recruitment_message(interaction, recruitment_data)
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
    
    @discord.ui.button(label='退出する', style=discord.ButtonStyle.red, emoji='❌', custom_id='leave_button')
    async def leave_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        """退出ボタン"""
        await interaction.response.defer(ephemeral=True)
        
        async with aiohttp.ClientSession() as session:
            url = f"{BACKEND_API_URL}/accounts/api/discord/recruitments/{self.recruitment_id}/leave/"
            data = {'discord_user_id': str(interaction.user.id)}
            
            try:
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        recruitment_data = result['recruitment']
                        await interaction.followup.send(
                            f"👋 募集から退出しました ({recruitment_data['current_slots']}/{self.max_slots})",
                            ephemeral=True
                        )
                        await self.update_recruitment_message(interaction, recruitment_data)
                    elif response.status == 400:
                        error = await response.json()
                        await interaction.followup.send(
                            f"❌ {error.get('error', '退出できませんでした')}",
                            ephemeral=True
                        )
                    else:
                        await interaction.followup.send("❌ エラーが発生しました", ephemeral=True)
            except Exception as e:
                print(f"Error leaving recruitment: {e}")
                await interaction.followup.send("❌ サーバーとの通信に失敗しました", ephemeral=True)
    
    async def update_recruitment_message(self, interaction: discord.Interaction, recruitment_data: dict):
        """募集メッセージを更新"""
        try:
            game_name = recruitment_data.get('game_name', '')
            embed = create_recruitment_embed(recruitment_data, game_name)
            await interaction.message.edit(embed=embed)
        except Exception as e:
            print(f"Error updating message: {e}")


# ============================================
# Embed作成
# ============================================

def create_recruitment_embed(recruitment_data: dict, game_name: str = '') -> discord.Embed:
    """募集情報のEmbedメッセージを作成"""
    title = recruitment_data.get('title', 'パーティ募集')
    description = recruitment_data.get('description', '')
    current_slots = recruitment_data.get('current_slots', 0)
    max_slots = recruitment_data.get('max_slots', 3)
    status = recruitment_data.get('status', 'open')
    participants = recruitment_data.get('participants_list', [])
    game_name = game_name or recruitment_data.get('game_name', '')
    
    color = discord.Color.green() if status == 'open' else discord.Color.red()
    
    embed = discord.Embed(
        title=f"🎮 {title}",
        description=description or "一緒に遊びましょう！",
        color=color
    )
    
    # ゲーム名
    if game_name:
        embed.add_field(name="ゲーム", value=f"🎯 {game_name}", inline=True)
    
    # ステータス
    status_text = "🟢 募集中" if status == 'open' else "🔴 募集終了"
    embed.add_field(name="ステータス", value=status_text, inline=True)
    
    # 参加者リスト
    if participants:
        participant_list = '\n'.join([f"• {p['discord_username']}" for p in participants])
    else:
        participant_list = "まだ参加者がいません"
    
    embed.add_field(
        name=f"参加者 ({current_slots}/{max_slots})",
        value=participant_list,
        inline=False
    )
    
    # プログレスバー
    progress = int((current_slots / max_slots) * 10) if max_slots > 0 else 0
    progress_bar = '█' * progress + '░' * (10 - progress)
    embed.add_field(
        name="進捗",
        value=f"`{progress_bar}` {current_slots}/{max_slots}",
        inline=False
    )
    
    embed.set_footer(text="下のボタンから参加・退出できます")
    
    return embed


# ============================================
# スラッシュコマンド
# ============================================

@bot.event
async def on_ready():
    """Botが起動したときに実行"""
    print(f'✅ Botが起動しました: {bot.user.name}')
    print(f'Bot ID: {bot.user.id}')
    print('------')
    
    try:
        synced = await bot.tree.sync()
        print(f'✅ {len(synced)} 個のコマンドを同期しました')
    except Exception as e:
        print(f'❌ コマンド同期エラー: {e}')


@bot.tree.command(name="setup", description="このサーバーで使用するゲームを設定します（管理者用）")
async def setup(interaction: discord.Interaction):
    """サーバー設定コマンド"""
    # 管理者チェック（オプション）
    # if not interaction.user.guild_permissions.administrator:
    #     await interaction.response.send_message("❌ このコマンドは管理者のみ使用できます", ephemeral=True)
    #     return
    
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
                    max_slots = setting['default_max_slots']
                    
                    # モーダルを表示
                    modal = RecruitmentModal(game_id, game_name, max_slots)
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


def main():
    """メイン関数: Botを起動"""
    if not DISCORD_BOT_TOKEN:
        print("❌ エラー: DISCORD_BOT_TOKENが設定されていません")
        print(".envファイルを確認してください")
        return
    
    print("🚀 Discord Botを起動中...")
    try:
        bot.run(DISCORD_BOT_TOKEN)
    except Exception as e:
        print(f"❌ Bot起動エラー: {e}")


if __name__ == "__main__":
    main()
