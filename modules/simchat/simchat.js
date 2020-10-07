var jQuery = window.jQuery;

(function ($) {
  // Public

  $.fn.chatLayout = function (options) {
    var base = this;
    var settings = init(options);

    if (!base.length && settings.scriptId && settings.hostSelector) {
      base = $("#" + settings.scriptId).closest(settings.hostSelector);
    }

    if (!base.length) throw new Error("Bad setup for host selector for chat");

    $(base).addClass("chat-layout");

    var chatWrapperEl = $(base).children(settings.chatSelector);
    if (!chatWrapperEl.length) {
      chatWrapperEl = $("<div />").addClass(settings.chatSelector);
      chatWrapperEl = $(base).prepend(chatWrapperEl);
    }
    chatWrapperEl.addClass("cl-conversation-wrapper");
    if (settings.chatClasses) chatWrapperEl.addClass(settings.chatClasses);
    chatWrapperEl.simChat(settings);

    var contentWrapperEl = $(base).children(settings.contentSelector);
    if (!contentWrapperEl.length) {
      contentWrapperEl = $("<div />").addClass(settings.contentSelector);
      contentWrapperEl = $(base).append(contentWrapperEl);
    }
    contentWrapperEl.addClass("cl-content-wrapper");
    if (settings.contentClasses)
      contentWrapperEl.addClass(settings.contentClasses);
    var contentInnerEl = $("<div />").addClass("cl-content-inner");
    contentWrapperEl.wrapInner(contentInnerEl);

    function init(options) {
      var defaults = {
        hostSelector: ".chat-layout-host",
        layout: "inset",
        chatSelector: ".conversation-wrapper",
        contentSelector: ".content-wrapper"
      };
      return $.extend({}, defaults, options);
    }
  };

  var TRANSITIONS = {
    NONE: undefined,
    FADE: "fade"
  };

  $.fn.simChat = function (options) {
    var base = this;

    // Main

    var messages = options.messages;

    var settings = init(options);
    var chatEl = renderMessages(messages, settings);
    $(base).prepend(chatEl);

    eventHandlers(settings);
    setupAnimation(messages, settings);
    render(settings);

    // Private

    function init(options) {
      var defaults = {
        fillSpace: false,
        isAnimated: true,
        transition: TRANSITIONS.FADE,
        delay: 1500,
        loop: false,
        loopDelay: 10000
      };
      return $.extend({}, defaults, options);
    }

    function renderMessages(messages, options) {
      function createParentEl(options) {
        var el = $("<div />").addClass("simChat");
        if (options.fillSpace) el.addClass("space-between");
        return el;
      }

      var parentEl = createParentEl(options);
      for (var i = 0; i < messages.length; i++) {
        var childEl = $()._sc_chatItem(messages[i]);
        childEl.hide();
        parentEl.append(childEl);
      }
      return parentEl;
    }

    // Animation

    function setupAnimation(messages, options) {
      if (!settings.isAnimated) return;
      base._animationStep = 1;
      base._timeline = [];

      function buildTimeline(messages, options) {
        base._timeline = [];
        for (var i = 0; i < messages.length; i++) {
          base._timeline.push(
            messages[i].delay === undefined ? options.delay : messages[i].delay
          );
        }
      }
      buildTimeline(messages, options);
    }

    function transition(el, isHiding, transitionType) {
      switch (transitionType) {
        case TRANSITIONS.FADE:
          isHiding ? el.fadeOut() : el.fadeIn();
          break;
        default:
          isHiding ? el.hide() : el.show();
          break;
      }
    }

    function playAnimationStep(step, options) {
      var el = $(base)
        .children(".simChat")
        .children(".sc-item:nth-child(" + step + ")");

      transition(el, false, options.transition);
      base._animationStep = step;
      var isEnd = step >= base._timeline.length;
      if (isEnd) {
        if (options.loop) {
          window.clearTimeout(base._animationTimer);
          base._animationTimer = setTimeout(function () {
            rewind(options);
            play(options);
          }, options.loopDelay);
        }
      } else {
        base._animationTimer = setTimeout(function () {
          playAnimationStep(step + 1, options);
        }, base._timeline[step + 1]);
      }
    }

    function play(options) {
      playAnimationStep(base._animationStep, options);
    }

    function pause() {
      if (base._animationTimer) window.clearTimeout(base._animationTimer);
    }

    function rewind(options) {
      var el = $(base).children(".simChat").children(".sc-item");
      transition(el, true, options.transition);
      base._animationStep = 0;
    }

    function forward(options) {
      var el = $(base).children(".simChat").children(".sc-item");
      transition(el, false, options.transition);
      base._animationStep = messages.length;
    }

    // Render

    function render(options) {
      if (options.isAnimated) play(options);
      else forward(options);
    }

    // Events

    function eventHandlers(optons) {
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
    }
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

    var labelEl = $("<div>" + (settings.label || "Voicemail") + "</div>");
    var playbackEl = $("<div />").addClass("sc-vm-playback").wrapInner(labelEl);

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
