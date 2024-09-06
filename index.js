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
      // avoid resolve being called more than once
      if (this.#state !== STATE.PENDING) return;

      // not to wrap value into a promise, if the value is a thenable / promise.
      if (value instanceof MyPromise || typeof value?.then === "function") {
        value.then(this.#boundResolve, this.#boundReject);

        return;
      }

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
      // avoid reject being called more than once
      if (this.#state !== STATE.PENDING) return;

      // not to wrap value into a promise, if the value is a thenable / promise.
      if (value instanceof MyPromise || typeof value?.then === "function") {
        value.then(this.#boundResolve, this.#boundReject);

        return;
      }

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

  catch(rejectCallback) {
    return this.then(undefined, rejectCallback);
  }

  finally(callback) {
    return this.then(
      (value) => {
        callback();

        return value;
      },
      (value) => {
        callback();

        throw value;
      }
    );
  }

  static resolve(value) {
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }

  static reject(value) {
    return new MyPromise((_resolve, reject) => {
      reject(value);
    });
  }

  static try(action) {
    return new MyPromise((resolve, reject) => {
      try {
        resolve(action());
      } catch (error) {
        reject(error);
      }
    });
  }

  static allSettled(promises) {
    const result = [];

    return new MyPromise((resolve) => {
      promises.forEach((promise, index) => {
        promise
          .then((value) => {
            result[index] = { status: STATE.FULFILLED, value };
          })
          .catch((value) => {
            result[index] = { status: STATE.REJECTED, reason: value };
          })
          .finally(() => {
            resolve(result);
          });
      });
    });
  }

  static all(promises) {
    let resolvedCount = 0;
    const result = [];

    return new MyPromise((resolve, reject) => {
      promises.forEach((promise, index) => {
        promise
          .then((value) => {
            result[index] = value;
            resolvedCount++;

            if (resolvedCount === promises.length) {
              resolve(result);
            }
          })
          .catch(reject);
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then(resolve).catch(reject);
      });
    });
  }

  static any(promises) {
    let rejectedCount = 0;
    const reasons = [];

    return new MyPromise((resolve, reject) => {
      promises.forEach((promise, index) => {
        promise.then(resolve).catch((value) => {
          reasons[index] = value;
          rejectedCount++;

          if (rejectedCount === promises.length) {
            reject(reasons);
          }
        });
      });
    });
  }
}

module.exports = MyPromise;
