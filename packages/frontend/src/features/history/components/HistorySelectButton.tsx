import { ButtonProps, Text, UnstyledButton } from "@mantine/core";

interface Props extends ButtonProps {
  label: string;
  count: number;
  isSelect?: boolean;
  divide?: boolean;
  onClick?: () => void;
}

export default function HistorySelectButton({
  label,
  count,
  divide = false,
  color,
  isSelect = false,
  onClick = () => {},
}: Props) {
  const c = isSelect ? color : "dark";
  const weight = isSelect ? 500 : 400;

  return (
    <UnstyledButton onClick={onClick}>
      <Text span c={c} fz={17} fw={weight}>
        {label}{" "}
      </Text>
      <Text component="span" c={c} fz={30} fw={weight}>
        {count}
      </Text>
      {!!divide ? (
        <Text component="span" fz={30} mx={8}>
          /
        </Text>
      ) : null}
    </UnstyledButton>
  );
}
