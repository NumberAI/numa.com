var jQuery = window.jQuery;

function getQueryParams() {
  return Util.Browser.queryParamStringToObject();
}

function getStoredParams() {
  var names = [];
  var result = {};
  for (var i = 0; i < names.length; i++) {
    result[names[i]] = Util.Browser.getCookieByName(names[i]);
  }
  return result;
}

function getParams() {
  var defaults = {
    brand: "numa",
    product_offering: "ESSENTIALS"
  };
  return jQuery.extend(defaults, getStoredParams(), getQueryParams());
}

function hasRequiredParams(params) {
  var required = ["email", "phone", "company", "product_offering"];
  var keys = Object.keys(params);
  for (var i = 0; i < required.length; i++) {
    if (keys.indexOf(required[i]) < 0) return false;
  }
  return true;
}

function accountSignup() {
  alert("foo");
  var params = getParams();
  var redirects = {
    success: "https://inbox.numahelps.com",
    failure: "/signup/start"
  };

  var url = hasRequiredParams(params)
    ? redirects.success + Util.Browser.objectToQueryParamString(params)
    : redirects.failure;

  console.log(url);
}
