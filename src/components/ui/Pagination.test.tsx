import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders page buttons for multiple pages', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('disables prev button on first page', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it('calls onPageChange when clicking a page number', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when clicking next', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />);
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[buttons.length - 1]);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('shows ellipsis for large page ranges', () => {
    render(<Pagination page={5} totalPages={10} onPageChange={() => {}} />);
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });
});
