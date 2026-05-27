import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('shows loading text when loading', () => {
    render(<Button loading>Click Me</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Click Me')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click Me</Button>);
    await userEvent.click(screen.getByText('Click Me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading', () => {
    render(<Button loading>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
