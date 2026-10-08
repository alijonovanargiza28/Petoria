import { MongooseModule } from "@nestjs/mongoose";
import MemberSchema from "../../schemas/Member.model";
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { HttpModule } from "@nestjs/axios";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Member", schema: MemberSchema }]),
    HttpModule, //Bu NestJS'ga HTTP requestlar yuborish imkonini beradi.
    JwtModule.register({
      //Bu NestJS JWT modulini sozlayapti.
      secret: `${process.env.SECRET_TOKEN}`,
      signOptions: { expiresIn: "30d" },
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
