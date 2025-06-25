import Hashids from "hashids";

const hashids = new Hashids(
  process.env.HASHIDS_SALT,
  10,
  process.env.HASHIDS_ALPHABET,
);

export const generateHashId = (id: number) => {
  return hashids.encode(id + 1);
};
