'use strict';

/* main.js: for initialization and common component across site */
var alertBoxEase = 2000;
var sidebarHidden = true;

/* Controls hide and show of sidebar */
function sidebarToggle(e) {
    if (sidebarHidden) {
        showSideBar();
    } else {
        hideSideBar();
    }
    sidebarHidden = !sidebarHidden;
}

function showSideBar() {
    $("#sidebar").animate({
        right: 0
    }, {
        duration: 900,
        easing: 'easeOutQuart'
    });
}

function hideSideBar() {
    $("#sidebar").animate({
        right: '-400px'
    }, {
        duration: 900,
        easing: 'easeOutQuart'
    });
}

function hideAlertMsg() {
    $("#alert-box").animate({
        right: '-300px'
    }, {
        duration: 900,
        easing: 'easeOutQuart'
    });
}

function showAlertMsg(msg, duration) {
    var ease;
    $('#alert-msg').html(msg);
    $("#alert-box").animate({
        right: 0
    }, {
        duration: 900,
        easing: 'easeOutQuart'
    });

    // hide after 2 seconds (2000ms)
    if (!duration) {
        ease = alertBoxEase;
    }
    setTimeout(hideAlertMsg, duration);
}

// remove preloader
function doneLoading() {
    $('.preload').remove();
};

function addLoading(el) {
    $(el).append('<div class="preload preloader-overlay">' + '<div class="spinner-wrapper">' + '<div class="spinner">' + '<div class="double-bounce1"></div>' + '<div class="double-bounce2"></div>' + '</div>' + '<div class="loading">LOADING...</div>' + '</div>' + '</div>');
}

// helper function that gets form values into a dictionary
function getFormValues(formElem, fieldNames) {
    var values = {};
    for (var i = 0; i < fieldNames.length; i++) {
        var field = fieldNames[i];
        var value = formElem.find('input[name="' + field + '"]').val();
        values[field] = value;
    }
    return values;
}

// main
$(function() {
    /* initializations */
    $('.modal').modal();
    $('.close-alert').click(hideAlertMsg);

    /* side bar */
    $('#sidebar').css('right', '-400px');
    $('#toggle').on('click', sidebarToggle);
    $('#slider-exit').on('click', sidebarToggle);
});
