import { Avatar, FileButton, Paper, Stack, Text } from "@mantine/core";

export interface ButtonWithFileInputProps {
  image?: string;
  onLoad?: (image: string) => void;
}

export default function ButtonWithFileInput({
  image,
  onLoad = () => {},
}: ButtonWithFileInputProps) {
  const selectFile = async (payload: File | null) => {
    if (payload) {
      const url = URL.createObjectURL(payload);
      onLoad(url);
    }
  };

  const FileSelectButton = ({ onClick }: { onClick: () => void }) => (
    <Paper
      component="button"
      onClick={onClick}
      style={{ border: "none", cursor: "pointer" }}
    >
      <Stack align="center" justify="center" gap="xs">
        <Avatar size={100} src={image} />
        <Text c="gray" fz="sm">
          変更する
        </Text>
      </Stack>
    </Paper>
  );

  return (
    <FileButton onChange={selectFile} accept="image/png,image/jpeg">
      {(props) => <FileSelectButton {...props} />}
    </FileButton>
  );
}
