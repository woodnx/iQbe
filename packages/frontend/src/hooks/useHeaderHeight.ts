import useSWR from "swr"

const useHeaderHeight = () => {
  const { data: headerHeight, mutate: setHeaderHeight } = useSWR<number>('header-height', null, { fallbackData: 0 });

  return {
    headerHeight,
    setHeaderHeight
  }
}

export default useHeaderHeight;