/** @type {{[status:number]: (res: Response)=>void}} */
let optionStatus = {
  308: async (res) => {
    let { link, time } = await res.json();
    setTimeout(() => window.location.href = link, time || 0)
  },
  401: async () => {
    alarm.error('Conflicto de autorizacion')
    setTimeout(() => window.location.reload(), 2000);
  },
  404: () => {
    alarm.error('pagina no encontrada')
    document.body.classList.remove("load-spinner");
  }
}

/** @type {(url: RequestInfo, option: RequestInit)=> Promise<Response>} */
let query = async (url, option) => {
  let response = await fetch(url, option);

  let execStatus = optionStatus[response.status];
  if (execStatus) return execStatus(response);

  return response;
}

/*
  ========================= GET POST =========================  
*/

/** @type {(url: RequestInfo)=> Promise<Response>} */
query.get = (url) => query(url, {
  method: "GET"
})

/** @type {(url: RequestInfo)=> Promise<Response>} */
query.post = (url) => query(url, {
  method: "POST"
})

/*
  ========================= FORM  JSON =========================  
*/

/** @type {(url: RequestInfo, formData: FormData)=> Promise<Response>} */
query.get.form = (url, formData) => query(url, {
  method: "GET",
  body: formData
})

/** @type {(url: RequestInfo, formData: FormData)=> Promise<Response>} */
query.post.form = (url, formData) => query(url, {
  method: "POST",
  body: formData
})

/** @type {(url: RequestInfo, json: JSON)=> Promise<Response>} */
query.get.json = (url, data) => query(url, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})


/** @type {(url: RequestInfo, json: JSON)=> Promise<Response>} */
query.post.json = (url, data) => query(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})

/*
========================= COOKIE =========================  
*/

/** @type {(url: RequestInfo, json: JSON)=> Promise<Response>} */
query.get.cookie = (url) => query(url, {
  method: "GET",
  credentials: 'include'
})

/** @type {(url: RequestInfo, json: JSON)=> Promise<Response>} */
query.post.cookie = (url) => query(url, {
  method: "POST",
  credentials: 'include'
})

/** @type {(url: RequestInfo, json: JSON)=> Promise<Response>} */
query.get.form.cookie = (url, formData) => query(url, {
  method: "GET",
  //headers: { 'Content-Type': 'multipart/form-data' },
  credentials: 'include',
  body: formData
})

/** @type {(url: RequestInfo, json: JSON)=> Promise<Response>} */
query.post.form.cookie = (url, formData) => query(url, {
  method: "POST",
  //headers: { 'Content-Type': 'multipart/form-data' },
  credentials: 'include',
  body: formData
})

/** @type {(url: RequestInfo, json: JSON)=> Promise<Response>} */
query.get.json.cookie = (url, data) => query(url, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
  credentials: 'include',
  body: JSON.stringify(data)
})

/** @type {(url: RequestInfo, json: JSON)=> Promise<Response>} */
query.post.json.cookie = (url, data) => query(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: 'include',
  body: JSON.stringify(data)
})