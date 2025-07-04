/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  testEnvironment: "node",
  roots: ["./src"], // テストファイルのルートディレクトリ
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
