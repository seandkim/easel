<p align="center">
  <img src="./assets/logo.png" width='500'>
</p>

&nbsp;

## Contributors (Team 277)
- Sean D Kim
- Stella Kim
- Tiffany Lee

&nbsp;

## What is Easel?
- Easel is a website where artist could easily make a website for themselves and publish it for general audience. This was created as a final project for Web Application class at Carnegie Mellon University.

&nbsp;

## To Run

To use the deployed website, simply go to [this link](http://34.205.144.52/). To run the Django app locally, you need to have [Django (1.11.5)](https://www.djangoproject.com/) and [Python (2.7.10)](https://www.python.org/downloads/) installed. Clone the repository and go to `src` directory, then run the django app. 
```
python manage.py runserver
```
This will run the app locally at port 8000. If any database error occurs, try running 
```
python manage.py migrate && python manage.py runserver
```
If the error still occurs, please [report a issue](https://github.com/CMU-Web-Application-Development/Team277/issues). 

&nbsp;

## Features
1. Dashboard
    - You can see a general overview of your projects/sites.

<p align="center">
  <img src="./assets/dashboard.png" width='500'>
</p>

2. Media Library
    - You can upload media, and group them into different projects.

<p align="center">
  <img src="./assets/media_library_demo.gif" width='500'>
</p>

3. Site Editor
    - You can make multiple sites, each could contain multiple pages.
    - You can publish for everyone to see and view the site immediately.

<p align="center">
  <img src="./assets/site_editor_demo.gif" width='500'>
</p>

&nbsp;
  
## Technical Details
### Libraries used
##### Backend
- [Django (1.11.5)](https://www.djangoproject.com/)
- [AWS](https://aws.amazon.com/) for deployment

##### Frontend
- [SASS](sass-lang.com/)
- [Gulp](https://gulpjs.com/)
- [Materialize](http://materializecss.com/)
- [Medium-Editor](https://github.com/yabwe/medium-editor)

### Technical Highlights
##### Customization vs Usability
Significant amount of time was dedicated to discuss our design decisions. Given that our target audience is people who do not professionally program or make website, we wanted our website to be user-friendly; at the same time, we wanted to have enough customization so that we can reach various audiences.

##### Loading content-heavy site 
Our site editor became very content-heavy because it needed to load multiple html files (pages created by the user). We solved this issue by loading initial pages through Django page rendering with context, then loading any subsequent pages (such as opening a new page to edit).

###### Drag and Drop vs Sort vs Edit Components
This was perhaps the biggest challenge we had. On the editor (where you can edit the content of your website), we had to support three features. User can drag the default components from side menu and drop into the editor; user can sort components in different order; user can edit the individual components. For each functionality, we set a specific event listeners and made sure there is no conflict among them. Because `editable` and `sortable` had a conflicting click event, we had to create `editmode` that toggles between `editable` and `sortable`. Here are the code snippets of how we implemented it.
<br>
1. Drag and Drop a new component onto the editor
This is done through [jQuery Draggable](https://jqueryui.com/draggable/). Upon drag event, `helper` will immediately switch to `sortable` mode (which allows icon to be dropped onto the `sortable` section), then cloned the icon at the cursor. `connectToSortable` will allow the dragged icon to be dropped onto the `.sortable` div (which is the editor). 
```javascript
$(".drag-component").draggable({
    helper: "clone",
    revert: false,

    scroll: false,
    distance: 0,
    zIndex: 1000,
    cursorAt: { left: 50, top: 50 },
    appendTo: 'body',

    connectToSortable: ".sortable",
    helper: function(e, a, b, c) {
        $('#sortable-mode').trigger('click');
        return $(this).clone();
    },
});
```
When the icon is is dropped, the icon was immediately switched to the corresponding component in through `update` function when initializing `sortable`. 
```javascript
$(".sortable").sortable({
    ...
    update: componentDropHandler,
});
```
<br>
2. Sort the components into different order
This is done through [jQuery Sortable](http://jqueryui.com/sortable/). `disable` field need to be `true` to disable sortable when components are being edited. 
```javascript
$(".sortable").sortable({
    disabled: true,
    ...
});
```
3. Edit the individual components
This is done through [Medium Editor](https://github.com/yabwe/medium-editor). If we disable sortable, the medium editor library will override the click event on all the div with `editable` class, allowing them to be modified. 
```
$(".sortable").sortable("option", "disabled", true);
```

  
###### Handling asynchronous loading
To make our site user friendly, we made almost all form submission happen through modals (popup window) rather than render new page. This meant that we could not reply on default form submission to handle data and rendering. We only needed to ensure that page and data are consistent, even if the error case where asynchronous call is not successful. Because there were so many asynchronous calls editing the page status of site editors, we created a uni-directional data flow, similar to [React](https://reactjs.org/). Upon asynchronous calls, it will modify the global struct called `pagesInfo` and rerender using `updatePages()`, everytime data is changed. This made development process very fast and stable. 
```javascript
// renders the pages based on `pagesInfo`
function updatePages() {
    ...
    for (let name in pagesInfo) {
        ...
        // close any unclosed page (closed but present in tabs)
        if (!pagesInfo[name]['opened'] && $('#page-content > #' + name + '').length == 1) {
            get$tab(name).remove();
            get$content(name).remove();
            get$icon(name).find('i').removeClass('icon-file-o').addClass('icon-file');
            changePageStatus(name, false, false); // ajax call to server
        }
        // open any unopened page
        if (pagesInfo[name]['opened'] && $('#page-content > #' + name + '').length == 0) {
            get$icon(name).find('i').removeClass('icon-file').addClass('icon-file-o');
            openPage(siteName, name);
        }
        ...
    }
    ...
    
// example of how updatePages works
function openPage(siteName, pageName) {
    ...
    loadPageHTML(siteName, pageName, function(jqXHR, textStatus) {
        pagesInfo[pageName]['opened'] = false; // modify global data
        pagesInfo[pageName]['active'] = false;
        updatePages() // rerender based on the data
    });
}
```

Also to avoid code duplication across modals, we made a helper function initialized modals, including its success and error cases. This also allowed us to have multiple modals with high stability. 
```javascript
// helper function that sets up modal
function modalSubmitHandler(modalID, url, method, requestData, successHandler, errorHandler) {
    const $modal = $('#' + modalID);
    $.ajax({
        url: url,
        method: method,
        data: requestData,
        success: function(data) {
            $modal.find('ul.errorlist').parent().parent().remove()
            if (successHandler) {
                successHandler(data);
            }
            $modal.find('input').val('');
            $modal.modal('close');
        },
        error: function(jqXHR) {
            console.error("ajax call failed", jqXHR);
            let errors = ['Cannot connect to the server. Check your internet connection.'];
            if (jqXHR.responseJSON != undefined) {
                errors = jqXHR.responseJSON['errors']; // array of error messages
            }
            ...
            const error_list = $('<tr><td colspan="2"><ul class="errorlist nonfield"></ul></td></tr>');
            for (let key in errors) {
                let error = errors[key];
                if (error == "This field is required.") {
                    var label = $('label[for="id_' + key + '"]').html();
                    if (label != null) {
                        label = label.substring(0, label.length - 1);
                        error = label + " is required.";
                    }
                }
                error_list.find("ul").append("<li>" + error + "</li>");
            }
            ...
            form.prepend(error_list);
            if (errorHandler) {
                errorHandler();
            }
        }
    })
}

// example of how modal is set up
$("#edit-site-modal").on('click', 'button:not(.cancel)', function(e) {
        e.preventDefault();
        const fieldNames = ['siteName', 'description'];
        const values = getFormValues($(this).closest('form'), fieldNames);
        const oldName = $('#edit-site-modal').data('oldname');

        function successHandler(data) {
            window.location.href = '/easel/sites/';
        }

        modalSubmitHandler('edit-site-modal', '/easel/sites/' + oldName + '/siteInfo/', 'POST', {
            siteName: values.siteName,
            description: values.description,
            oldName: oldName
        }, successHandler);
    });
```
