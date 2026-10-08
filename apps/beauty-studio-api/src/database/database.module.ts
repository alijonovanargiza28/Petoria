import { ConfigModule, ConfigService } from "@nestjs/config";
import { beautyDatabaseOptions } from "../libs/database.config";
import { Module } from "@nestjs/common";
import { InjectConnection, MongooseModule } from "@nestjs/mongoose";
import { Connection, STATES } from "mongoose";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        beautyDatabaseOptions({
          NODE_ENV: config.get<string>("NODE_ENV"),
          BEAUTY_MONGO_URI: config.get<string>("BEAUTY_MONGO_URI"),
          BEAUTY_MONGO_DB_NAME: config.get<string>("BEAUTY_MONGO_DB_NAME"),
          MONGO_DEV: config.get<string>("MONGO_DEV"),
          MONGO_PROD: config.get<string>("MONGO_PROD"),
        }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    if (connection.readyState === STATES.connected) {
      console.log(`MongoDB is connected into ${process.env.NODE_ENV} db`);
    } else {
      console.log("DB is not connected!");
    }
  }
}
