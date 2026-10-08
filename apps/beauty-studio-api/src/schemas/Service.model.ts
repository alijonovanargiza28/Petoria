import { Schema, InferSchemaType } from "mongoose";
import { ServiceStatus } from "../libs/enums/service.enum";

const ServiceSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: { type: String, maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    duration: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },
    image: { type: String, maxlength: 2048 },
    serviceStatus: {
      type: String,
      enum: ServiceStatus,
      required: true,
      default: ServiceStatus.ACTIVE,
    },
    serviceViews: { type: Number, required: true, default: 0 },
    serviceLikes: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    collection: "services",
    autoCreate: false,
    autoIndex: false,
  },
);
ServiceSchema.index({ serviceStatus: 1, categoryId: 1, createdAt: -1, _id: 1 });
export type ServiceRecord = InferSchemaType<typeof ServiceSchema>;
export default ServiceSchema;
