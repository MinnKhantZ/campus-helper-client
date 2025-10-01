import { BASE_URL } from './BaseUrl';
import type { RootState } from '../store';

export const uploadImage = async (uri: string, getState: () => RootState): Promise<string> => {
  const state = getState();
  const token = state.auth?.accessToken;

  // Prepare multipart form data
  const form = new FormData();
  // For Expo ImagePicker, uri points to a local file; set a name and type
  const name = uri.split('/').pop() || `upload.jpg`;
  const type = name.endsWith('.png') ? 'image/png' : 'image/jpeg';
  form.append('image', { uri, name, type } as unknown as Blob);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const data = await res.json();
  return data.url as string;
};
