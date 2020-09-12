var Webflow = Webflow || [];

var ACTIONS = {
  SIGNUP: "signup",
  SIGNUP_PRICING: "pricingSignup",
  SIGNUP_PAGE: "signuppage",
  LEAD: "contact",
  MODAL: "modal",
};

var EVENTS = {
  SIGNUP_MODAL: "onshowsignupmodal",
  ENTER_SIGNUP: "gotosignuppage",
  FINISH_SIGNUP: "onsignupcompleted",
  SIGNUP_FAILED: "onsignupfailed",
  COLLECT_LEAD: "onshowleadmodal",
  SHOW_MODAL: "onshowmodal",
  START_SHOW_MODAL: "onstartshowmodal",
  FINISH_SHOW_MODAL: "onfinishshowmodal",
  HIDE_MODAL: "onhidemodal",
  START_HIDE_MODAL: "onstarthidemodal",
  FINISH_HIDE_MODAL: "onfinishhidemodal",
  TOGGLE_MODAL: "ontogglemodal",
};

var SIGNUP_URLS = {
  SUCCESS: "https://inbox.numa.com/signup",
  START: "/signup/start",
  AFTER_LEAD: "/signup/next",
  PRICING: "/pricing",
};

var REQUIRED_SIGNUP_FIELDS = [
  "email",
  "phone",
  "company",
  "product_offering",
];

var SIGNUP_FIELD_DEFAULTS = {
  brand: "numa",
  signup_mode: "selfServe",
  product_offering: "ESSENTIALS",
};

