var jQuery = window.jQuery;

(function ($) {
  $(".toggleModal").on("click", function () {
    var selector = $(this).data("modal-selector");
    if (selector) $(selector).trigger("toggleModal");
  });

  $(".hideModal").on("click", function () {
    var selector = $(this).data("modal-selector");
    if (selector) $(selector).trigger("hideModal");
  });

  $(".showModal").on("click", function () {
    var selector = $(this).data("modal-selector");
    if (selector) $(selector).trigger("showModal");
  });

  $.fn.modal = function (options) {
    var defaults = {
      name: undefined,
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
      if (settings.onBeforeHide) settings.onBeforeHide();
      if (settings.fade) $(this).fadeOut();
      else $(this).hide();
      $(this).trigger("analytics.modal_closed", settings);
      if (settings.onHide) settings.onHide();
    });

    $(this).on("showModal", function () {
      if (settings.onBeforeShow) settings.onBeforeShow();
      if (settings.fade) $(this).fadeIn();
      else $(this).show();
      $(this).trigger("analytics.modal_opened", settings);
      if (settings.onShow) settings.onShow();
    });

    $(this).on("toggleModal", function (event) {
      $(this).trigger($(this).is(":visible") ? "hideModal" : "showModal");
    });

    if (settings.visible !== $(this).is(":visible"))
      $(this).trigger("toggleModal");
  };
})(jQuery);
