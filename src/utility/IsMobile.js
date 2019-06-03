export const Android = function () {
  return (navigator.userAgent.match(/Android/i) && navigator.userAgent.match(/Mobile/i))
}

export const BlackBerry = function () {
  return navigator.userAgent.match(/BlackBerry/i)
}

export const iOS = function () {
  return navigator.userAgent.match(/iPhone|iPod/i)
}

export const Opera = function () {
  return navigator.userAgent.match(/Opera Mini/i)
}

export const Windows = function () {
  return navigator.userAgent.match(/IEMobile/i)
}

export const any = function () {
  return (Android() || BlackBerry() || iOS() || Opera() || Windows())
}
