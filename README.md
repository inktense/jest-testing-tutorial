# jest-testing-tutorial
Unit testing with NodeJs, Typescript, Jest and React.

## Useful information

- `expect().toBe()` is used for primitives and `expect().toEqual()` for objects.
- To ignore some functions that are trivial but still rceive full test coverage use `istanbul`.
  
```javascript
/* Istanbul ignore next */
function toUpperCase() => {
    ...
}
 ```

  Using mocks is one way to not use a real warehouse in the test, but there are other forms of unreal objects used in testing like this.

Stubs provide canned answers to calls made during the test, usually not responding at all to anything outside what's programmed in for the test.
Spies are stubs that also record some information based on how they were called. One form of this might be an email service that records how many messages it was sent.
Mocks are what we are talking about here: objects pre-programmed with expectations which form a specification of the calls they are expected to receive. 

Of these kinds of doubles, only mocks insist upon behavior verification. The other doubles can, and usually do, use state verification. 