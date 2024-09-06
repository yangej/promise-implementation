const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

class MyPromise {
  #state = STATE.PENDING;
  #value;
  #resolveCallbacks = [];
  #rejectCallbacks = [];
  #boundResolve = this.#resolve.bind(this);
  #boundReject = this.#reject.bind(this);

  constructor(callback) {
    try {
      callback(this.#boundResolve, this.#boundReject);
    } catch (error) {
      this.#reject(error);
    }
  }

  #resolve(value) {
    // queue the task, execute after the sync method `then` is called
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      this.#value = value;
      this.#state = STATE.FULFILLED;
      this.#resolveCallbacks.forEach((callback) => {
        callback(this.#value);
      });
    });
  }

  #reject(value) {
    // queue the task, execute after the sync method `then` is called
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      this.#value = value;
      this.#state = STATE.REJECTED;
      this.#rejectCallbacks.forEach((callback) => callback(this.#value));
    });
  }

  then(resolveCallback, rejectCallback) {
    return new MyPromise((resolve, reject) => {
      this.#resolveCallbacks.push((value) => {
        if (resolveCallback == null) {
          resolve(value);

          return;
        }

        try {
          const result = resolveCallback(value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.#rejectCallbacks.push((value) => {
        if (rejectCallback == null) {
          reject(value);

          return;
        }

        try {
          const result = rejectCallback(value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

module.exports = MyPromise;
