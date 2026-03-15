import { render, screen } from '@testing-library/react';
import { TableNode } from '../components/hall/TableNode';
import type { Table } from '../types';

const mockTable: Table = {
  id: '1', name: 'T1', x: 100, y: 100, width: 80, height: 80, status: 'EMPTY',
};

it('renders table name', () => {
  render(<TableNode table={mockTable} isSelected={false} onClick={() => {}} />);
  expect(screen.getByText('T1')).toBeInTheDocument();
});

it('applies correct color for OCCUPIED status', () => {
  const t = { ...mockTable, status: 'OCCUPIED' as const };
  const { container } = render(<TableNode table={t} isSelected={false} onClick={() => {}} />);
  expect(container.firstChild).toHaveClass('bg-green-500');
});

it('applies correct color for PICKUP_READY status', () => {
  const t = { ...mockTable, status: 'PICKUP_READY' as const };
  const { container } = render(<TableNode table={t} isSelected={false} onClick={() => {}} />);
  expect(container.firstChild).toHaveClass('bg-red-500');
});
