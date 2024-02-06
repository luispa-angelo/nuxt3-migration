export const getEnum = (value: any, meta: any[]): any => {
  if (meta.length === 0 || !value) {
    return value;
  }
  const eNum = meta.find((el) => el.value === value);
  if (eNum) {
    return eNum.name;
  }
  return value;
};

export const getEnumValue = (name: any, meta: any[]): any => {
  if (meta.length === 0 || !name) {
    return name;
  }
  const eNum = meta.find((el) => el.name === name);
  if (eNum) {
    return eNum.value;
  }
  return name;
};
