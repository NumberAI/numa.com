(function ($) {
  $.fn.modal = function (options) {
    var defaults = {
      name: false,
      visible: false,
      fade: true,
      onBeforeHide: undefined,
      onHide: undefined,
      onBeforeShow: undefined,
      onShow: undefined
    };
    var settings = $.extend({}, defaults, options);
    $(this).addClass("modal");

    $(this).on("hideModal", function () {
      Analytics && Analytics.track({
        object: "Modal",
        action: "Closed",
        label: modal.name,
      });
      if (settings.onBeforeHide) settings.onBeforeHide();
      if (settings.fade) $(this).fadeOut();
      else $(this).hide();
      if (settings.onHide) settings.onHide();
    });

    $(this).on("showModal", function () {
      Analytics && Analytics.track({
        object: "Modal",
        action: "Opened",
        label: modal.name,
      });
      if (settings.onBeforeShow) settings.onBeforeShow();
      if (settings.fade) $(this).fadeIn();
      else $(this).show();
      if (settings.onShow) settings.onShow();
    });

    $(this).on("toggleModal", function (event) {
      $(this).trigger($(this).is(":visible") ? "hideModal" : "showModal");
    });

    if (settings.visible !== $(this).is(":visible"))
      $(this).trigger("toggleModal");
  };
})(jQuery);