var jQuery = window.jQuery;

(function ($) {
  $("[data-action='start_signup']").click(function (event, options) {
    var base = this;
    var defaults = {
      signupUrl: "https://signup.numa.com",
      methodAttr: "method",
      modalSelectorAttr: "modal-selector"
    };
    var settings = $.extend(defaults, options);

    $(document).trigger("analytics.started_signup");

    switch (($(base).data(settings.methodAttr) || "").toLowerCase()) {
      case "modal":
        $($(base).data(settings.modalSelectorAttr)).trigger("toggleModal");
        break;
      default:
        window.location.href = settings.signupUrl;
        break;
    }
  });
})(jQuery);
