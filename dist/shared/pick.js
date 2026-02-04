"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pick = void 0;
//
const pick = (obj, keys) => {
    const finalObj = {};
    for (const key of keys) {
        if (obj && Object.hasOwnProperty.call(obj, key)) {
            finalObj[key] = obj[key];
        }
    }
    // console.log(finalObj, "[1;31mfinalObj in pick.ts at line 7[0m");
    return finalObj;
};
exports.pick = pick;
// pick return value like this
/*
 {
  page: "2",
  limit: "10",
  sortBy: "createdAt",
  sortOrder: "desc",
}

 * */
