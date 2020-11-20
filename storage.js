"use strict";
class Storage {
  constructor(params = {}) {
    const {
      st = localStorage,
      key,
      onChange = () => {},
      onFetch = async () => {},
    } = params;

    if (!key) {
      throw new Error("key undefined");
    }

    this.__st = st;
    this.__key = key;
    this.onChange = onChange;
    this.onFetch = onFetch;

    this.listenerChangeStorage();
  }

  get data() {
    return JSON.parse(this.__st.getItem(this.__key));
  }
  set data(el) {
    try {
      this.__st.setItem(this.__key, JSON.stringify(el));
      this.onChange(this);
    } catch (error) {
      console.error(error);
    }
  }

  count() {
    return [].concat(this.data).length;
  }

  clear() {
    try {
      this.__st.removeItem(this.__key);
      this.onChange(this);
      return this;
    } catch (error) {
      console.error(error);
    }
  }

  push(...params) {
    try {
      this.data = [].concat(this.data || [], params);
      return this;
    } catch (error) {
      console.error(error);
    }
  }

  remove(ind) {
    try {
      let _arr = this.data;
      _arr.splice(parseInt(ind), 1);
      this.data = _arr;

      return this;
    } catch (error) {
      console.error(error);
    }
  }

  map(fn) {
    try {
      return (this.data = this.data.map(fn));
    } catch (error) {
      console.error(error);
    }
  }

  find(fn = (v) => v) {
    try {
      if (!Array.isArray(this.data)) return this.data;
      return this.data.find(fn);
    } catch (error) {
      console.error(error);
    }
  }

  filter(fn = (v) => v) {
    try {
      if (!Array.isArray(this.data)) return this.data;
      return this.data.filter(fn);
    } catch (error) {
      console.error(error);
    }
  }

  sort(fn = () => {}) {
    try {
      if (!Array.isArray(this.data)) return this.data;
      return (this.data = this.data.sort(fn));
    } catch (error) {
      console.error(error);
    }
  }

  listenerChangeStorage() {
    if (this.__st === localStorage)
      window.addEventListener("storage", (ev) => {
        if (ev.key === this.__key) this.onChange(this);
      });
  }

  async fetch() {
    try {
      return (this.data = await this.onFetch());
    } catch (error) {
      console.error(error);
    }
  }
}
