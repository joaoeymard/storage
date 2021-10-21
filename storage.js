(function (win) {
  "use strict";

  /*------------------------------------------------------------------------*/

  const messageError = {
    invalid_storage:
      "Falha ao executar: O parametro 'storage' informado não é do tipo 'localStorage' ou 'sessionStorage'",
    invalid_key: "Chave de armazenamento ausente ou inválida",
    invalid_data:
      "Falha ao executar: O parametro informado não é do tipo 'Object' ou 'Array'",
    invalid_type_event:
      "Falha ao executar: O parametro 'type' informado não é do tipo 'String'",
    invalid_function_event:
      "Falha ao executar: O parametro 'listener' informado não é do tipo 'Function'",
  };

  const isArray = (param) =>
    Object.prototype.toString.call(param) === "[object Array]";

  const isObject = (param) =>
    Object.prototype.toString.call(param) === "[object Object]";

  const isStorage = (param) =>
    Object.prototype.toString.call(param) === "[object Storage]";

  const isNumber = (param) =>
    Object.prototype.toString.call(param) === "[object Number]";

  const isString = (param) =>
    Object.prototype.toString.call(param) === "[object String]";

  const isBoolean = (param) =>
    Object.prototype.toString.call(param) === "[object Boolean]";

  const isFunction = (param) =>
    Object.prototype.toString.call(param) === "[object Function]" ||
    Object.prototype.toString.call(param) === "[object AsyncFunction]";

  const isNull = (param) =>
    Object.prototype.toString.call(param) === "[object Null]" ||
    Object.prototype.toString.call(param) === "[object Undefined]";

  const isEmpty = (param) =>
    Object.prototype.toString.call(param) === "[object String]" && param === "";

  const jsonParse = JSON.parse;

  const jsonStringify = JSON.stringify;

  function emitEvent(eventList, type, ...content) {
    eventList
      .filter((e) => e.type === type)
      .forEach(function (e) {
        e.listener(...content);
      });
  }

  /*------------------------------------------------------------------------*/

  /**
   * Construtor
   *
   * @param {Storage} param.storage
   * @param {String} param.key
   * @param {Number} param.expire
   */
  function Storage({ storage = localStorage, key, expire }) {
    if (!isStorage(storage)) throw new TypeError(messageError.invalid_storage);

    if (!isString(key) || isNull(key))
      throw new Error(messageError.invalid_key);

    this.setExpire(expire);

    this._storage = storage;
    this._key = key;
    this._events = [];
  }

  Storage.prototype.getData = function () {
    if (!isNull(this._expireAt) && this._expireAt < Date.now()) {
      this.clear();
    }

    return this._storage.getItem(this._key);
  };

  /**
   * Retorna o objeto armazenado já convertido em json
   *
   * @returns {Object|Array}
   */
  Storage.prototype.getDataParsed = function () {
    let strData = this.getData();
    if (isNull(strData) || isEmpty(strData)) strData = "[]";

    return jsonParse(strData);
  };

  /**
   * Retorna os dados armazenados obrigatoriamente como array
   *
   * @returns {Array}
   */
  Storage.prototype.getDataArray = function () {
    let data = this.getDataParsed();

    if (!isArray(data)) return Array(data);
    return data;
  };

  /**
   * Responsável por armazenar as informações
   *
   * @param {Object|Array} data
   * @returns {Object} Retorna a instancia de Storage
   */
  Storage.prototype.setData = function (data) {
    if (!isObject(data) && !isArray(data))
      throw new Error(messageError.invalid_data);

    this._storage.setItem(this._key, jsonStringify(data));
    emitEvent(this._events, "updated", this.getDataParsed(), this);

    return this;
  };

  /**
   * Atualiza o tempo para expirar os dados armazenados
   *
   * @param {Number} expire
   */
  Storage.prototype.setExpire = function (expire) {
    if (isNumber(expire) && !isNull(expire))
      this._expireAt = Date.now() + expire;
  };

  /**
   * Retorna a quantidade de elementos salvos
   *
   * @returns {Number}
   */
  Storage.prototype.count = function () {
    const strData = this.getData();

    if (isEmpty(strData) || isNull(strData)) return 0;

    const data = jsonParse(strData);

    if (isObject(data)) return 1;
    if (isArray(data)) return data.length;
  };

  /**
   * Remove o item de armazenamento
   *
   * @returns {Object} Retorna a instancia de Storage
   */
  Storage.prototype.clear = function () {
    this._storage.removeItem(this._key);
    emitEvent(this._events, "reset", null, this);

    return this;
  };

  /**
   * Adiciona um novo elemento na lista armazenada
   *
   * @param {*} param Parametros a serem adicionados
   * @returns {Object} Retorna a instancia de Storage
   */
  Storage.prototype.insert = function () {
    if (isNull(arguments)) return this;

    this.setData(Array.prototype.concat.apply(this.getDataParsed(), arguments));
    return this;
  };

  /**
   * Localiza e atualiza um registro do armazenamento
   *
   * @param {Function} fn Identifica um elemento
   * @param {*} item Item que atualizará o registro da lista
   * @returns {Object} Retorna a instancia de Storage
   */
  Storage.prototype.findOneAndUpdate = function (fn, item) {
    const data = this.getDataArray();
    const oldItem = data.find(fn);

    if (isNull(oldItem)) return this;

    Object.assign(oldItem, item);
    this.setData(data);
    return this;
  };

  /**
   * Localiza e substitue um registro do armazenamento
   *
   * @param {Function} fn Identifica um elemento
   * @param {*} item Item que atualizará o registro da lista
   * @returns {Object} Retorna a instancia de Storage
   */
  Storage.prototype.findOneAndReplace = function (fn, item) {
    const data = this.getDataArray();
    const idx = data.findIndex(fn);

    if (idx < 0) return this;

    data.splice(idx, 1, item);
    this.setData(data);
    return this;
  };

  /**
   * Localiza e remove um registro do armazenamento
   *
   * @param {Function} fn Identifica um elemento
   * @returns {Object} Retorna a instancia de Storage
   */
  Storage.prototype.findOneAndRemove = function (fn) {
    const idx = this.findIndex(fn);

    return this.removeByIndex(idx);
  };

  /**
   * Remove um item armazenado pelo index do item na lista
   *
   * @param {Number} idx
   * @returns {Object} Retorna a instancia de Storage
   */
  Storage.prototype.removeByIndex = function (idx) {
    if (idx < 0) return this;

    this.setData(this.filter((_, i) => i !== idx));
    return this;
  };

  /**
   * Submete funções de escuta para ações
   * Tipos de ações válidos: ['updated', 'reset']
   *
   * @param {String} type
   * @param {Function} listener
   */
  Storage.prototype.addEventListener = function (type, listener) {
    if (isNull(type) || isEmpty(type))
      throw new TypeError(messageError.invalid_type_event);

    if (!isFunction(listener))
      throw new TypeError(messageError.invalid_function_event);

    this._events.push({
      type: type,
      listener: listener,
    });
  };

  /**
   * Remove as funções de escuta que foram submetidas
   *
   * @param {String} type
   * @param {Function} listener
   */
  Storage.prototype.removeEventListener = function (type, listener) {
    if (isNull(type) || isEmpty(type))
      throw new TypeError(messageError.invalid_type_event);

    if (!isFunction(listener))
      throw new TypeError(messageError.invalid_function_event);

    this._events = this._events.filter(
      (e) => !(e.type === type && e.listener === listener)
    );
  };

  /*------------------------------------------------------------------------*/

  Storage.prototype.forEach = function () {
    return Array.prototype.forEach.apply(this.getDataArray(), arguments);
  };

  Storage.prototype.filter = function () {
    return Array.prototype.filter.apply(this.getDataArray(), arguments);
  };

  Storage.prototype.find = function () {
    return Array.prototype.find.apply(this.getDataArray(), arguments);
  };

  Storage.prototype.findIndex = function () {
    return Array.prototype.findIndex.apply(this.getDataArray(), arguments);
  };

  Storage.prototype.map = function () {
    return Array.prototype.map.apply(this.getDataArray(), arguments);
  };

  Storage.prototype.sort = function () {
    return Array.prototype.sort.apply(this.getDataArray(), arguments);
  };

  Storage.prototype.reduce = function () {
    return Array.prototype.reduce.apply(this.getDataArray(), arguments);
  };

  /*------------------------------------------------------------------------*/

  win.Storage = Storage;
})(window);
