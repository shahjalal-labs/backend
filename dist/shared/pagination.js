"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationHelper = void 0;
const paginationHelper = (query) => {
    let { page = 1, limit = 10, search = "" } = query;
    page = Number(page);
    limit = Number(limit);
    search = String(search);
    const skip = (page - 1) * limit;
    const take = limit;
    return { skip, take, limit, page, search };
};
exports.paginationHelper = paginationHelper;
