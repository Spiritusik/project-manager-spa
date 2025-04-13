import { ref, type Ref } from 'vue';

export interface DialogController<T> {
  data: Ref<T | undefined>;
  open: Ref<boolean>;
  handleOpen: (data?: T) => void;
  handleClose: () => void;
}

export function useDialog<T>(): DialogController<T> {
  const open = ref(false);
  const data = ref<T>();

  const handleOpen = (newData?: T) => {
    data.value = newData;
    open.value = true;
  };

  const handleClose = () => {
    open.value = false;
  };

  return {
    data: data,
    open: open,
    handleOpen,
    handleClose
  };
}
