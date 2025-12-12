from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import Recruitment

class Command(BaseCommand):
    help = '古い募集データを削除します'

    def add_arguments(self, parser):
        parser.add_argument('--hours', type=int, default=2, help='削除対象とする経過時間（時間）')

    def handle(self, *args, **options):
        hours = options['hours']
        cutoff_time = timezone.now() - timedelta(hours=hours)
        
        # 古い募集を取得して削除
        old_recruitments = Recruitment.objects.filter(created_at__lt=cutoff_time)
        count = old_recruitments.count()
        old_recruitments.delete()
        
        self.stdout.write(self.style.SUCCESS(f'{count} 件の古い募集を削除しました (基準: {hours}時間以上経過)'))
