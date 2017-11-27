/*
 * tab.js - user interaction with page tab. Closing, opening, organizing tabs.
 */

 // updatePages : update the tab/page/icon element after `pagesInfo` changes.
 // when page status changes, you should update `pagesInfo` and call this method
 // instead of changing elements directly.
 // ex) see openTabHandler/closeTabHandler
 function updatePages() {
   // if there is opened pages and no active page, make the first opened page active
   if (!getActivePageName()) {
     for (let name in pagesInfo) {
       if (pagesInfo[name]['opened']) {
         pagesInfo[name]['active'] = true;
         break;
       }
     }
   }

   for (let name in pagesInfo) {
     // close any unclosed page (closed but present in tabs)
     if (!pagesInfo[name]['opened'] && $('#page-content > #'+name+'').length == 1) {
       get$tab(name).remove();
       get$content(name).remove();
       $('#page-list i.' + name).removeClass('icon-file-o').addClass('icon-file');
       changePageStatus(name, false, false); // ajax call to server
     }
     // open any unopened page
     if (pagesInfo[name]['opened'] && $('#page-content > #'+name+'').length == 0) {
       $('#page-list i.' + name).removeClass('icon-file').addClass('icon-file-o');
       loadPageHTML(siteName, name);
       changePageStatus(name, true, false); // ajax call to server
     }
  }

  // update active tab
  // get the unactivated tab
  $('#page-content > div').addClass('hidden');
  $('.cr-tabs > li').removeClass('active');

  // replace page review with target tab
  const activeName = getActivePageName();
  if (activeName) {
    get$tab(activeName).addClass('active');
    get$content(activeName).removeClass('hidden');
  } else {
    $('div.empty-workspace-msg').removeClass('hidden');
  }
}

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
  pagesInfo[pageName]['opened'] = false;
  pagesInfo[pageName]['active'] = false;
  updatePages();
}
