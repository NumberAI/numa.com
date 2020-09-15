var jQuery = window.jQuery;

(function ($) {
  // Class based event shortcuts
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
    var base = this;
    var defaults = {
      name: undefined,
      visible: false,
      fade: true,
      onBeforeHide: undefined,
      onHide: undefined,
      onBeforeShow: undefined,
      onShow: undefined,
      modalClass: "modal",
      openedClass: "modal-opened",
      closedClass: "modal-closed",
      contentClass: "modal-content",
      hideOnBackgroundClick: true
    };
    var settings = $.extend({}, defaults, options);
    init();

    // Private

    function init() {
      $(base).addClass(settings.modalClass);
      wrapContent(base);
      registerEventHandlers(base);

      if (settings.visible !== $(base).is(":visible"))
        $(base).trigger("toggleModal");
    }

    function wrapContent() {
      if (settings.hideOnBackgroundClick) {
        $(base).on("click", function (e) {
          $(this).trigger("hideModal");
          e.preventDefault();
        });
      }

      var contentEl = $("<div/ >").addClass(settings.contentClass);
      $(contentEl).click(function (e) {
        e.stopPropagation();
      });
      $(base).wrapInner(contentEl);
    }

    function close(el) {
      $(el).trigger("analytics.modal_closed", settings);
      $(el)
        .animate(
          { opacity: 0 },
          { duration: settings.fast ? "slow" : 0, done: $(el).hide() }
        )
        .addClass(settings.closedClass);
    }

    function open(el) {
      $(el).trigger("analytics.modal_opened", settings);
      $(el)
        .css("opacity", 0)
        .addClass(settings.openedClass)
        .animate({ opacity: 1 }, { duration: settings.fade ? "fast" : 0 })
        .show();
    }

    function registerEventHandlers(parentEl) {
      $(base).on("hideModal", function () {
        if (settings.onBeforeHide) settings.onBeforeHide(this);
        close(this);
        if (settings.onHide) settings.onHide(this);
      });

      $(base).on("showModal", function () {
        if (settings.onBeforeShow !== undefined) {
          settings.onBeforeShow(this);
        }
        open(this);
        if (settings.onShow) settings.onShow(this);
      });

      $(base).on("toggleModal", function () {
        $(this).trigger($(this).is(":visible") ? "hideModal" : "showModal");
      });
    }
  };
})(jQuery);
