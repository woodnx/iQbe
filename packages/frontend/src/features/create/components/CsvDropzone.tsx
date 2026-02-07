import { Group, rem, Text } from "@mantine/core";
import { Dropzone, DropzoneProps, MIME_TYPES } from "@mantine/dropzone";
import { IconFileTypeCsv, IconUpload, IconX } from "@tabler/icons-react";

export default function CsvDropzone(props: Partial<DropzoneProps>) {
  return (
    <Dropzone
      loading={props.loading}
      onDrop={(files) => (!!props.onDrop ? props.onDrop(files) : null)}
      maxSize={5 * 1024 ** 2}
      accept={[MIME_TYPES.csv]}
      {...props}
    >
      <Group
        justify="center"
        gap="xl"
        mih={220}
        style={{ pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-blue-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-red-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconFileTypeCsv
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-dimmed)",
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            CSVファイルをドラッグするか、クリックしてファイルを選択してください
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            ファイルサイズは5MBまで
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
