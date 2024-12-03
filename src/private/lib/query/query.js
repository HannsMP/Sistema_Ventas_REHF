/**
 * @typedef {string | URL | globalThis.Request} Response
 * @typedef {(input: Response, option: RequestInit)=> Promise<Response>} queryFun
 * @typedef {(input: Response)=> Promise<Response>} methodFun
 * @typedef {(input: Response, data: FormData)=> Promise<Response>} FormFun
 * @typedef {(input: Response, data: JSON)=> Promise<Response>} JsonFun
 *
 * @type {queryFun & {
 *   get: methodFun & {
 *     form: FormFun & { cookie: FormFun },
 *     json: JsonFun & { cookie: JsonFun },
 *     cookie: methodFun
 *   },
 *   post: methodFun & {
 *     form: FormFun & { cookie: FormFun },
 *     json: JsonFun & { cookie: JsonFun },
 *     cookie: methodFun
 *   },
 * }}
 */

let query = async (url, option) => fetch(url, option);

/*
  ========================= GET POST =========================
*/

query.get = (url) => query(url, {
  method: "GET"
})

query.post = (url) => query(url, {
  method: "POST"
})

/*
  ========================= FORM  JSON =========================
*/

query.get.form = (url, formData) => query(url, {
  method: "GET",
  body: formData
})

query.post.form = (url, formData) => query(url, {
  method: "POST",
  body: formData
})

query.get.json = (url, data) => query(url, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})


query.post.json = (url, data) => query(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})

/*
========================= COOKIE =========================
*/

query.get.cookie = (url) => query(url, {
  method: "GET",
  credentials: 'include'
})

query.post.cookie = (url) => query(url, {
  method: "POST",
  credentials: 'include'
})

query.get.form.cookie = (url, formData) => query(url, {
  method: "GET",
  credentials: 'include',
  body: formData
})

query.post.form.cookie = (url, formData) => query(url, {
  method: "POST",
  credentials: 'include',
  body: formData
})

query.get.json.cookie = (url, data) => query(url, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
  credentials: 'include',
  body: JSON.stringify(data)
})

query.post.json.cookie = (url, data) => query(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: 'include',
  body: JSON.stringify(data)
})