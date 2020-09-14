var Util = new (function () {
  this.Browser = new (function () {
    this.queryParamStringToObject = function (url) {
      var result = {};
      var pair = [];
      var params = (url || window.location.href).split("?")[1];

      if (params) {
        params = params.split("&");

        for (var i = 0; i < params.length; i++) {
          pair = params[i].split("=");
          if (pair[0]) {
            result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
          }
        }
      }

      return result;
    };

    this.objectToQueryParamString = function (params) {
      if (!params) return "";
      var keys = Object.keys(params);
      var result = [];
      for (var i = 0; i < keys.length; i++) {
        result.push(
          encodeURIComponent(keys[i]) +
            "=" +
            encodeURIComponent(params[keys[i]])
        );
      }
      return "?" + result.join("&");
    };

    this.getCookieByName = function (cookieName) {
      var name = cookieName + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
      }
      return;
    };
  })();

  this.Objects = new (function () {
    this.hasKeys = function (obj, expectedKeys, allowEmpty) {
      for (var i = 0; i < expectedKeys.length; i++) {
        var key = expectedKeys[i];
        if (!obj.hasOwnProperty(key)) {
          return false;
        }
        if (!allowEmpty && (obj[key] === "" || obj[key] === undefined)) {
          return false;
        }
      }
      return true;
    };
  })();
})();

window.Util = Util;
