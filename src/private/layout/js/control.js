document.addEventListener('DOMContentLoaded', () => {


  let profileImg = document.querySelector('.sidebar #profile img');

  document.body.classList.remove("load-spinner");

  let container = document.querySelector('.container');
  let togglebar = document.querySelector('.togglebar');
  let dataBody = document.querySelector('.data-body');
  let navTheme = document.querySelector('.nav-theme');

  /* abre el sidebar, funcional para portrair */
  togglebar.addEventListener('click', ev => {
    ev.stopPropagation();
    container.classList.toggle('hide');
  });

  /* cierra si no hay click en sidebar */
  document.addEventListener('click', ev => {
    if (container.classList.contains('hide') && !ev.target.closest('.sidebar'))
      container.classList.remove('hide');
  })

  navTheme.addEventListener('click', async ev => {
    let themeOp = ev.target;
    if (!themeOp.classList.contains('theme-op')) return;
    let themeBefore = document.documentElement.getAttribute('theme');
    let { theme } = themeOp.dataset;
    document.documentElement.setAttribute('theme', theme);

    let resChangeTheme = await query.post.json.cookie('/api/usuarios/config/changeTheme', { theme });
    let { err, theme: themeAfter } = await resChangeTheme.json();

    if (err) {
      document.documentElement.setAttribute('theme', themeBefore);
      return alarm.warn('No se pudo cambiar el tema');
    }

    document.documentElement.setAttribute('theme', themeAfter);
  })

  /* 
    ==================================================
    ==================== NAV ITEMS ====================
    ==================================================
  */

  /** @type {Map<string, HTMLDivElement>} */
  let navItemMap = new Map;

  document.querySelectorAll('.nav-item').forEach(d => {
    let href = d.href ? d.getAttribute('href') : d.querySelector('.nav-link')?.getAttribute('href');
    if (href) navItemMap.set(href, d);
  })

  let navItemCurrent = new URL(window.location.href).pathname;

  navItemMap.get(navItemCurrent)?.classList?.add('active');

  /* 
    ==================================================
    ===================== SOCKET =====================
    ==================================================
  */

  socket.on('/session/usuario/logout', _ => window.location.href = '/auth/login');
  socket.on('/session/usuario/reload', _ => window.location.reload());
  socket.on('/session/usuario/theme', theme => document.documentElement.setAttribute('theme', theme));
  socket.on('/session/usuario/avatar', data => profileImg.src = data.src_small);
  socket.on('/session/acceso/updateId', data => {
    let navItem = navItemMap.get(data.menu_ruta);

    if (!data.permiso_ver)
      navItem.style.display = 'none';
    else
      navItem.style.display = '';
  })

  socket.on('/session/acceso/state', data => {
    if (permiso?.ver != data.permiso_ver) return window.location.reload();
  })

})

/*
  ================================================================================
  ================== optiomizacion de carga, mantiene en memoria ==================
  ================================================================================
*/

// let srcSet = new Set();
// /** @param {string} src  */
// function addSrc(src) {
//   if (src?.constructor.name != 'String' || !/(\.min)?\.js$/.test(src)) return;
//   srcSet.add(src);
//   srcSet.add(src.replace(/(\.min)?\.js$/, (match, p1) => p1 ? '.js' : '.min.js'));
// }

// document.querySelectorAll('.content-header script').forEach(s => {
//   addSrc(s.src)
//   document.head.append(s);
// })

// async function clickContainer(ev, change = true) {

//   let anchor = ev.target.closest('.nav-link, .content-header a');
//   if (!anchor) return
//   ev && ev.preventDefault();

//   document.body.classList.add("load-spinner");

//   let link = anchor.getAttribute('href');

//   let res = await query.post.cookie(link);

//   let text = await res.text();

//   let tempDiv = document.createElement('div');
//   tempDiv.innerHTML = text;

//   let script = tempDiv.querySelectorAll('script');

//   script.forEach(s => {
//     let newScript = document.createElement('script');
//     let afterSrc = s.src;

//     if (afterSrc) newScript.src = afterSrc;
//     else newScript.textContent = s.textContent;

//     if (!s.closest('.content-header'))
//       return dataBody.append(newScript);

//     if (srcSet.has(afterSrc)) return

//     addSrc(afterSrc);
//     document.head.append(newScript);
//   })

//   script.forEach(s => s.remove());
//   dataBody.innerHTML = tempDiv.innerHTML;

//   document.body.classList.remove("load-spinner");

//   if (change)
//     history.pushState({}, '', link);

//   alarm.reset();
// }

// container.addEventListener('click', clickContainer)

// window.addEventListener('popstate', e => {
//   e.stopPropagation();
//   let link = window.location.pathname;
//   window.chargePage(link, null, false);
// });