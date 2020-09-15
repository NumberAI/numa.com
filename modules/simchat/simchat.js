var jQuery = window.jQuery;

(function ($) {
  // Public
  $.fn.simChat = function (options) {
    var base = this;

    var defaults = {
      isAnimated: true,
      animationLoop: true,
      animationStepDelay: 1000,
      animationLoopDelay: 10000
    };
    base.settings = $.extend({}, defaults, options);

    var parentEl = $("<div />").addClass("simChat");
    for (var i = 0; i < options.messages.length; i++) {
      var childEl = $()._sc_chatItem(options.messages[i]);
      if (options.animated) {
        childEl.hide();
      }
      parentEl.append(childEl);
    }
    $(base).append(parentEl);

    // Animation

    base._animationStep = 1;
    base._timeline = [];

    for (i = 0; i < options.messages.length; i++) {
      base._timeline.push(
        options.messages[i].delay || base.settings.animationStepDelay
      );
    }

    function play(options) {
      playStep(base._animationStep, options);
    }

    function playStep(step, options) {
      base._animationStep = step;
      var el = $(base)
        .children(".simChat")
        .children(".sc-item:nth-child(" + step + ")");

      if (options && options.immediate) el.show();
      else el.fadeIn();

      var nextStep = step < base._timeline.length ? step + 1 : 0;
      if (base.settings.animationLoop && nextStep < step) {
        base._animationTimer = setTimeout(function () {
          rewind(options);
          play();
        }, base.settings.animationLoopDelay);
      } else {
        base._animationTimer = setTimeout(function () {
          playStep(nextStep);
        }, base._timeline[nextStep]);
      }
    }

    function pause() {
      if (base._animationTimer) window.clearTimeout(base._animationTimer);
    }

    function rewind(options) {
      var $el = $(base).children(".simChat").children(".sc-item");
      if (options && options.immediate) {
        $el.hide();
      } else {
        $el.fadeOut();
      }
      base._animationStep = 0;
    }

    function forward(options) {
      var $el = $(base).children(".simChat").children(".sc-item");
      if (options && options.immediate) {
        $el.show();
      } else {
        $el.fadeIn();
      }
      base._animationStep = options.messages.length;
    }

    // Render

    if (base.settings.isAnimated) play(1);
    else forward();

    // Events

    $(base).on("play", function (event, options) {
      play(options);
    });

    $(base).on("pause", function (event, options) {
      pause(options);
    });

    $(base).on("rewind", function (event, options) {
      rewind(options);
    });

    $(base).on("forward", function (event, options) {
      forward(options);
    });
  };

  // Private

  $.fn._sc_chatItem = function (options) {
    switch (options.format && options.format.toLowerCase()) {
      case "message":
        return $()._sc_chatFormatMessage(options);
      case "note":
        return $()._sc_chatFormatNote(options);
      case "action":
        return $()._sc_chatFormatAction(options);
      case "suggestion":
        return $()._sc_chatFormatSuggestion(options);
      case "system":
        return $()._sc_chatFormatSystem(options);
      case "hangup":
        return $()._sc_chatFormatHangup(options);
      case "patched":
        return $()._sc_chatFormatPatched(options);
      case "rescued":
        return $()._sc_chatFormatRescued(options);
      case "order":
        return $()._sc_chatFormatOrder(options);
      case "voicemail":
        return $()._sc_chatFormatVoicemail(options);
      case "image":
        return $()._sc_chatFormatImage(options);
      default:
        return $()._sc_chatFormatMessage(options);
    }
  };

  $.fn._sc_chatFormatMessage = function (options) {
    var defaults = {
      direction: "outbound",
      format: "message"
    };
    var settings = $.extend({}, defaults, options);

    var resultEl = $("<div />")
      .addClass("sc-item")
      .addClass("sc-format-" + settings.format)
      .addClass("sc-dir-" + settings.direction);

    return resultEl.wrapInner($()._sc_chatItemLayout(settings));
  };

  $.fn._sc_chatFormatSuggestion = function (options) {
    var defaults = {
      direction: "outbound",
      greeting: { name: "suggestion" }
    };
    var settings = $.extend({}, defaults, options);
    settings.format = "suggestion";
    return $()._sc_chatFormatMessage(settings);
  };

  $.fn._sc_chatFormatAction = function (options) {
    var defaults = {
      direction: "outbound",
      greeting: { name: "numa" }
    };
    var settings = $.extend({}, defaults, options);
    settings.format = "action";
    return $()._sc_chatFormatMessage(settings);
  };
  $.fn._sc_chatFormatNote = function (options) {
    var defaults = {
      direction: "inline"
    };
    var settings = $.extend({}, defaults, options);
    settings.format = "note";
    return $()._sc_chatFormatMessage(settings);
  };

  $.fn._sc_chatFormatSystem = function (options) {
    var defaults = {
      direction: "inline"
    };
    var settings = $.extend({}, defaults, options);
    settings.format = "system";
    return $()._sc_chatFormatMessage(settings);
  };

  $.fn._sc_chatFormatStatus = function (options) {
    var defaults = {
      direction: "inbound"
    };
    var settings = $.extend({}, defaults, options);
    settings.layout = "icon";
    return $()._sc_chatFormatMessage(settings);
  };
  $.fn._sc_chatFormatHangup = function (options) {
    var defaults = {
      content: "Customer called, hung-up",
      iconName: "hangup"
    };
    var settings = $.extend({}, defaults, options);
    settings.format = "hangup";
    return $()._sc_chatFormatStatus(settings);
  };
  $.fn._sc_chatFormatPatched = function (options) {
    var defaults = {
      content: "Customer called, patched to your phone",
      iconName: "patch"
    };
    var settings = $.extend({}, defaults, options);
    settings.format = "patched";
    return $()._sc_chatFormatStatus(settings);
  };
  $.fn._sc_chatFormatRescued = function (options) {
    var defaults = {
      content: "Customer called, switched to text",
      iconName: "rescue"
    };
    var settings = $.extend({}, defaults, options);
    settings.format = "rescued";
    return $()._sc_chatFormatStatus(settings);
  };
  $.fn._sc_chatFormatOrder = function (options) {
    var defaults = {
      direction: "fullwidth",
      iconName: "cart"
    };
    var settings = $.extend({}, defaults, options);
    settings.format = "order";
    settings.layout = "icon";
    return $()._sc_chatFormatMessage(settings);
  };
  $.fn._sc_chatFormatVoicemail = function (options) {
    var defaults = {
      direction: "inbound"
    };
    var settings = $.extend({}, defaults, options);
    settings.format = "voicemail";
    settings.layout = "voicemail";
    return $()._sc_chatFormatMessage(settings);
  };
  $.fn._sc_chatFormatImage = function (options) {
    var defaults = {
      direction: "outbound"
    };
    var settings = $.extend({}, defaults, options);
    settings.format = "image";
    settings.layout = "image";
    return $()._sc_chatFormatMessage(settings);
  };

  $.fn._sc_applyFontWeight = function (weight) {
    switch (weight && weight.toLowerCase()) {
      case "bold":
        $(this).css("font-weight", "bold");
        break;
      default:
        return;
    }
  };

  $.fn._sc_applyFontSize = function (size) {
    switch (size && size.toLowerCase()) {
      case "small":
        $(this).css("font-size", "0.8em");
        break;
      case "large":
        $(this).css("font-size", "1.2em");
        break;
      default:
        return;
    }
  };

  var _CHAT_ICONS = {
    hangup: "",
    rescue: "",
    cart: "",
    numa: "",
    patch: ""
  };
  $.fn._sc_contentPartIcon = function (options) {
    if (!options.iconName && !options.iconChar && !options.iconUrl) return;

    var resultEl;

    if (options.iconName || options.iconChar) {
      var glyph = _CHAT_ICONS[options.iconName] || options.iconChar;
      resultEl = $("<span>" + glyph + "</span>")
        .addClass("sc-icon")
        .addClass("sc-icon-glyph");
    } else {
      resultEl = $("<img/>")
        .addClass("sc-icon")
        .addClass("sc-icon-image")
        .attr("src", options.iconUrl);
    }
    return resultEl;
  };

  var _GREETING = {
    suggestion: {
      content: "Numa suggests...",
      iconName: "numa"
    },
    numa: {
      content: "Numa here,",
      iconName: "numa"
    }
  };

  $.fn._sc_contentPartGreeting = function (options) {
    var defaults = {
      name: undefined,
      content: undefined,
      iconName: undefined,
      iconChar: undefined,
      iconUrl: undefined,
      fontWeight: undefined,
      fontSize: undefined
    };

    var builtin = {};
    if (options.name) {
      builtin = _GREETING[options.name];
    }
    var settings = $.extend({}, defaults, options, builtin);
    var resultEl = $("<div />").addClass("sc-greeting");
    var contentEl = $("<span>" + settings.content + "</span>").addClass(
      "sc-greeting-content"
    );

    resultEl._sc_applyFontWeight(settings.fontWeight);
    resultEl._sc_applyFontSize(settings.fontSize);

    var iconEl = $()._sc_contentPartIcon(settings);

    return resultEl.wrapInner([iconEl, contentEl]);
  };

  var _SIGNATURES = {
    answered: {
      content: "Answered by Numa",
      iconName: "numa"
    },
    greeted: {
      content: "Greeted by Numa",
      iconName: "numa"
    }
  };

  $.fn._sc_contentPartSignature = function (options) {
    var defaults = {
      name: undefined,
      content: undefined,
      iconName: undefined,
      iconChar: undefined,
      iconUrl: undefined,
      fontWeight: undefined,
      fontSize: undefined
    };

    var builtin = {};
    if (options.name) {
      builtin = _SIGNATURES[options.name];
    }
    var settings = $.extend({}, defaults, options, builtin);

    var resultEl = $("<div />").addClass("sc-signature");
    var contentEl = $("<span>" + settings.content + "</span>").addClass(
      "sc-signature-content"
    );

    resultEl._sc_applyFontWeight(settings.fontWeight);
    resultEl._sc_applyFontSize(settings.fontSize);

    var iconEl = $()._sc_contentPartIcon(settings);

    return resultEl.wrapInner([iconEl, contentEl]);
  };

  $.fn._sc_contentPartActions = function (options) {
    if (!options.button) return;
    var resultEl = $("<div />").addClass("sc-action");
    var buttonEl = $("<span>" + options.button + "</span>").addClass(
      "sc-action-button"
    );
    resultEl._sc_applyFontWeight(options.fontWeight);
    resultEl._sc_applyFontSize(options.fontSize);

    return resultEl.wrapInner(buttonEl);
  };

  $.fn._sc_contentPartContent = function (children) {
    var resultEl = $("<div />").addClass("sc-content");
    $(resultEl).wrapInner(children);

    return resultEl;
  };

  $.fn._sc_chatItemContent = function (options) {
    var resultEl = $("<div />").addClass("sc-item-content");
    var greetingEl = options.greeting
      ? $()._sc_contentPartGreeting(options.greeting)
      : null;

    var contentEl = options.content
      ? $()._sc_contentPartContent(options.content)
      : null;

    var actionEl = options.action
      ? $()._sc_contentPartActions(options.action)
      : null;

    var signatureEl = options.signature
      ? $()._sc_contentPartSignature(options.signature)
      : null;

    return resultEl.wrapInner([greetingEl, contentEl, actionEl, signatureEl]);
  };

  $.fn._sc_chatItemLayout = function (options) {
    var layoutType = options.layout && options.layout.toLowerCase();
    switch (layoutType) {
      case "image":
        return $()._sc_layoutImage(options);
      case "voicemail":
        return $()._sc_layoutVoicemail(options);
      case "icon":
        return $()._sc_layoutIcon(options);
      default:
        return $()._sc_layoutBase(options);
    }
  };

  $.fn._sc_layoutVoicemail = function (options) {
    var defaults = {
      label: "Voicemail",
      content: undefined
    };
    var settings = $.extend({}, defaults, options);

    var resultEl = $("<div />")
      .addClass("sc-item-layout")
      .addClass("sc-layout-vm");
    var transcriptionEl = $("<div>" + settings.content + "</div>").addClass(
      "sc-vm-transcription"
    );

    var scrubThumbEl = $("<div />").addClass("sc-vm-scrubThumb");
    var scrubTrackEl = $("<div />")
      .addClass("sc-vm-scrubTrack")
      .wrapInner(scrubThumbEl);
    var scrubberEl = $("<div />")
      .addClass("sc-vm-scrubber")
      .wrapInner(scrubTrackEl);
    var labelEl = $("<div>" + (settings.label || "Voicemail") + "</div>");
    var playbackEl = $("<div />")
      .addClass("sc-vm-playback")
      .wrapInner([labelEl, scrubberEl]);

    return resultEl.wrapInner([transcriptionEl, playbackEl]);
  };

  $.fn._sc_layoutImage = function (options) {
    var resultEl = $("<div />")
      .addClass("sc-item-layout")
      .addClass("sc-layout-image");
    var imageEl = $("<img />")
      .addClass("sc-item-image")
      .wrapInner($()._sc_contentPartIcon(options));
    imageEl.attr("src", options.imageUrl);

    var contentEl;
    if (options.content) {
      contentEl = $("<div />")
        .addClass("sc-item-image-content")
        .wrapInner($()._sc_chatItemContent(options));
    }

    return resultEl.wrapInner([imageEl, contentEl]);
  };

  $.fn._sc_layoutIcon = function (options) {
    var resultEl = $("<div />")
      .addClass("sc-item-layout")
      .addClass("sc-layout-icon");
    var iconEl = $("<div />")
      .addClass("sc-item-icon")
      .wrapInner($()._sc_contentPartIcon(options));
    var contentEl = $("<div />")
      .addClass("sc-item-icon-content")
      .wrapInner($()._sc_chatItemContent(options));

    return resultEl.wrapInner([iconEl, contentEl]);
  };

  $.fn._sc_layoutBase = function (options) {
    var resultEl = $("<div />")
      .addClass("sc-item-layout")
      .addClass("sc-layout-base");
    return resultEl.wrapInner($()._sc_chatItemContent(options));
  };

  $.fn.__sc_itemAnimation = function (options) {};
})(jQuery);
