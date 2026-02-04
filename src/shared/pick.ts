//
export const pick = <T extends Record<string, unknown>, k extends keyof T>(
  obj: T,
  keys: k[],
): Partial<T> => {
  const finalObj: Partial<T> = {};

  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }
  // console.log(finalObj, "[1;31mfinalObj in pick.ts at line 7[0m");
  return finalObj;
};

// pick return value like this
/*
 {
  page: "2",
  limit: "10",
  sortBy: "createdAt",
  sortOrder: "desc",
}

 * */

