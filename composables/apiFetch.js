import { ofetch } from 'ofetch';

export const apiFetch = ofetch.create({
  baseURL: useRuntimeConfig().public.baseURL,
});
