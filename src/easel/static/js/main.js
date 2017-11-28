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

function showAlertMsg(msg) {
    $('#alert-msg').html(msg);
    $("#alert-box").animate({
        right: 0
    }, {
        duration: 900,
        easing: 'easeOutQuart'
    });

    // hide after 2 seconds (2000ms)
    setTimeout(hideAlertMsg, alertBoxEase);
}

// remove preloader
function doneLoading() {
    $('.preload').remove();
};

function addLoading(el) {
    $(el).append('<div class="preload preloader-overlay">' + '<div class="spinner-wrapper">' + '<div class="spinner">' + '<div class="double-bounce1"></div>' + '<div class="double-bounce2"></div>' + '</div>' + '<div class="loading">LOADING...</div>' + '</div>' + '</div>');
}

// for submit button; makes a ajax call and calls successhandler or displays
// error message on modal
// ex) `createPage` in page.js
function modalEventHandler(modalID, url, method, requestData, successHandler) {
    const $modal = $('#' + modalID);
    $.ajax({
        url: url,
        method: method,
        data: requestData,
        success: function(data) {
            $modal.find('ul.errorlist').parent().parent().remove()
            successHandler(data);
            $modal.find('input').val('')
            $modal.modal('close');
        },
        error: function(jqXHR) {
            console.error("ajax call failed", jqXHR);
            let errors = ['Cannot connect to the server. Check your internet connection.'];
            debugger;
            if (jqXHR.responseJSON != undefined) {
                errors = jqXHR.responseJSON['errors']; // array of error messages
            }
            // remove existing error message TODO don't hardcode; is removing all tr necessary?
            $modal.find('ul.errorlist').parent().parent().remove()
            const error_list = $('<tr><td colspan="2"><ul class="errorlist nonfield"></ul></td></tr>');
            for (let key in errors) {
                const error = errors[key];
                error_list.find("ul").append("<li>" + error + "</li>");
            }
            $modal.find('tbody').prepend(error_list);
        }
    })
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
