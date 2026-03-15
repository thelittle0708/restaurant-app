import { render, screen, fireEvent, act } from '@testing-library/react';
import { MenuItemCard } from '../components/kitchen/MenuItemCard';
import type { OrderItem } from '../types';

const mockItem: OrderItem = {
  id: '1', orderId: 'o1', menuItemId: 'm1',
  menuItem: { id: 'm1', name: '김치찌개', price: 9000, handledBy: 'KITCHEN', isAvailable: true, categoryId: 'c1' },
  quantity: 2, status: 'WAITING', handledBy: 'KITCHEN', createdAt: new Date().toISOString(),
};

it('shows menu name and quantity', () => {
  render(<MenuItemCard item={mockItem} onStatusChange={() => {}} />);
  expect(screen.getByText('김치찌개')).toBeInTheDocument();
  expect(screen.getByText('× 2')).toBeInTheDocument();
});

it('calls onStatusChange with next status on tap', () => {
  const onChange = vi.fn();
  render(<MenuItemCard item={mockItem} onStatusChange={onChange} />);
  fireEvent.click(screen.getByRole('button'));
  expect(onChange).toHaveBeenCalledWith('1', 'COOKING');
});

it('calls onStatusChange with prev status on long press', async () => {
  const item = { ...mockItem, status: 'COOKING' as const };
  const onChange = vi.fn();
  render(<MenuItemCard item={item} onStatusChange={onChange} />);
  const btn = screen.getByRole('button');
  fireEvent.mouseDown(btn);
  await act(async () => { await new Promise((r) => setTimeout(r, 600)); });
  fireEvent.mouseUp(btn);
  expect(onChange).toHaveBeenCalledWith('1', 'WAITING');
});
