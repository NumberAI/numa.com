var jQuery = window.jQuery;

(function ($) {
  $("[data-action='start_signup']").click(function (e, options) {
    e.preventDefault();

    var base = this;
    var defaults = {
      signupUrl: "https://signup.numa.com",
      methodAttr: "method",
      modalAttr: "modal-selector",
      signupModal: "#signup_modal"
    };
    var settings = $.extend(defaults, options);

    // Analytics
    $(document).trigger("analytics.started_signup");

    // Determine signup method

    var METHODS = {
      MODAL: "modal",
      PAGE: "page"
    };
    var method = (
      $(base).data(settings.methodAttr) || METHODS.MODAL
    ).toLowerCase();

    var modalEl;
    if (method === METHODS.MODAL) {
      var modal = $(base).data(settings.modalAttr) || settings.signupModal;
      modalEl = $(modal);
    }

    if (METHODS.MODAL && modalEl.length) {
      $(modalEl).trigger("toggleModal");
    } else {
      window.location.href = settings.signupUrl;
    }
  });
})(jQuery);
