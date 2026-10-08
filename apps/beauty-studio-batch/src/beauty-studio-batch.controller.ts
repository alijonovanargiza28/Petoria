import { Controller, Get, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { BeautyStudioBatchService } from "./beauty-studio-batch.service";
import {
  BATCH_ROLLBACK,
  BATCH_TOP_PROPERTIES,
  BATCH_TOP_AGENTS,
} from "./lib/config";

@Controller()
export class BeautyStudioBatchController {
  private logger: Logger = new Logger("BatchController");
  //Bu BeautyStudioBatchController serverda avtomatik ravishda ma'lum vaqtda ishlarni bajarish uchun yozilgan.
  constructor(private readonly beautyStudioBatchService: BeautyStudioBatchService) {}

  // Har kuni 01:00:00 da ishlaydi
  @Cron("0 0 1 * * *", { name: BATCH_ROLLBACK })
  public async batchRollback() {
    try {
      this.logger["context"] = BATCH_ROLLBACK;
      this.logger.debug("EXECUTED!");

      await this.beautyStudioBatchService.batchRollback();
    } catch (error) {
      this.logger.error(error);
    }
  }

  // Har kuni 01:00:20 da ishlaydi
  @Cron("20 0 1 * * *", { name: BATCH_TOP_PROPERTIES })
  public async batchTopProperties() {
    try {
      this.logger["context"] = BATCH_TOP_PROPERTIES;
      this.logger.debug("EXECUTED!");

      await this.beautyStudioBatchService.batchTopProperties();
    } catch (error) {
      this.logger.error(error);
    }
  }

  // Har kuni 01:00:40 da ishlaydi
  @Cron("40 0 1 * * *", { name: BATCH_TOP_AGENTS })
  public async batchTopAgents() {
    try {
      this.logger["context"] = BATCH_TOP_AGENTS;
      this.logger.debug("EXECUTED!");

      await this.beautyStudioBatchService.batchTopAgents();
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Get()
  getHello(): string {
    return this.beautyStudioBatchService.getHello();
  }
}
