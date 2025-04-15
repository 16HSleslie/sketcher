# Admin Tests Review & Troubleshooting

## Current Issues

The admin panel tests are failing when running `npm test:admin` with the following primary issues:

1. **Jasmine to Jest Compatibility**: The tests were written using Jasmine syntax (`jasmine.createSpyObj`, `.and.returnValue()`) but are running in Jest.
2. **Angular Component Resolution**: Error "Component is not resolved" when loading templates in component tests.
3. **esbuild Compatibility**: Error "Buffer.from("") instanceof Uint8Array is incorrectly false" related to esbuild.
4. **HTML Template Errors**: Multiple "Unexpected token" errors in the products component HTML template.

## Steps Taken So Far

1. **Added Jasmine Compatibility Layer**:
   - Added basic implementation of `jasmine.createSpyObj()` to `setup-angular-tests.ts`
   - Still missing implementation of `.and.returnValue()` syntax

2. **Updated Jest Configuration**:
   - Modified `jest-angular.config.js` to use the recommended configuration for ts-jest
   - Updated transformIgnorePatterns to include Angular and rxjs packages

3. **Fixed Angular Setup**:
   - Removed problematic imports from `setup-angular-tests.ts`
   - Updated esbuild to latest version

## Next Steps

To make the admin tests pass, the following steps should be completed:

1. **Complete Jasmine Compatibility**:
   ```typescript
   // In setup-angular-tests.ts
   global.jasmine = {
     createSpyObj: (baseName: any, methodNames: any) => {
       const obj: any = {};
       if (Array.isArray(methodNames)) {
         for (const method of methodNames) {
           const spy = jest.fn();
           // Add the Jasmine 'and' property with returnValue function
           spy.and = {
             returnValue: (value: any) => {
               spy.mockReturnValue(value);
               return spy;
             },
             callFake: (fn: any) => {
               spy.mockImplementation(fn);
               return spy;
             }
           };
           obj[method] = spy;
         }
       }
       return obj;
     }
   } as any;
   ```

2. **Fix Component Template Resolution**:
   - Add component compilation configuration in Jest setup
   - Consider using `TestBed.overrideComponent` to provide inline templates for tests

3. **Resolve Specific Component Error**:
   ```typescript
   // In component spec files, add before creating a component:
   await TestBed.compileComponents();
   // And ensure all external templates are properly loaded
   ```

4. **HTML Template Syntax Errors**:
   - Fix syntax errors on lines 242, 254-256, and 264 in products.component.html
   - These are related to event binding syntax issues

## Recommended Solution Approach

1. First complete the Jasmine compatibility layer to handle spy objects correctly.
2. Fix template resolution by ensuring proper compilation in tests.
3. Address HTML template errors if they still exist after other fixes.
4. Run tests incrementally (one file at a time) to isolate and fix remaining issues.

## Resources

- [Jest-Preset-Angular Troubleshooting](https://thymikee.github.io/jest-preset-angular/docs/guides/troubleshooting/)
- [StackOverflow: Angular tests cannot find module](https://stackoverflow.com/questions/74496225/angular-14-upgrade-w-jest-28-and-nx-having-issues-with-jest-tests-cannot-find)

This document will be updated as additional issues are identified and resolved. 