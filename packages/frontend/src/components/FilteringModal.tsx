import FilteringForm from '@/components/FilteringForm';
import { useIsMobile } from '@/contexts/isMobile';
import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

interface FilteringModalProps {
  onSubmit: (
    wids?: string | string[],
    keyword?: string,
    keywordOption?: number,
    categories?: number | number[],
    tags?: string | string[],
    tagMatchAll?: boolean,
    maxView?: number, 
  ) => void,
  isFilterKeyword?: boolean,
  initalState?: boolean,
  opened?: boolean,
  onOpen?: () => void,
  onClose?: () => void,
};

export default function FilteringModal({
  opened: outerOpened,
  isFilterKeyword = false,
  onSubmit = () => {},
  onClose,
}: FilteringModalProps) {
  const [ opened, { close } ] = useDisclosure();
  const isMobile = useIsMobile();

  const innerOpened = outerOpened || opened;
  const innerOnClose = onClose || close;

  return (
    <>
      <Modal 
        opened={innerOpened} 
        onClose={() => innerOnClose()}
        title="絞り込み"
        size="lg"
        fullScreen={isMobile}
        pos="absolute"
      >
        <FilteringForm 
          isFilterKeyword={isFilterKeyword}
          onSubmit={({
            wids,
            keyword,
            keywordOption,
            categories,
            tags,
            tagMatchAll,
            maxView,
          }) => {
            onSubmit(
              wids || undefined,
              keyword || undefined,
              keywordOption || undefined,
              categories || undefined,
              tags || undefined,
              tagMatchAll || undefined,
              maxView || undefined,
            )
          }}
        />
      </Modal>
    </>
  );
}