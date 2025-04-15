/**
 * Testing helpers for creating mock objects compatible with Jasmine spy syntax
 */

// Create type-safe mocks with type checking
export function createSpyObj<T>(baseName: string, methodNames: Array<keyof T>): jest.Mocked<T> {
  const obj: any = {};
  
  for (const method of methodNames) {
    obj[method] = jest.fn().mockName(`${baseName}.${String(method)}`);
  }

  // Add jasmine-like syntax to jest mock functions
  methodNames.forEach(method => {
    const mockFn = obj[method];
    if (!mockFn.and) {
      mockFn.and = {
        returnValue: (val: any) => mockFn.mockReturnValue(val),
        callFake: (fn: Function) => mockFn.mockImplementation(fn),
        throwError: (err: any) => mockFn.mockImplementation(() => { throw err; }),
      };
    }
  });

  return obj as jest.Mocked<T>;
}

// Create a mock observable that returns a value
export function mockObservable<T>(value: T): any {
  return {
    subscribe: jest.fn().mockImplementation((onNext: any) => {
      onNext(value);
      return {
        unsubscribe: jest.fn()
      };
    })
  };
}

// Mock browser APIs that might be used in Angular components
export function mockBrowserAPIs() {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
  };

  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
  
  // Mock other browser APIs as needed
  Object.defineProperty(window, 'sessionStorage', { value: mockLocalStorage });
  Object.defineProperty(window, 'scrollTo', { value: jest.fn() });
  
  // Mock router-related objects
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/',
        pathname: '/',
        search: '',
        hash: '',
        reload: jest.fn()
      },
      writable: true
    });
  }
}

// Manually add the spyObj to global namespace to be compatible with existing tests
(global as any).jasmine = {
  createSpyObj
}; 