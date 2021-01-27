"use strict";
class Storage {
  constructor(params = {}) {
    const {
      key,
      st = null,
      expire = null,
      onChange = () => {},
      onFetch = async () => {},
    } = params;

    if (!key && st) {
      throw new Error("Key undefined.");
    }

    this.__st = st;
    this.__key = key;
    this.__expire = expire;
    this.onChange = onChange;
    this.onFetch = onFetch;

    this.__data = null;
    this.__expireAt = null;

    this.listenerChangeStorage();
  }

  get data() {
    if (this.__expireAt && Date.now() > this.__expireAt) {
      this.clear();
    }

    return this.__st ? JSON.parse(this.__st.getItem(this.__key)) : this.__data;
  }
  set data(el) {
    try {
      if (!Array.isArray(el)) {
        throw new Error("Unsupported data type, we recommend using array.");
      }

      if (this.__expire) {
        this.__expireAt = Date.now() + this.__expire;
      }

      if (this.__st) {
        this.__st.setItem(this.__key, JSON.stringify(el));
      } else {
        this.__data = el;
      }

      this.onChange(this);
    } catch (error) {
      console.error(error);
    }
  }

  count() {
    return this.data.length;
  }

  clear() {
    this.data = [];

    return this;
  }

  push(...params) {
    this.data = [].concat(this.data, params);

    return this;
  }

  remove(ind) {
    try {
      const aux = [...this.data];
      aux.splice(parseInt(ind), 1);
      this.data = aux;

      return this;
    } catch (error) {
      console.error(error);
    }
  }

  find(fn = (v) => v) {
    return this.data.find(fn) || {};
  }

  map(fn = (v) => v, { save }) {
    const arrMap = this.data.map(fn);
    if (save) this.data = arrMap;

    return arrMap;
  }

  filter(fn = (v) => v, { save }) {
    const arrFilter = this.data.filter(fn);
    if (save) this.data = arrFilter;

    return arrFilter;
  }

  sort(fn = () => {}, { save }) {
    const arrSort = this.data.sort(fn);
    if (save) this.data = arrSort;

    return arrSort;
  }

  listenerChangeStorage() {
    if (this.__st === localStorage) {
      window.addEventListener("storage", (ev) => {
        if (ev.key === this.__key) this.onChange(this);
      });
    }
  }

  async fetch() {
    try {
      const ret = await this.onFetch();
      return (this.data = ret);
    } catch (error) {
      console.error(error);
    }
  }
}
