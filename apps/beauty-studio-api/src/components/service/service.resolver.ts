import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Service, Services } from "../../libs/dto/service/service";
import {
  ServiceInput,
  ServicesInquiry,
} from "../../libs/dto/service/service.input";
import { ServiceUpdate } from "../../libs/dto/service/service.update";
import { MemberType } from "../../libs/enums/member.enum";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ServiceService } from "./service.service";

@Resolver(() => Service)
export class ServiceResolver {
  constructor(private readonly serviceService: ServiceService) {}

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Service)
  createService(@Args("input") input: ServiceInput): Promise<Service> {
    return this.serviceService.createService(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Service)
  updateService(@Args("input") input: ServiceUpdate): Promise<Service> {
    return this.serviceService.updateService(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Services)
  getServicesByAdmin(@Args("input") input: ServicesInquiry): Promise<Services> {
    return this.serviceService.getServices(input, true);
  }

  @Query(() => Services)
  getServices(@Args("input") input: ServicesInquiry): Promise<Services> {
    return this.serviceService.getServices(input);
  }

  @Query(() => Service)
  getService(@Args("serviceId") serviceId: string): Promise<Service> {
    return this.serviceService.getService(serviceId);
  }
}
