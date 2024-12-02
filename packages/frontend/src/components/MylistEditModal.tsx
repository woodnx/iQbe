import { $api } from '@/utils/client';
import { BoxProps } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';

import MylistEditForm from './MylistEditForm';

interface MylistEditModalInnerProps extends BoxProps {
  mid: string,
  name: string,
}

export default function MylistEditModal({
  context, 
  id, 
  innerProps,
}: ContextModalProps<MylistEditModalInnerProps>){
  const { mid, name } = innerProps;
  const { mutate } = $api.useMutation("put", "/mylists");

  const toEdit = async (listName: string) => {
    mutate({ body: {
      mid,
      listName,
    }});
    context.closeModal(id);
  };

  return (
    <MylistEditForm 
      name={name}
      onSave={toEdit}
      onClose={() => context.closeModal(id)}
    />
  );
}