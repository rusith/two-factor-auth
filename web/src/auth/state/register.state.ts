import { create } from 'zustand';

export const useRegisterStore = create<{
  page: number;
  name: string;
  email: string;
  password: string;

  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  next: () => void;
  canGoNext: () => boolean;
}>((set, get) => ({
  page: 1,

  name: '',
  email: '',
  password: '',
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  next: () => set({ page: 2 }),
  canGoNext: () => {
    const { name, email, password } = get();
    return name.length > 0 && email.length > 0 && password.length > 0;
  }
}));
