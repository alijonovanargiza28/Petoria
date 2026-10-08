import { Schema, InferSchemaType } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: { type: String, maxlength: 1000 },
    image: { type: String, maxlength: 2048 },
    sort: { type: Number, required: true, default: 0, min: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    collection: "categories",
    autoCreate: false,
    autoIndex: false,
  },
);
CategorySchema.index({ isActive: 1, sort: 1, _id: 1 });
export type CategoryRecord = InferSchemaType<typeof CategorySchema>;
export default CategorySchema;
