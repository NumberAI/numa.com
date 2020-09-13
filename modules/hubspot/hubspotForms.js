(function ($) {

  var HUBSPOT = HUBSPOT || {
    portalId: "3283010",
  };

  if (!hbspt) throw "Hubspot js not loaded";
  if (!Util) throw "Util script not loaded";
  
  // Public

  $.fn.hubspotForm = function(options) {
    if (!options.formId || !options.target || !options.name)
      throw "Hubspot form not properly configured";
    
    var defaults = {
      name: undefined;
      formId: undefined,
      target: undefined,
      redirectUrl: undefined,
      redirect: false,
      next: undefined,
      prequired: {
        fields: [],
        failPath: undefined,
      },
      portalId: HUBSPOT.portalId,
    };
    var form = {};
    var settings = $.extend({}, defaults, options, form);

    form.onBeforeFormInit = function (ctx) {
      if (settings.prequired.fields.length) {
        var success = true;
        var params = $.extend(
          Util.Browser.queryParamStringToObject(), 
          options.fields
        );

        success = Util.Objects.hasKeys(params, settings.prequired.fields);
        if (!success && settings.prequired.failPath) {
          var q = Util.Browser.objectToQueryParamString(params);
          window.location.href = settings.prequired.failPath + q;
          return;
        }
      }

      if (settings.onBeforeFormInit)
        settings.onBeforeFormInit(ctx);
    };
    form.onFormReady = function ($form) {[\
      Analytics && Analytics.track({
        object: "Form",
        action: "Viewed",
        label: settings.name || settings.id,
      });

      $form._hsforms_transferCookies();
      $form._hsforms_transferQueryParams();
      $form._hsforms_transferFields(settings.fields);

      if (settings.onFormReady)
        settings.onFormReady($form);

    };

    form.onFormSubmit = function ($form) {
      $form._hsforms_setSubmittedValues();

      if (settings.onFormSubmit)
        settings.onFormSubmit($form);
    };

    form.onFormSubmitted = function () {
      Analytics && Analytics.track({
        object: "Form",
        action: "Submit",
        label: settings.name || settings.id,
      });

      var values = $(this)._hsforms_getSubmittedValues();
      var params = Util.Browser.getUrlParamObject();

      if (settings.onFormSubmitted)
        settings.onFormSubmitted($form);
      
      if (!settings.redirect && !settings.next)
        return;
      
      var params = removeHubspotContextFields({ 
        fields: Util.Browser.getUrlParamObject(), 
        dropEmpty: true
      });
      var fields = removeHubspotContextFields({ 
        fields: $(this).getFormSubmissionValues(settings.formId), 
        dropEmpty: true
      });

      window.location.href = (settings.next || settings.redirect) 
        + "?" + Util.Browser.getQueryStringFromObject(
          $.extend(params, fields)
        );
    };

    hbspt.forms.create(form);
  };

  // Private

  function removeHubspotContextFields(options) {
    var defaults = {
      fields: [],
      dropEmpty: true,
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

  $.fn._hsforms_getSubmittedValues = function() {
    $form._hsforms_getObjectFromFormValues()
    return ($this).data("submittedValues");
  }

  $.fn._hsforms_setSubmittedValues = function() {
    var values = {};
    var fields = $(this).serializeArray();
    for (var i=0; i<fields.length; i++) {
      values[fields[i]] = fields[i].value
    }
    $(this).data("submittedValues", values);
  }

  var _HSFORM_COOKIES = {
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
  };

  $.fn._hsforms_transferCookies = function () {
    for (var i = 0; i < _HSFORM_COOKIES.length; i++) {
      var cookieVal = Util.Browser.getCookieByName(_HSFORM_COOKIES[i].name);
      if (cookieVal)
        $(this)
          .find('input[name="' + _HSFORM_COOKIES[i].field + '"]')
          .val(cookieVal)
          .change();
    }
  }

  $.fn._hsforms_transferQueryParams = function () {
    $(this)._hsforms_transferFields(Util.Browser.queryParamStringToObject());
  }

  $.fn._hsforms_transferFields = function(fields) {
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


})(jQuery);
