import { $api } from '@/utils/client';
import { BoxProps } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';

import WorkbookCreateForm from './WorkbookCreateForm';

interface WorkbookEditModalInnerProps extends BoxProps {
  wid: string,
  name: string,
  date?: Date
}

export default function WorkbookEditModal({
  context, 
  id, 
  innerProps,
}: ContextModalProps<WorkbookEditModalInnerProps>){
  const { wid, name, date } = innerProps;
  const { mutate } = $api.useMutation("put", "/workbooks/{wid}");

  const toEdit = async (name: string, published?: Date) => {
    mutate({ 
      body: {
        name,
        published,
      },
      params: {
        path: {
          wid
        }
      }
    });
    context.closeModal(id);
  };

  return (
    <WorkbookCreateForm
      name={name}
      date={date}
      onSubmit={toEdit}
      onClose={() => context.closeModal(id)}
    />
  );
}