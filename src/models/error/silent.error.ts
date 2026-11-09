// This error should be thrown when the caller intends to terminate the flow, but does not
// mean that the caller should perform the action and show the error to the user.
// Usually it means that the callee has already undertake the all required actions.
export class SilentError extends Error {
  // This error should be thrown when the caller intends to terminate the flow, but does not
  // mean that the caller should perform the action and show the error to the user.
  // Usually it means that the callee has already undertake the all required actions.
  constructor() {
    super('')
  }
}
