import type { ApiEnvelope } from '@/utils/api/response';

export type SyncOperation = {
  id: string;
  method: 'POST' | 'PUT';
  url: string;
  body: Record<string, unknown>;
  entityType: 'project' | 'note';
  tempId?: string;
  projectId?: string;
};

type SyncListener = (pending: number, failed: number) => void;

const queue: SyncOperation[] = [];
const failedIds = new Set<string>();
let processing = false;
let listener: SyncListener | null = null;

export function setSyncListener(nextListener: SyncListener | null) {
  listener = nextListener;
  notifyListener();
}

function notifyListener() {
  if (listener) {
    listener(queue.length, failedIds.size);
  }
}

export function enqueueOperation(operation: SyncOperation) {
  queue.push(operation);
  notifyListener();
  void processQueue();
}

export async function processQueue() {
  if (processing) {
    return;
  }

  processing = true;

  while (queue.length > 0) {
    const operation = queue[0];
    const success = await executeOperation(operation);

    if (success) {
      queue.shift();
      failedIds.delete(operation.id);
    } else {
      failedIds.add(operation.id);
      break;
    }

    notifyListener();
  }

  processing = false;
}

async function executeOperation(operation: SyncOperation) {
  try {
    const response = await fetch(operation.url, {
      method: operation.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operation.body),
    });
    const envelope = (await response.json()) as ApiEnvelope<Record<string, unknown>>;

    if (!response.ok || envelope.error) {
      return false;
    }

    if (operation.tempId && envelope.data?.id && typeof envelope.data.id === 'string') {
      window.dispatchEvent(
        new CustomEvent('notos:sync-resolved', {
          detail: {
            entityType: operation.entityType,
            tempId: operation.tempId,
            serverId: envelope.data.id,
            projectId: operation.projectId,
            data: envelope.data,
          },
        })
      );
    }

    return true;
  } catch {
    return false;
  }
}

export function getQueueStats() {
  return {
    pending: queue.length,
    failed: failedIds.size,
  };
}

export function retryFailedOperations() {
  void processQueue();
}
