import { Module } from '@nestjs/common';
import { BeautyStudioBatchController } from './beauty-studio-batch.controller';
import { BeautyStudioBatchService } from './beauty-studio-batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import PropertySchema from 'apps/beauty-studio-api/src/schemas/Property.model';
import MemberSchema from 'apps/beauty-studio-api/src/schemas/Member.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule, 
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{name:'Property', schema:PropertySchema}]),
    MongooseModule.forFeature([{name:'Member',schema:MemberSchema}])
  ],
  controllers: [BeautyStudioBatchController],
  providers: [BeautyStudioBatchService],
})
export class BeautyStudioBatchModule {}
