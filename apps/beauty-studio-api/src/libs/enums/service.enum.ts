import { registerEnumType } from "@nestjs/graphql";

export enum ServiceStatus {
  ACTIVE = "ACTIVE",
  PAUSE = "PAUSE",
  DELETE = "DELETE",
}
registerEnumType(ServiceStatus, { name: "ServiceStatus" });
