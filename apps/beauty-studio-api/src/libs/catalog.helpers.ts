import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { Direction } from "./enums/common.enum";

export function catalogId(id: string): Types.ObjectId {
  if (!/^[a-f\d]{24}$/i.test(id))
    throw new BadRequestException("Invalid catalog ID");
  return new Types.ObjectId(id);
}

export function catalogPagination(
  input: {
    page?: number;
    limit?: number;
    sort?: string;
    direction?: Direction;
  },
  allowedSorts: string[],
  defaultSort: string,
) {
  const {
    page = 1,
    limit = 20,
    sort = defaultSort,
    direction = Direction.ASC,
  } = input;
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isSafeInteger((page - 1) * limit)
  ) {
    throw new BadRequestException("Invalid pagination");
  }
  if (
    !allowedSorts.includes(sort) ||
    ![Direction.ASC, Direction.DESC].includes(direction)
  )
    throw new BadRequestException("Invalid catalog sorting");
  return {
    skip: (page - 1) * limit,
    limit,
    sort: { [sort]: direction, _id: direction },
  };
}

export function literalSearch(text: string): RegExp {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

export function catalogFields<T extends object, K extends keyof T>(
  input: T,
  keys: readonly K[],
): Pick<T, K> {
  const selected = {} as Pick<T, K>;
  for (const key of keys)
    if (input[key] !== undefined) selected[key] = input[key];
  return selected;
}