Webflow.push(function () {
  function isHandledAction(action) {
    var keys = Object.keys(ACTIONS);
    for (var i = 0; i < keys.length; i++) {
      if (action === ACTIONS[keys[i]]) return true;
    }
    return false;
  }

  function handleAction(action, params) {
    switch (action) {
      case ACTIONS.MODAL:
        if (params.el) {
          $(document).trigger(EVENTS.SHOW_MODAL, [
            {
              selector: "." + params.el,
              fields: params,
            },
          ]);
        }
        break;
      case ACTIONS.SIGNUP:
        $(document).trigger(EVENTS.SIGNUP_MODAL, [
          {
            fields: params,
          },
        ]);
        break;
      case ACTIONS.SIGNUP_PAGE:
        $(document).trigger(EVENTS.ENTER_SIGNUP, [
          {
            fields: params,
          },
        ]);
        break;
      case ACTIONS.SIGNUP_PRICING:
        $(document).trigger(EVENTS.SIGNUP_MODAL, [
          {
            next: SIGNUP_URLS.PRICING,
            fields: params,
          },
        ]);
        break;
      case ACTIONS.LEAD:
        $(document).trigger(EVENTS.COLLECT_LEAD, [
          {
            ctx: params,
          },
        ]);
        break;
      default:
        break;
    }
  }

  $("a[href^='#']").click(function (event) {
    var href = $(this).attr("href");
    var action = href.split("#")[1].split("?")[0];
    if (action && isHandledAction(action)) {
      event.preventDefault();
      var params = getUrlParamObject(href);
      handleAction(action, params);
    }
  });

  $(document).on(EVENTS.SIGNUP_MODAL, function (event, options) {
    var selector = options.selector || ".lead-collector";
    var formId =
      (options.fields && options.fields.formId) ||
      "f1b64222-5d7b-407f-8ca7-e99f4c496ce5";

    $(document).trigger(EVENTS.SHOW_MODAL, [
      {
        selector: selector,
        onStartShowModal: function () {
          if (!$(selector).data("is-form-loaded")) {
            var formConfig = {
              formId: formId,
              target: selector + " .modal-content",
              next: options.next || SIGNUP_URLS.AFTER_LEAD,
              fields: options.fields,
              onFormReady: function () {
                $(selector).data("is-form-loaded", true);
              },
              onFormSubmitted: function () {
                if (!options.keepOpen)
                  $(document).trigger(EVENTS.HIDE_MODAL, [
                    { selector: selector },
                  ]);
              },
            };
            (formConfig.formName = Boolean(options.next)
              ? "Lead Collector"
              : "Signup Popup"),
              (formConfig.formCategory = Boolean(options.next)
                ? "Leads"
                : "Activation"),
              (formConfig.formAction = Boolean(options.next)
                ? "Email Collection"
                : "Start Activation"),
              (formConfig.analytics = {});
            (formConfig.analytics.facebook = "Lead"),
              (formConfig.analytics.adwords = "Lead"),
              setupForm(formConfig);
          }
        },
      },
    ]);
  });

  $(document).on(EVENTS.ENTER_SIGNUP, function (event, options) {
    var redirect = options.next || SIGNUP_URLS.START;
    var q = "";
    if (options.fields) q = "?" + getQueryStringFromObject(options.fields);
    window.location.href = redirect + q;
  });

  $(document).on(EVENTS.FINISH_SIGNUP, function (event, options) {
    var redirect = options.next || SIGNUP_URLS.SUCCESS;
    var params = getUrlParamObject(window.location.search);
    if (options.fields) $.extend(params, options.fields);

    if (!params) options.fields = {};
    $(document).trigger(EVENTS.SIGNUP_FAILED, [options]);

    var fields = sanitizeHubspotFields(params, true);
    var defaultKeys = Object.keys(SIGNUP_FIELD_DEFAULTS);
    for (var i = 0; i < defaultKeys.length; i++) {
      var key = defaultKeys[i];
      if (!fields[key]) fields[key] = SIGNUP_FIELD_DEFAULTS[key];
    }

    if (!hasKeys(fields, REQUIRED_SIGNUP_FIELDS)) {
      options.fields = params;
      $(document).trigger(EVENTS.SIGNUP_FAILED, [options]);
    }

    var q = getQueryStringFromObject(params);
    window.location.href = SIGNUP_URLS.SUCCESS + "?" + q;
  });

  $(document).on(EVENTS.SIGNUP_FAILED, function (event, options) {
    var url = SIGNUP_URLS.START;
    var q = "";
    if (options.fields) var q = "?" + getQueryStringFromObject(fields);
    window.location.href = url + q;
  });

  $(document).on(EVENTS.COLLECT_LEAD, function (event, options) {
    console.log(options);
  });

  $(document).on(EVENTS.SHOW_MODAL, function (event, options) {
    var el = options.target || $(options.selector);
    if (!options.preserveDisplay) {
      el.css("display", "flex");
      el.hide();
    }
    el.fadeIn({
      start: function () {
        $(document).trigger(EVENTS.START_SHOW_MODAL, [options]);
      },
      done: function () {
        $(document).trigger(EVENTS.FINISH_SHOW_MODAL, [options]);
      },
    });
  });

  $(document).on(EVENTS.START_SHOW_MODAL, function (event, options) {
    if (options && options.onStartShowModal) options.onStartShowModal();
  });

  $(document).on(EVENTS.FINISH_SHOW_MODAL, function (event, options) {
    if (options && options.onFinishShowModal) options.onFinishShowModal();
  });

  $(document).on(EVENTS.START_HIDE_MODAL, function (event, options) {
    if (options && options.onStartHideModal) options.onStartHideModal();
  });

  $(document).on(EVENTS.FINISH_Hide_MODAL, function (event, options) {
    if (options && options.onFinishHideModal) options.onFinishHideModal();
  });

  $(document).on(EVENTS.HIDE_MODAL, function (event, options) {
    var el = options.target || $(options.selector);
    el.fadeOut({
      start: function () {
        $(document).trigger(EVENTS.START_HIDE_MODAL, [options]);
      },
      done: function () {
        $(document).trigger(EVENTS.FINISH_HIDE_MODAL, [options]);
      },
    });
  });

  $(document).on(EVENTS.TOGGLE_MODAL, function (event, options) {
    var el = options.target || $(options.selector);
    if (el.is(":visible")) {
      $(document).trigger(EVENTS.HIDE_MODAL, [options]);
    } else {
      $(document).trigger(EVENTS.SHOW_MODAL, [options]);
    }
  });

  $(".modal-close-btn").click(function (event) {
    var modal = $(this).closest(".modal");
    $(document).trigger(EVENTS.HIDE_MODAL, { target: modal });
    event.preventDefault();
  });

  $(".modal")
    .click(function (event) {
      $(document).trigger(EVENTS.TOGGLE_MODAL, { target: $(this) });
    })
    .children()
    .eq(0)
    .click(function () {
      return false;
    });

  $(document).ready(function () {
    $(".main-nav a.main-nav-link[href='#']").hide();
  });

  $(document).on(EVENTS.START_HIDE_MODAL, function () {
    $(".video-modal:visible")
      .find("iframe.embedly-embed")
      .each(function () {
        var player = new playerjs.Player(this);
        player.on("ready", function () {
          player.pause();
        });
      });
  });
});

