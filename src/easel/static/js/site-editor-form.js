$(document).ready(function() {
  // Periodically refresh stream page
  // CSRF set-up copied from Django docs
  // from code provided during class
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) == (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  var csrftoken = getCookie('csrftoken');
  $.ajaxSetup({
    beforeSend: function(xhr, settings) {
      xhr.setRequestHeader("X-CSRFToken", csrftoken);
    }
  });

  $(document).keydown(typeOnForm)
});

function typeOnForm(event) {
  console.log(event.which, c, event.shiftKey)
  var c = String.fromCharCode(event.which)

  builtin = checkBuiltinKey(event)

  if (!builtin) {
    if (event.shiftKey) {
      c = c.toUpperCase()
    } else {
      c = c.toLowerCase()
    }
    var content = $('#cursor').prev().html()

    $('#cursor').prev().html(content+c)
  }
}

function checkBuiltinKey(event) {
  if (event.which == 8) {
    var content = $('#cursor').prev().html()
    if (content.length > 0) {
      $('#cursor').prev().html(content.substr(1))
      debugger;
    }
  } else {
    return false
  }

  return true
}
