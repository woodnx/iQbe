import { MantineNumberSize, createStyles } from "@mantine/core";

// Styles Paramsはオプショナル
export interface QuizCardStylesParams {
  margin?: MantineNumberSize
}

export default createStyles((theme, { margin }: QuizCardStylesParams) => ({
  // 通常と同様にstyleを追加
  root: {
    margin: margin
  },
  text: {
    paddingTop: theme.spacing.xs
  }
}))