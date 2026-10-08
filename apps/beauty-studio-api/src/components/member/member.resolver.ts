import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import mongoose from "mongoose";

import { MemberService } from "./member.service";

import {
  AgentsInquiry,
  LoginInput,
  MemberInput,
  MembersInquiry,
} from "../../libs/dto/member/member.input";

import { Message } from "../../libs/enums/common.enum";

import { AuthGuard } from "../auth/guards/auth.guard";
import { AuthMember } from "../auth/decorators/authMember.decorator";
import { MemberType } from "../../libs/enums/member.enum";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { MemberUpdate } from "../../libs/dto/member/member.update";

import {
  getSerialForImage,
  shapeIntoMongoObjectId,
  validMimeTypes,
} from "../../libs/config";

import { WithoutGuard } from "../auth/guards/without.guard";

import { GraphQLUpload, FileUpload } from "graphql-upload";

import { createWriteStream, existsSync, mkdirSync } from "fs";

import { join } from "path";

import { Member, Members } from "../../libs/dto/member/member";

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  // ========================= SIGNUP =========================

  @Mutation(() => Member)
  public async signup(@Args("input") input: MemberInput): Promise<Member> {
    console.log("Mutation: signup");

    return await this.memberService.signup(input);
  }

  // ========================= LOGIN =========================

  @Mutation(() => Member)
  public async login(@Args("input") input: LoginInput): Promise<Member> {
    console.log("Mutation: login");

    return await this.memberService.login(input);
  }

  // ========================= CHECK AUTH =========================

  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuth(
    @AuthMember("memberNick")
    memberNick: string,
  ): Promise<string> {
    console.log("Query: checkAuth");
    console.log("memberNick:", memberNick);

    return `Hi ${memberNick}`;
  }

  // ========================= CHECK AUTH ROLES =========================

  @Roles(MemberType.USER, MemberType.AGENT)
  @UseGuards(RolesGuard)
  @Query(() => String)
  public async checkAuthRoles(
    @AuthMember() authMember: Member,
  ): Promise<string> {
    console.log("Query: checkAuthRoles");

    return `HI ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
  }

  // ========================= UPDATE MEMBER =========================

  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async updateMember(
    @Args("input") input: MemberUpdate,
    @AuthMember("_id")
    memberId: mongoose.Types.ObjectId,
  ): Promise<Member> {
    console.log("Mutation: updateMember");

    delete input._id;

    return await this.memberService.updateMember(memberId, input);
  }

  // ========================= GET MEMBER =========================

  @UseGuards(WithoutGuard)
  @Query(() => Member)
  public async getMember(
    @Args("memberId") input: string,
    @AuthMember("_id")
    memberId: mongoose.Types.ObjectId,
  ): Promise<Member> {
    console.log("Query: getMember");

    const targetId = shapeIntoMongoObjectId(input);

    return await this.memberService.getMember(memberId, targetId);
  }

  // ========================= GET AGENTS =========================

  @UseGuards(WithoutGuard)
  @Query(() => Members)
  public async getAgents(
    @Args("input") input: AgentsInquiry,
    @AuthMember("_id")
    memberId: mongoose.Types.ObjectId,
  ): Promise<Members> {
    console.log("Query: getAgents");

    return await this.memberService.getAgents(memberId, input);
  }

  // ========================= LIKE MEMBER =========================

  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async likeTargetMember(
    @Args("memberId") input: string,
    @AuthMember("_id")
    memberId: mongoose.Types.ObjectId,
  ): Promise<Member> {
    console.log("Mutation: LikeTargetMember");

    const likeRefId = shapeIntoMongoObjectId(input);

    return await this.memberService.likeTargetMember(memberId, likeRefId);
  }

  // ========================= ADMIN =========================

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Members)
  public async getAllMemberByAdmin(
    @Args("input") input: MembersInquiry,
  ): Promise<Members> {
    console.log("Query: getAllMemberByAdmin");

    return await this.memberService.getAllMemberByAdmin(input);
  }

  // ========================= ADMIN UPDATE =========================

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Member)
  public async updateMemberByAdmin(
    @Args("input") input: MemberUpdate,
  ): Promise<Member> {
    console.log("Mutation: updateMemberByAdmin");

    return await this.memberService.updateMemberByAdmin(input);
  }

  // ========================= SINGLE IMAGE =========================

  @UseGuards(AuthGuard)
  @Mutation(() => String)
  public async imageUploader(
    @Args({
      name: "file",
      type: () => GraphQLUpload,
    })
    { createReadStream, filename, mimetype }: FileUpload,

    @Args("target")
    target: string,
  ): Promise<string> {
    console.log("Mutation: imageUploader");
    console.log("filename:", filename);
    console.log("mimetype:", mimetype);
    console.log("target:", target);

    if (!filename) {
      throw new Error(Message.UPLOAD_FAILED);
    }

    const validMime = validMimeTypes.includes(mimetype);

    if (!validMime) {
      console.log("Invalid mimetype:", mimetype);

      throw new Error(Message.PROVIDE_ALLOWED_FORMAT);
    }

    const imageName = getSerialForImage(filename);

    const uploadDir = join(process.cwd(), "uploads", target);

    console.log("uploadDir:", uploadDir);

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, {
        recursive: true,
      });

      console.log("Upload directory created:", uploadDir);
    }

    const filePath = join(uploadDir, imageName);

    console.log("filePath:", filePath);

    const stream = createReadStream();

    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(filePath);

      writeStream.on("finish", () => {
        console.log("Image uploaded successfully:", filePath);

        resolve();
      });

      writeStream.on("error", (error) => {
        console.error("Image upload error:", error);

        reject(error);
      });

      stream.on("error", (error) => {
        console.error("Read stream error:", error);

        reject(error);
      });

      stream.pipe(writeStream);
    });

    const url = `uploads/${target}/${imageName}`;

    console.log("Image URL:", url);

    return url;
  }

  // ========================= MULTIPLE IMAGES =========================

  @UseGuards(AuthGuard)
  @Mutation(() => [String])
  public async imagesUploader(
    @Args("files", {
      type: () => [GraphQLUpload],
    })
    files: Promise<FileUpload>[],

    @Args("target")
    target: string,
  ): Promise<string[]> {
    console.log("=================================");
    console.log("Mutation: imagesUploader");
    console.log("target:", target);
    console.log("files:", files);
    console.log("=================================");

    const uploadedImages: string[] = [];

    // =========================
    // UPLOAD DIRECTORY
    // =========================

    const uploadDir = join(process.cwd(), "uploads", target);

    console.log("uploadDir:", uploadDir);

    // uploads/property papkasini yaratamiz
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, {
        recursive: true,
      });

      console.log("Upload directory created:", uploadDir);
    }

    // =========================
    // UPLOAD FILES
    // =========================

    const promisedList = files.map(
      async (img: Promise<FileUpload>, index: number): Promise<void> => {
        try {
          const { filename, mimetype, createReadStream } = await img;

          console.log("---------------------------------");
          console.log("FILE INDEX:", index);
          console.log("filename:", filename);
          console.log("mimetype:", mimetype);

          // =========================
          // CHECK FILENAME
          // =========================

          if (!filename) {
            throw new Error(Message.UPLOAD_FAILED);
          }

          // =========================
          // CHECK MIME TYPE
          // =========================

          const validMime = validMimeTypes.includes(mimetype);

          console.log("validMime:", validMime);

          if (!validMime) {
            throw new Error(Message.PROVIDE_ALLOWED_FORMAT);
          }

          // =========================
          // GENERATE IMAGE NAME
          // =========================

          const imageName = getSerialForImage(filename);

          console.log("imageName:", imageName);

          // =========================
          // FULL FILE PATH
          // =========================

          const filePath = join(uploadDir, imageName);

          console.log("filePath:", filePath);

          // =========================
          // CREATE READ STREAM
          // =========================

          const stream = createReadStream();

          // =========================
          // SAVE IMAGE
          // =========================

          await new Promise<void>((resolve, reject) => {
            const writeStream = createWriteStream(filePath);

            // File successfully saved
            writeStream.on("finish", () => {
              console.log("Image uploaded successfully:", filePath);

              resolve();
            });

            // Write error
            writeStream.on("error", (error) => {
              console.error("Write stream error:", error);

              reject(error);
            });

            // Read error
            stream.on("error", (error) => {
              console.error("Read stream error:", error);

              reject(error);
            });

            // Start upload
            stream.pipe(writeStream);
          });

          // =========================
          // RETURN URL
          // =========================

          const url = `uploads/${target}/${imageName}`;

          uploadedImages[index] = url;

          console.log("Saved URL:", url);

          console.log("---------------------------------");
        } catch (err) {
          console.error(
            `Error uploading file at index ${index}:`,
            err instanceof Error ? err.message : err,
          );

          // Errorni yashirmaymiz
          throw err;
        }
      },
    );

    // =========================
    // WAIT FOR ALL FILES
    // =========================

    await Promise.all(promisedList);

    console.log("=================================");
    console.log("UPLOADED IMAGES:", uploadedImages);
    console.log("=================================");

    return uploadedImages;
  }
}
