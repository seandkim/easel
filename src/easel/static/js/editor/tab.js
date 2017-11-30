/*
 * tab.js - user interaction with page tab. Closing, opening, organizing tabs.
 */

// getActivePageName : return the page name of active tab; null if none
function getActivePageName() {
    let activePageName;
    let found=0;
    for (let name in pagesInfo) {
      if (pagesInfo[name]['active']) {
        activePageName = name;
        found++;
      }
    }
    console.assert(found<=1); // make sure there is only one or zero active page
    return activePageName;
}

// get$icon : get jquery element of page icon in the page tree (at left side)
function get$icon(pageName) {
  return $('#page-list div[file-name="' + pageName + '"]');
}

// get$Tab : get jquery tab element of the pagename
function get$tab(pageName) {
  return $('.cr-tabs li[tab-target="#' + pageName + '"]');
}

// get$content : get jquery element that contains content of the pagename
function get$content(pageName) {
  return $('#page-content div[id="' + pageName + '"]');
}

// noTab : check if there is any tab currently open, returns bool
function noTab() {
    for (var name in pagesInfo) {
      if (pagesInfo[name]['active']) {
        return false;
      }
    }
    return true;
}

// switch tab: click handler for opening page tab
function switchTabHandler(e) {
  for (let name in pagesInfo) {
    pagesInfo[name]['active'] = false;
  }
  // update this page to active
  const pageName = $(this).attr('tab-target').substring(1); // remove `#`
  pagesInfo[pageName]['active'] = true;
  updatePages();
}

function closeTabHandler(e) {
  e.preventDefault();
  e.stopPropagation(); // stops event listener for clicking new tab
  var pageName = $(this).prev().html();
  if (!pagesInfo[pageName]['saved']) {
    $('#close-page-modal button.close-button').click(function() {
      pagesInfo[pageName]['saved'] = true;
      pagesInfo[pageName]['opened'] = false;
      pagesInfo[pageName]['active'] = false;
      updatePages();
      $('.modal').modal('close');
    })
    $('#close-page-modal').modal('open');
  } else {
    pagesInfo[pageName]['opened'] = false;
    pagesInfo[pageName]['active'] = false;
    updatePages();
  }
}
