import { prisma } from '../lib/prisma';
import { getIo } from '../lib/io';

export async function syncTableStatus(tableId: string) {
  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table || table.status === 'EMPTY' || table.status === 'RESERVED') return;

  const activeSession = await prisma.tableSession.findFirst({
    where: { tableId, closedAt: null },
    include: {
      orders: {
        include: { items: { where: { handledBy: 'KITCHEN' } } },
      },
    },
  });

  if (!activeSession) return;

  const allItems = activeSession.orders.flatMap((o) => o.items);
  const hasDone = allItems.some((i) => i.status === 'DONE');
  const newStatus = hasDone ? 'PICKUP_READY' : 'OCCUPIED';

  if (table.status !== newStatus) {
    await prisma.table.update({ where: { id: tableId }, data: { status: newStatus } });
    getIo().emit('table:status', { tableId, status: newStatus });
  }
}
