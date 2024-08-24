import { v4 as uuidv4 } from 'uuid';

export const getNewId = (): string => {
  const newId = uuidv4();
  return newId;
};
