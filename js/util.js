var hasKeys = function(obj, expectedKeys, allowEmpty) {
  for (var i=0; i<expectedKeys.length; i++) {
    var key = expectedKeys[i];
    if (!obj.hasOwnProperty(key)) {
        return false;
      }
    if (!allowEmpty && (obj[key] === "" || obj[key] === undefined)) {
      return false;
    }
  }
  return true;
}

var getUrlParamObject = function(url) {
  var result = {};
  var pair = [];
  var params = url.split("?")[1];

  if (params != undefined) {
    params = params.split("&");

    for (var i = 0; i < params.length; i++) {
      pair = params[i].split("=");
      if (pair[0]) {
        result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }
  }

  return result;
}

var getQueryStringFromObject =function(params) {
  return Object.keys(params)
    .map((key) => {
      return encodeURIComponent(key) 
        + "=" 
        + encodeURIComponent(params[key]);
    })
    .join("&");
}

var getCookie = function(cookieName) {
  var name = cookieName + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}