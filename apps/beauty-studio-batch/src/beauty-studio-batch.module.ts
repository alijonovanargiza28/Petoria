import { Module } from '@nestjs/common';
import { BeautyStudioBatchController } from './beauty-studio-batch.controller';
import { BeautyStudioBatchService } from './beauty-studio-batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import PropertySchema from 'apps/beauty-studio-api/src/schemas/Property.model';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env.beauty-studio" }),
    DatabaseModule, 
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{name:'Property', schema:PropertySchema}]),
  ],
  controllers: [BeautyStudioBatchController],
  providers: [BeautyStudioBatchService],
})
export class BeautyStudioBatchModule {}
