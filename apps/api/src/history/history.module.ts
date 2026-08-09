import { Module } from '@nestjs/common';
import { HistoryMilestonesService } from './history.service';
import { HistoryMilestonesController } from './history.controller';

@Module({
  controllers: [HistoryMilestonesController],
  providers: [HistoryMilestonesService],
})
export class HistoryMilestonesModule {}
