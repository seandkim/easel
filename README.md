<p align="center">
  <img src="./assets/logo.png" width='500'>
</p>

&nbsp;

## Contributors
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
