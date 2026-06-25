import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEO from '../components/SEO';

function renderSEO(props) {
  const { container } = render(
    <HelmetProvider>
      <div>
        <SEO {...props} />
        <h1>{props.title || 'default'}</h1>
      </div>
    </HelmetProvider>
  );
  return container;
}

describe('Composant SEO', () => {
  it('se rend sans erreur avec un titre', () => {
    expect(() => renderSEO({ title: 'Connexion', path: '/login' })).not.toThrow();
  });

  it('se rend sans erreur sans props', () => {
    expect(() => renderSEO({ path: '/' })).not.toThrow();
  });

  it('se rend sans erreur avec noIndex', () => {
    expect(() => renderSEO({ title: 'Admin', path: '/admin', noIndex: true })).not.toThrow();
  });
});
