//
export type TOptions = {
  page?: number;
  limit?: number;
  sortOrder?: string;
  sortBy?: string;
};

export type TOptionsResult = {
  page: number;
  limit: number;

  sortOrder: string;
  sortBy: string;
  skip: number;
};

export const paginationOptions = ["page", "limit", "sortBy", "sortOrder"];

const calcalutePagination = (options: TOptions): TOptionsResult => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const sortOrder = options.sortOrder || "desc";

  const sortBy = options.sortBy || "createdAt";
  return {
    page,
    limit,
    skip,
    sortOrder,
    sortBy,
  };
};

export const paginationHelper = {
  calcalutePagination,
};
