const STATE = {
    PENDING: 'pending',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected',
}

class MyPromise {
    #state = STATE.PENDING;
    #value;
    #resolveCallbacks = [];
    #rejectCallbacks = [];

  constructor(callback) {
    try {
      callback(this.#resolve, this.#reject);
    } catch (error) {
      this.#reject(error);
    }
  }

  #resolve(value) {
    this.#value = value;
    this.#state = STATE.FULFILLED;
    this.#resolveCallbacks.forEach((callback) => callback(this.#value));
  }

  #reject(value) {
    this.#value = value;
    this.#state = STATE.REJECTED;
    this.#rejectCallbacks.forEach((callback) => callback(this.#value));
  }

  then(resolveCallback, rejectCallback) {
    this.#resolveCallbacks.push((value) => resolveCallback(value));
    this.#rejectCallbacks.push((value) => rejectCallback(value));
  }
}

module.exports = MyPromise;