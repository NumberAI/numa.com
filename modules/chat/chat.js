function displayChat(config) {
  function renderMessage(parentEl, options) {
    var COMPONENTS = {
      message: {
        direction: "outbound"
      },
      voicemail: {
        direction: "inbound",
        layout: "voicemail",
        body: "Voicemail"
      },
      hangup: {
        direction: "inbound",
        layout: "icon",
        body: "Customer called, hung-up",
        icon: "hangup"
      },
      rescue: {
        direction: "inbound",
        layout: "icon",
        body: "Customer called, switched to text",
        icon: "rescue"
      },
      patched: {
        direction: "inbound",
        layout: "icon",
        body: "Customer patched through to phone",
        icon: "patch"
      },
      image: {
        direction: "outbound",
        layout: "image"
      },
      note: {
        direction: "inline"
      },
      system: {
        direction: "inline"
      },
      order: {
        direction: "fullWidth",
        layout: "icon",
        icon: "cart"
      },
      suggestion: {
        greeting: {
          body: "Numa suggests...",
          icon: "numa",
          size: "small",
          weight: "bold"
        },
        direction: "outbound"
      },
      action: {
        greeting: {
          body: "Numa here,",
          icon: "numa"
        },
        direction: "fullWidth"
      }
    };

    function getComponent(options) {
      var fallback = "message";
      var findFormat =
        (options.format && options.format.toLowerCase()) || fallback;
      var result = COMPONENTS[findFormat];
      if (result) {
        result.format = findFormat;
        return result;
      }
      result = COMPONENTS[fallback];
      result.format = fallback;
      return result;
    }

    function el(classes, children, name) {
      var tag = name || "div";
      var classAttr = classes ? " class='" + classes + "'" : "";
      return "<" + tag + classAttr + ">" + children + "</" + tag + ">";
    }

    function createConversationItem(direction, children) {
      var classes = ["conversation-item"];
      if (direction) classes.push("dir-" + direction);
      return el(classes.join(" "), children);
    }

    function createItemBody(children, options) {
      var classes = ["ci-body"];
      if (options.format) classes.push("format-" + options.format);
      if (options.sender) classes.push("from-" + options.sender);
      return el(classes.join(" "), children);
    }

    var SIGNATURES = {
      answered: {
        body: "Answered by Numa",
        size: "default",
        icon: "numa"
      },
      greeted: {
        body: "Greeted by Numa",
        size: "default",
        icon: "numa"
      }
    };
    SIGNATURES.default = SIGNATURES.answered;
    function getSignature(lookup) {
      if (!lookup) return "";
      var config = SIGNATURES[lookup.body] || lookup;

      var classes = ["ci-signature"];
      if (config.size) classes.push("size-" + config.size);

      var content = config.body;
      if (config.icon) content = getIcon(config.icon) + content;
      return el(classes.join(" "), content);
    }

    var GREETINGS = {
      numa: {
        body: "Numa here,",
        size: "default",
        icon: "numa",
        weight: "bold"
      }
    };
    GREETINGS.default = GREETINGS.numa;
    function getGreeting(lookup) {
      if (!lookup) return "";
      var config = GREETINGS[lookup.body] || lookup;

      var classes = ["ci-greeting"];
      if (config.size) classes.push("size-" + config.size);
      if (config.weight) classes.push("font-" + config.weight);

      var content = config.body;
      if (config.icon) content = getIcon(config.icon) + content;
      return el(classes.join(" "), content);
    }

    function createActionEl(label) {
      return el("ci-actionLabel", label);
    }

    function createContent(children, options) {
      var content = "";
      if (options.greeting)
        content += el("ci-greeting", getGreeting(options.greeting));
      content += el("ci-text", children);
      if (options.button)
        content += el("ci-actions", createActionEl(options.button));
      if (options.signature)
        content += el("ci-signature", getSignature(options.signature));

      return el("ci-layout", content);
    }

    var ICONS = {
      hangup: "",
      rescue: "",
      cart: "",
      numa: "",
      patch: ""
    };
    function getIcon(lookup) {
      var result = ICONS[lookup];
      if (result) {
        return "<span class='ci-icon-glyph'>" + result + "</span>";
      }
      var url = result;
      if (!result) url = lookup;
      return "<img class='ci-icon-image' src='" + url + "'/>";
    }

    function createIconLayout(children, options) {
      var iconEl = el("ci-icon", getIcon(options.icon));
      var contentEl = el("ci-content", createContent(children, options));
      return el("ci-layout withIcon", iconEl + contentEl);
    }

    function createImageLayout(children, options) {
      var imageEl = "<img class='ci-image' src='" + options.image + "'/>";
      var contentEl = children
        ? el("ci-content", createContent(children, options))
        : "";
      return el("ci-layout withImage", imageEl + contentEl);
    }

    function createVoicemailLayout(children, options) {
      var transcriptEl = el("ci-transcript", children);
      var playbackEl = el(
        "ci-playback",
        COMPONENTS.voicemail.body +
          "<div class='ci-scrubber'>" +
          "<div class='ci-scrubTrack'>" +
          "<div class='ci-scrubThumb'></div>" +
          "</div></div>"
      );
      return el("ci-layout withVoicemail", transcriptEl + playbackEl);
    }

    function createBaseLayout(children, options) {
      return createContent(children, options);
    }

    function createLayout(type, children, options) {
      switch (type) {
        case "icon":
          return createIconLayout(children, options);
        case "image":
          return createImageLayout(children, options);
        case "voicemail":
          return createVoicemailLayout(children, options);
        default:
          return createBaseLayout(children, options);
      }
    }

    var component = getComponent(options);

    var layoutEl = createLayout(
      component.layout,
      options.body || component.body,
      {
        icon: options.icon || component.icon,
        image: options.image || component.image,
        greeting: options.greeting
          ? { body: options.greeting }
          : component.greeting,
        signature: options.signature
          ? { body: options.signature }
          : component.signature,
        button: options.button
      }
    );
    var formatEl = createItemBody(layoutEl, {
      format: component.format,
      sender: options.sender
    });
    var itemEl = createConversationItem(
      options.direction || component.direction,
      formatEl
    );

    $(itemEl).appendTo(parentEl);
    return;
  }

  var conversationEl = $(
    "<div class='chatSimulator'></div>"
  ).insertBefore(config.selector);

  for (var i = 0; i < config.messages.length; i++) {
    renderMessage(conversationEl, config.messages[i]);
  }
}