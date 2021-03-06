var jQuery = window.jQuery;

var Analytics = new (function () {
  this.track = function (options) {
    if (!options.object || !options.action) return;

    var event = options.properties || {};
    event.event = "analytics";
    event.category = options.object;
    event.action = options.action;
    if (options.label) event.label = options.label;
    if (options.value) event.value = options.value;

    var dataLayer = dataLayer || [];
    dataLayer.push(event);
  };

  this.trackForm = function (action, options) {
    var event = {
      object: "Form",
      action: action,
      label: options.name || options.formId,
      properties: {}
    };
    if (options.formType) event.properties.formType = options.formType;
    if (options.formId) event.properties.formId = options.formId;
    this.track(event);
  };
})();

window.Analytics = Analytics;

(function ($) {
  $().ready(function () {
    $(".hs-form-embed").on("analytics.form_load", function (event, options) {
      Analytics.trackForm("Viewed", options);
    });

    $(".hs-form-embed").on("analytics.forms_ubmitted", function (
      event,
      options
    ) {
      Analytics.trackForm("Submitted", options);
    });

    $(".modal").on("analytics.modal_opened", function (event, options) {
      Analytics.track({
        object: "Modal",
        action: "Opened",
        label: (options && options.name) || ""
      });
    });

    $(".modal").on("analytics.modal_closed", function (event, options) {
      Analytics.track({
        object: "Modal",
        action: "Closed",
        label: (options && options.name) || ""
      });
    });

    $("*").on("analytics.clicked_cta", function (event, options) {
      Analytics.track({
        object: "CTA",
        action: "Clicked",
        properties: options
      });
    });

    $(document).on("analytics.started_signup", function (event, options) {
      Analytics.track({
        object: "Conversion",
        action: "Started",
        label: "Signup"
      });
    });

    $(document).on("analytics.completed_signup", function (event, options) {
      Analytics.track({
        object: "Conversion",
        action: "Completed",
        label: "Signup"
      });
    });
  });

  $(".leadin-button").on("click", function (event) {
    Analytics.track({
      object: "Lead Popup",
      action: "Submitted"
    });
  });
})(jQuery);
