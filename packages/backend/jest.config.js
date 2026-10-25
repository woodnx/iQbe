import { createDefaultEsmPreset } from "ts-jest";

const esmPreset = createDefaultEsmPreset({
  tsconfig: "./tsconfig.json",
});

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...esmPreset,
  testEnvironment: "node",
  roots: ["./src"], // テストファイルのルートディレクトリ
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  moduleNameMapper: {
    "^@/(.*)\\.js$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
