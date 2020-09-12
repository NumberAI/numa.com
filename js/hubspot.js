var hubspotConfig = {
  portalId: "3283010",
  formSubmissions: {},
};

function getFormSubmissionValues(formId) {
  return hubspotConfig.formSubmissions[formId];
}

function setFormSubmissionValues(formId, values) {
  hubspotConfig.formSubmissions[formId] = values;
}

function sanitizeHubspotFields(fields, dropEmpty) {
  var result = {};
  var removeList = ["hs_context"];

  var keys = Object.keys(fields);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = fields[key];

    if (removeList.indexOf(key) < 0) {
      var isEmpty = value === "" || value === undefined;
      if (!dropEmpty || !isEmpty) result[key] = value;
    }
  }

  return result;
}

function getObjectFromFormValues($form) {
  var values = {};
  var fields = $form.serializeArray();
  fields.forEach(function (each) {
    values[each.name] = each.value;
  });
  return values;
}

var formCookies = [
  { name: "reseller_id", field: "reseller_id" },
  { name: "_fprom_code", field: "promoter_code" },
  { name: "_fprom_track", field: "promoter_tid" },
  { name: "utm_campaign", field: "last_utm_campaign" },
  { name: "utm_source", field: "last_utm_source" },
  { name: "utm_medium", field: "last_utm_medium" },
  { name: "utm_content", field: "last_utm_content" },
  { name: "utm_term", field: "last_utm_term" },
  { name: "utm_term", field: "last_utm_term" },
  { name: "fb_click_id", field: "fb_click_id" },
  { name: "google_click_id", field: "google_click_id" },
];

function getFormValuesFromCookies($form) {
  for (var i = 0; i < formCookies.length; i++) {
    var cookieVal = getCookie(formCookies[i].name);
    if (cookieVal)
      $form
        .find('input[name="' + formCookies[i].field + '"]')
        .val(cookieVal)
        .change();
  }
}

function getFormValuesFromUrl($form) {
  var params = getUrlParamObject(window.location.href);
  return getFormValuesFromParams(params);
}

function getFormValuesFromParams($form, params) {
  if (params) {
    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
      var val = params[keys[i]];
      if (val) {
        $form
          .find('input[name="' + keys[i] + '"]')
          .val(val)
          .change();
      }
    }
  }
}

function setupForm(options) {
  if (!options || !options.formId) return;

  var config = {
    portalId: hubspotConfig.portalId,
    formId: options.formId,
  };

  if (options.target) config.target = options.target;

  if (options.redirectUrl) config.redirectUrl = options.redirectUrl;

  config.onBeforeFormInit = function (ctx) {
    if (options.prequired && options.prequired.fields) {
      var success = true;
      var params = getUrlParamObject(window.location.search);
      $.extend(params, options.fields);

      if (!hasKeys(params, options.prequired.fields || []))
        if (options.prequired.failPath) {
          var q = "";
          if (params) q = "?" + getQueryStringFromObject(params);
          window.location.href = options.prequired.failPath + q;
        }
    }

    if (options.onBeforeFormInit) options.onBeforeFormInit(ctx);
  };

  config.onFormReady = function ($form) {
    if (dataLayer) {
      var event = {
        event: "hubspot-form-load",
        formId: options.formId,
      };

      if (options.formName) event["formLabel"] = options.formName;

      if (options.formCategory) event["formCategory"] = options.formCategory;

      if (options.formAction) event["formAction"] = options.formAction;

      if (options.analytics) {
        if (options.analytics.facebook)
          event["fbq"] = options.analytics.facebook;
        if (options.analytics.adwords)
          event["adwords"] = options.analytics.adwords;
      }

      dataLayer.push(event);
    }

    getFormValuesFromCookies($form);
    getFormValuesFromUrl($form);
    if (options.fields) getFormValuesFromParams($form, options.fields);

    if (options.onFormReady) options.onFormReady($form);
  };

  config.onFormSubmit = function ($form) {
    if (dataLayer) {
      var event = {
        event: "hubspot-form-submit",
        formId: options.formId,
      };

      if (options.formName) event["formLabel"] = options.formName;

      if (options.formCategory) event["formCategory"] = options.formCategory;

      if (options.formAction) event["formAction"] = options.formAction;

      if (options.analytics) {
        if (options.analytics.facebook)
          event["fbq"] = options.analytics.facebook;
        if (options.analytics.adwords)
          event["adwords"] = options.analytics.adwords;
      }
      dataLayer.push(event);
    }

    setFormSubmissionValues(options.formId, getObjectFromFormValues($form));

    if (options.onFormSubmit) options.onFormSubmit($form);
  };

  config.onFormSubmitted = function () {
    var values = getFormSubmissionValues(options.formId);
    var params = getUrlParamObject(window.location.search);

    if (options.onFormSubmitted) options.onFormSubmitted(values, params);

    var redirectUrl;
    if (options.redirect || options.next) {
      // Get URL params
      var params = getUrlParamObject(window.location.search);
      params = sanitizeHubspotFields(params, true);

      // Get form values
      var fields = getFormSubmissionValues(options.formId);
      fields = sanitizeHubspotFields(fields, true);

      // Merge two, create query string
      $.extend(params, fields);
      var q = getQueryStringFromObject(params);

      // Redirect
      var url = options.next || options.redirect;
      redirectUrl = url + "?" + q;
      window.location.href = redirectUrl;
    }
  };
  hbspt.forms.create(config);
}
