// Mock the global window object
global.window = {
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
};

// Mock document
global.document = {
  querySelector: jest.fn()
};

// Mock console methods
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Required for Angular testing
Object.defineProperty(global, 'MutationObserver', {
  value: class {
    constructor(callback) {}
    disconnect() {}
    observe(element, initObject) {}
  }
});

// Mock Angular's TestBed
jest.mock('@angular/core/testing', () => ({
  TestBed: {
    configureTestingModule: jest.fn(() => ({
      compileComponents: jest.fn().mockResolvedValue(undefined)
    })),
    inject: jest.fn(),
    createComponent: jest.fn(),
    get: jest.fn(),
    runInInjectionContext: jest.fn((fn) => fn())
  }
}));

// Mock Angular's HTTP testing module
jest.mock('@angular/common/http/testing', () => ({
  HttpClientTestingModule: {},
  HttpTestingController: {
    match: jest.fn(),
    expectOne: jest.fn(),
    verify: jest.fn()
  }
}));

// Mock Angular's HTTP client
jest.mock('@angular/common/http', () => ({
  HttpClient: {
    post: jest.fn(),
    get: jest.fn()
  }
}));

// Mock Angular Router
jest.mock('@angular/router', () => ({
  Router: {
    navigate: jest.fn()
  }
}));

// Mock Angular Forms
jest.mock('@angular/forms', () => ({
  FormBuilder: {
    group: jest.fn()
  },
  ReactiveFormsModule: {}
})); 