"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSearch = void 0;
const userSearch = (search) => {
    if (!search) {
        return undefined;
    }
    const searchConditions = [];
    if (search) {
        searchConditions.push({ username: { contains: search, mode: "insensitive" } }, { designation: { contains: search, mode: "insensitive" } });
    }
    return {
        OR: searchConditions,
    };
};
exports.userSearch = userSearch;
