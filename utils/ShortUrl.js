class ShortUrl {
  /** @param {{host:string, secret:string}} cnfg  */
  constructor(cnfg) {
    this.URL = new URL(cnfg.host);
    this.HOST = this.URL.host;
    this.TOKEN = cnfg.token;
  }

  async #fetchAPI(endpoint, body = {}) {
    body.TOKEN = this.TOKEN;
    this.URL.pathname = endpoint;
    const response = await fetch(this.URL.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json();
  }
  /** @param {string} urlShort @returns {string} */
  join(urlShort) {
    this.URL.pathname = urlShort;
    return this.URL.toString();
  }
  /** @param {string} url @returns {Promise<string>} */
  insert(url) {
    return new Promise((res, rej) => {
      this.#fetchAPI('/api/insert', { url })
        .then(data => {
          if (data.err)
            return rej(data.err);
          res(data.urlShort);
        })
        .catch(err => rej(err));
    });
  }
  /** @param {string} url @returns {Promise<string>} */
  read(url) {
    return new Promise((res, rej) => {
      this.#fetchAPI('/api/read', { url })
        .then(data => {
          if (data.err)
            return rej(data.err);
          res(data.urlShort);
        })
        .catch(err => rej(err));
    });
  }
  /** @param {string} urlShort @returns {Promise<string>} */
  update(url) {
    return new Promise((res, rej) => {
      this.#fetchAPI('/api/update', { url })
        .then(data => {
          if (data.err)
            return rej(data.err);
          res(data.urlShort);
        })
        .catch(err => rej(err));
    });
  }

  /** @param {string} urlShort @returns {Promise<string>} */
  delete(urlShort) {
    return new Promise((res, rej) => {
      this.#fetchAPI('/api/delete', { urlShort })
        .then(data => {
          if (data.err) rej(data.err);
          else res(data.msg);
        })
        .catch(err => rej(err));
    });
  }

  /** @returns {Promise<string>} */
  reset() {
    return new Promise((res, rej) => {
      this.#fetchAPI('/api/reset')
        .then(data => {
          if (data.err) rej(data.err);
          else res(data.msg);
        })
        .catch(err => rej(err));
    });
  }
}

module.exports = ShortUrl;