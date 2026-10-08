import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Property } from "apps/beauty-studio-api/src/libs/dto/property/property";
import { PropertyStatus } from "apps/beauty-studio-api/src/libs/enums/property.enum";
import { Model } from "mongoose";

@Injectable()
export class BeautyStudioBatchService {
  constructor(
    @InjectModel("Property") private readonly propertyModel: Model<Property>,
  ) {}

  public async batchRollback(): Promise<void> {
    await this.propertyModel
      .updateMany(
        {
          propertyStatus: PropertyStatus.ACTIVE,
        },
        { propertyRank: 0 },
      )
      .exec();
    console.log("batchRollback");
  }

  public async batchTopProperties(): Promise<void> {
    const properties: Property[] = await this.propertyModel
      .find({ propertyStatus: PropertyStatus.ACTIVE, propertyRank: 0 })
      .exec();
    const promisedList = properties.map(async (ele: Property) => {
      const { _id, propertyLikes, propertyViews } = ele;
      const rank = propertyLikes * 2 + propertyViews * 1;
      return await this.propertyModel.findByIdAndUpdate(_id, {
        //5. Database'dagi rankni update qilish
        propertyRank: rank,
      });
    });
    await Promise.all(promisedList); //bo‘lmasa, method barcha update'lar tugashini kutmasligi mumkin.
  }
  public getHello(): string {
    return "Welcome to beautyStudio BATCH Server";
  }
}
