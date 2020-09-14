var jQuery = window.jQuery;
var Util = window.Util;
var hbspt = window.hbspt;

(function ($) {
  var HUBSPOT = window.HUBSPOT || {
    portalId: "3283010",
    submissions: {}
  };

  // Public

  $.fn.hubspotForm = function (options) {
    if (!options.formId || !options.name)
      throw new ReferenceError("Hubspot form not properly configured");

    var defaults = {
      portalId: HUBSPOT.portalId,
      name: undefined,
      formId: undefined,
      formType: undefined,
      target: undefined,
      prequiredFields: [],
      prequiredFailPath: undefined,
      redirectUrl: undefined,
      removeHubspotContext: true,
      withQueryParams: true
    };
    var settings = $.extend(defaults, options);
    var form = settings;
    $(settings.target).addClass("hs-form-embed");
    var targetSel = settings.target + ".hs-form-embed";

    form.onBeforeFormInit = function (ctx) {
      if (settings.prequiredFields.length) {
        var success = true;
        var params = Util.Browser.queryParamStringToObject();

        success = Util.Objects.hasKeys(params, settings.prequiredFields);
        if (!success && settings.prequiredFailPath) {
          var q = Util.Browser.objectToQueryParamString(params);
          window.location.href = settings.prequiredFailPath + q;
          return;
        }
      }

      if (options.onBeforeFormInit) options.onBeforeFormInit(ctx);
    };

    form.onFormReady = function ($form) {
      $(targetSel).trigger("analytics.formload", settings);

      $form._hsforms_transferCookies();
      $form._hsforms_transferQueryParams();
      $form._hsforms_transferFields(settings.fields);

      if (options.onFormReady) options.onFormReady($form);
    };

    form.onFormSubmit = function ($form) {
      _hsforms_setSubmittedValues(settings.formId, $form);

      if (options.onFormSubmit) options.onFormSubmit($form);
    };

    form.onFormSubmitted = function () {
      $(targetSel).trigger("analytics.formsubmitted", settings);

      if (options.onFormSubmitted) options.onFormSubmitted();

      if (settings.redirectUrl) {
        var url = settings.redirectUrl;

        if (settings.withQueryParams) {
          var queryParams = Util.Browser.queryParamStringToObject();
          var formValues = _hsforms_getSubmittedValues(settings.formId);
          var params = $.extend(queryParams, formValues);
          if (settings.removeHubspotContext)
            params = removeHubspotContextFields({
              fields: params,
              dropEmpty: true
            });
          url = url + "?" + Util.Browser.objectToQueryParamString(params);
        }
        window.location.href = url;
      }
    };

    hbspt.forms.create(form);
  };

  // Private

  function removeHubspotContextFields(options) {
    var defaults = {
      fields: [],
      dropEmpty: true
    };
    var settings = $.extend({}, defaults, options);

    var result = {};
    var removeList = ["hs_context"];

    var keys = Object.keys(settings.fields);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = settings.fields[key];

      if (removeList.indexOf(key) < 0) {
        var isEmpty = value === "" || value === undefined;
        if (!settings.dropEmpty || !isEmpty) result[key] = value;
      }
    }

    return result;
  }

  function _hsforms_getSubmittedValues(formId) {
    return HUBSPOT.submissions[formId];
  }

  function _hsforms_setSubmittedValues(formId, $form) {
    var values = {};
    var fields = $form.serializeArray();
    fields.forEach(function (each) {
      values[each.name] = each.value;
    });
    HUBSPOT.submissions[formId] = values;
  }

  var _HSFORM_COOKIES = [
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
    { name: "google_click_id", field: "google_click_id" }
  ];

  $.fn._hsforms_transferCookies = function () {
    for (var i = 0; i < _HSFORM_COOKIES.length; i++) {
      var cookieVal = Util.Browser.getCookieByName(_HSFORM_COOKIES[i].name);
      if (cookieVal)
        $(this)
          .find('input[name="' + _HSFORM_COOKIES[i].field + '"]')
          .val(cookieVal)
          .change();
    }
  };

  $.fn._hsforms_transferQueryParams = function () {
    $(this)._hsforms_transferFields(Util.Browser.queryParamStringToObject());
  };

  $.fn._hsforms_transferFields = function (fields) {
    if (fields) {
      var keys = Object.keys(fields);
      for (var i = 0; i < fields.length; i++) {
        var val = fields[keys[i]];
        if (val) {
          $(this)
            .find('input[name="' + fields[i] + '"]')
            .val(val)
            .change();
        }
      }
    }
  };
})(jQuery);
