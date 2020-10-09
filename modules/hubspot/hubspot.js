var jQuery = window.jQuery;
var Util = window.Util;
var hbspt = window.hbspt;

var HUBSPOT = window.HUBSPOT || {
  portalId: "3283010",
  forms: {},
  submissions: {}
};

(function ($) {
  function getHubspotBaseScript(options, onSuccess) {
    Util.Browser.$loadScript(
      $,
      "https://js.hs-scripts.com/" + HUBSPOT.portalId + ".js",
      options,
      function () {
        onSuccess();
      }
    );
  }

  function getHubspotCTAScript(options, onSuccess) {
    getHubspotBaseScript(options, function () {
      Util.Browser.$loadScript(
        $,
        "https://js.hscta.net/cta/current.js",
        options,
        function () {
          onSuccess();
        }
      );
    });
  }

  function getHubspotFormScript(options, onSuccess) {
    getHubspotBaseScript(options, function () {
      Util.Browser.$loadScript(
        $,
        "https://js.hsforms.net/forms/v2.js",
        options,
        function () {
          onSuccess();
        }
      );
    });
  }

  getHubspotBaseScript();

  // CTA

  $.fn.hubspotCTA = function (options) {
    var base = this;

    getHubspotCTAScript({}, function () {
      var settings = init();
      if (!settings) return;

      var el = createElement(settings);
      if (!el) return;

      eventHandlers(settings);

      $(base).empty().append(el);
      hbspt.cta.load(settings.portalId, settings.id, {});
    });

    function init() {
      var defaults = {
        id: $(base).data("cta-id") || undefined,
        portalId: HUBSPOT.portalId,
        altText: undefined,
        name: $(base).data("cta-name")
      };

      var settings = $.extend(defaults, options);
      if (!settings.id) return;
      if (!settings.name) settings.name = settings.id;

      return settings;
    }

    function createElement(settings) {
      var imageEl = $("<img />")
        .addClass("hs-cta-img")
        .css("border-width", "0px")
        .attr("id", "hs-cta-img-" + settings.id)
        .attr(
          "src",
          "https://no-cache.hubspot.com/cta/default/" +
            settings.portalId +
            "/" +
            settings.id +
            ".png"
        )
        .attr("alt", settings.alt)
        .hide();

      var linkEl = $("<a />").attr(
        "href",
        "https://cta-redirect.hubspot.com/cta/redirect/" +
          settings.portalId +
          "/" +
          settings.id
      );
      $(linkEl).wrapInner(imageEl);

      var compatEl = $(
        "<!--[if lte IE 8]><div id='hs-cta-ie-element'></div><![endif]-->"
      );

      var wrapperEl = $("<span/>")
        .addClass("hs-cta-node")
        .addClass("hs-cta-" + settings.id)
        .attr("id", "hs-cta-" + settings.id);

      $(wrapperEl).wrapInner([compatEl, linkEl]);

      var rootEl = $("<span/>")
        .addClass("hs-cta-wrapper")
        .attr("id", "hs-cta-wrapper-" + settings.id);

      $(rootEl).wrapInner(wrapperEl);
      return rootEl;
    }

    function eventHandlers(settings) {
      $(base).on("click", function () {
        $(this).trigger("analytics.clicked_cta", settings);
      });
    }
  };

  $("[data-cta-id]").each(function (idx) {
    $(this).hubspotCTA();
  });
  // Forms

  $.fn.hubspotForm = function (options) {
    if (!options.formId || !options.name)
      throw new ReferenceError(
        "Hubspot form not properly configured : " +
          " (id: " +
          options.formId +
          ") (name: " +
          options.formName +
          ")"
      );

    if (HUBSPOT.forms[options.formId]) return; // Form already exists

    getHubspotFormScript({}, function () {
      var settings = init();
      if (!settings) return;

      var selector = createElement(settings);
      var form = setupForm(settings, selector);

      hbspt.forms.create(form);
      HUBSPOT.forms[options.formId] = true;
    });

    function init() {
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
      return settings;
    }

    function createElement(settings) {
      $(settings.target).addClass("hs-form-embed");
      var selector = settings.target + ".hs-form-embed";
      return selector;
    }

    function setupForm(settings, selector) {
      var form = settings;

      form.onBeforeFormInit = function (ctx) {
        if (settings.prequiredFields.length) {
          var success = true;
          var params = Util.Browser.queryParamStringToObject();

          success = Util.Objects.hasKeys(params, settings.prequiredFields);
          if (!success && settings.prequiredFailPath) {
            var q = Object.keys(params).length
              ? Util.Browser.objectToQueryParamString(params)
              : "";
            window.location.href = settings.prequiredFailPath + q;
            return;
          }
        }

        if (options.onBeforeFormInit) options.onBeforeFormInit(ctx);
      };

      form.onFormReady = function ($form) {
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
        if (options.onFormSubmitted) options.onFormSubmitted();

        if (settings.nextUrl) {
          var url = settings.nextUrl;

          if (settings.withQueryParams) {
            var queryParams = Util.Browser.queryParamStringToObject();
            var formValues = _hsforms_getSubmittedValues(settings.formId);
            var params = $.extend(queryParams, formValues);
            if (settings.removeHubspotContext)
              params = removeHubspotContextFields({
                fields: params,
                dropEmpty: true
              });
            url = url + Util.Browser.objectToQueryParamString(params);
          }
          window.location.href = url;
        }
      };

      return form;
    }
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
