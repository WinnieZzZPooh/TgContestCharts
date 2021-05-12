export class Events {
  constructor() {
    this._callbacks = {};
  }

  /**
   * @param {string} eventName
   * @param {Function} callback
   * @param {Object?} context
   */
  subscribe(eventName, callback, context) {
    if (!this._callbacks[eventName])
      this._callbacks[eventName] = [];

    this._callbacks[eventName].push(callback.bind(context));
  }

  /**
   * @param {string} eventName
   * @param [data]
   */
  next(eventName, data) {
    const callbacks = this._callbacks && this._callbacks[eventName];

    if (callbacks)
      for (let i = 0; i < callbacks.length; i++)
        callbacks[i](data);
  }
}
