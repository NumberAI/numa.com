var Analytics = {
  this.track = function(options) {
    if (!options.object || !options.action)
      return;

    if (dataLayer) {
      var event = properties;
      event.category = options.object;
      event.action = options.action;
      if (options.label) event.label = options.label;
      if (options.value) event.value = options.value;
      dataLayer.push(event);
    }
  }
};