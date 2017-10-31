/* sidebar javascript */
$(function() {
	var settings = {
      		toggle: ".sliiider-toggle",
      		exit_selector: ".slider-exit",
      		animation_duration: "0.5s",
     		place: "right", //where is the menu sliding from, possible options are (left | right | top | bottom)
      		animation_curve: "cubic-bezier(0.54, 0.01, 0.57, 1.03)", //animation curve for the sliding animation
      		body_slide: true, //set it to true if you want to use the effect where the entire page slides and not just the div
     		no_scroll: false, //set to true if you want the scrolling disabled while the menu is active
            auto_close: false //set to true if you want the slider to auto close everytime a child link of it is clicked
	};

	var menu = $('#menu').sliiide(settings);
});
