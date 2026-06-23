import localforage from 'localforage';

type UserStore = ReturnType<typeof localforage.createInstance>;

const stores = new Map<string, UserStore>();

export function getUserStore(userId: string) {
  let store = stores.get(userId);

  if (!store) {
    store = localforage.createInstance({
      name: 'notos',
      storeName: `user_${userId}`,
    });
    stores.set(userId, store);
  }

  return store;
}

export async function readProjects(userId: string) {
  const store = getUserStore(userId);
  const projects = await store.getItem<unknown[]>('projects');
  return projects ?? [];
}

export async function writeProjects(userId: string, projects: unknown[]) {
  const store = getUserStore(userId);
  await store.setItem('projects', projects);
}

export async function readNotes(userId: string, projectId: string) {
  const store = getUserStore(userId);
  const notes = await store.getItem<unknown[]>(`notes:${projectId}`);
  return notes ?? [];
}

export async function writeNotes(userId: string, projectId: string, notes: unknown[]) {
  const store = getUserStore(userId);
  await store.setItem(`notes:${projectId}`, notes);
}
