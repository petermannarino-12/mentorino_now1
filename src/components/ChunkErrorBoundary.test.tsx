import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChunkErrorBoundary } from './ChunkErrorBoundary';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ChunkErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ChunkErrorBoundary>
        <div>Safe Content</div>
      </ChunkErrorBoundary>
    );
    expect(screen.getByText('Safe Content')).toBeInTheDocument();
  });

  it('renders error UI when a child throws', () => {
    const ThrowingComponent = () => {
      throw new Error('Test error');
    };

    render(
      <ChunkErrorBoundary>
        <ThrowingComponent />
      </ChunkErrorBoundary>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(screen.getByText('Reload Application')).toBeInTheDocument();
  });
});
