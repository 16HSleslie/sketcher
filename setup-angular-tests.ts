import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
// No additional imports needed

// Initialize the Jest testing environment for Angular
setupZoneTestEnv();

// Add jasmine compatibility for tests written with jasmine syntax
global.jasmine = {
  createSpyObj: (baseName: any, methodNames: any) => {
    const obj: any = {};
    if (Array.isArray(methodNames)) {
      for (const method of methodNames) {
        obj[method] = jest.fn();
      }
    } else if (typeof methodNames === 'object') {
      for (const method in methodNames) {
        obj[method] = jest.fn();
      }
    }
    return obj;
  }
} as any;

// Mock browser objects for the JSDOM environment
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
      getPropertyValue: () => ''
    };
  }
});

// Mock localStorage and sessionStorage
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', { value: mockStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockStorage });

// Mock some browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Handle Angular component tests that reference the Router
jest.mock('@angular/router', () => ({
  ...jest.requireActual('@angular/router'),
  Router: jest.fn(() => ({
    navigate: jest.fn(),
    navigateByUrl: jest.fn(),
    events: {
      pipe: jest.fn(() => ({
        subscribe: jest.fn()
      }))
    }
  })),
  ActivatedRoute: jest.fn(() => ({
    params: {
      subscribe: jest.fn()
    },
    queryParams: {
      subscribe: jest.fn()
    },
    snapshot: {
      paramMap: {
        get: jest.fn()
      },
      queryParamMap: {
        get: jest.fn()
      }
    }
  }))
}));

// Add custom matchers for Angular-specific testing
(expect as any).extend({
  toBeTrue(received) {
    const pass = received === true;
    return {
      message: () => `expected ${received} to be true`,
      pass
    };
  },
  toBeFalse(received) {
    const pass = received === false;
    return {
      message: () => `expected ${received} to be false`,
      pass
    };
  }
});

// Jest uses jsdom which doesn't have the full set of DOM APIs
// This adds missing functions that Angular might expect
if (typeof document.createRange === 'undefined') {
  document.createRange = () => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document
    },
    createContextualFragment: (str: string) => {
      const temp = document.createElement('template');
      temp.innerHTML = str;
      return temp.content;
    }
  } as unknown as Range);
}

// Workaround for Jest + Angular compatibility
global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val)); 