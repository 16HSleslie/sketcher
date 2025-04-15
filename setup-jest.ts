import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// Set up Angular testing environment
setupZoneTestEnv();

// Mock browser objects only if in a browser-like environment
if (typeof window !== 'undefined') {
  // Mock global objects that might not exist in test environment
  Object.defineProperty(window, 'CSS', { value: null });
  Object.defineProperty(document, 'doctype', {
    value: '<!DOCTYPE html>'
  });
  Object.defineProperty(window, 'getComputedStyle', {
    value: () => {
      return {
        display: 'none',
        appearance: ['-webkit-appearance'],
        getPropertyValue: (prop: any) => {
          return '';
        }
      };
    }
  });
}

// Add Jasmine matchers compatibility for Jest
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTrue(): R;
      toBeFalse(): R;
    }
    
    // Allow for the extend method
    interface Expect {
      extend(matchers: Record<string, any>): void;
    }
  }
}

// Add custom matchers
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

// Make sure jasmine object is properly initialized
if (!(global as any).jasmine) {
  (global as any).jasmine = {};
}

// Ensure createSpyObj exists (will be overwritten by our more complete implementation in mock-helper.ts)
if (!(global as any).jasmine.createSpyObj) {
  (global as any).jasmine.createSpyObj = (name: string, methods: string[]) => {
    const obj: any = {};
    methods.forEach(method => {
      obj[method] = jest.fn().mockName(`${name}.${method}`);
      obj[method].and = {
        returnValue: (val: any) => obj[method].mockReturnValue(val),
        callFake: (fn: Function) => obj[method].mockImplementation(fn),
        throwError: (err: any) => obj[method].mockImplementation(() => { throw err; }),
      };
    });
    return obj;
  };
}

// No custom matchers needed - jest-preset-angular already provides snapshot testing 