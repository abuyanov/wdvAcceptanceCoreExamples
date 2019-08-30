var _viewer, _thumb, _thumb2;
var lastUploadedFile;
var selectedAnno;
var _currIter;
var _currAnnoIndx = 0;
var Annotations = [];
// Show status and error messages
function appendStatus(msg) {
    var stat = $("#status");
    stat.append(msg + "<br>");
}


// Initialize Web Viewing
$(function () {
    try {
        // Initialize Web Document Viewer
        _viewer = new Atalasoft.Controls.WebDocumentViewer({
            parent: $('.atala-document-container'),
            toolbarparent: $('.atala-document-toolbar'),
            allowannotations: true,
            showerrors: true,
            savepath: 'Saved/',
            savefileformat: 'pdf',
            serverurl: 'wdv',
            allowtext: true,
            allowforms: false,
            persistrotation: true,
            direction: Atalasoft.Utils.ScrollDirection.Vertical,
            annotations: {
                stamps: [
                    {
                        'name': 'Approved',
                        'fill': {
                            'color': 'green',
                            'opacity': 0.5
                        },
                        'outline': {
                            'color': '#43BC6F'
                        },
                        'text': {
                            'value': 'This document has been approved',
                            'align': 'left',
                            'font': {
                                'bold': false,
                                'color': '#B9C89D',
                                'family': 'Georgia',
                                'size': 24
                            }
                        }
                    },
                    {
                        'name': 'Approved2',
                        'fill': {
                            'color': 'green',
                            'opacity': 0.5
                        },
                        'outline': {
                            'color': 'Black'
                        },
                        'text': {
                            'value': 'Approved',
                            'align': 'left',
                            'font': {
                                'bold': false,
                                'color': 'black',
                                'family': 'Arial',
                                'size': 24
                            }
                        },
                        'cornerradius': 50,
                        burn: true
                    }
                ],
                images:[{
                    name:'fox',
                    src: 'images/fox.jpg',
                    readonly: true,
                }],
                defaults: [
                    {
                        type: 'line',
                        outline: {
                            color: 'red',
                            width: 4,
                            endcap: {
                                style: 'open'
                            }
                        },
                    }]
            },
           
            upload: {
                enabled:true,
                uploadpath: 'Upload/Viewer',
                allowedfiletypes: '.jpg,.pdf,.png,.jpeg,image/tiff',
                allowedmaxfilesize: 6*1024*1024,
                allowmultiplefiles: false,
                allowdragdrop: false,
                filesuploadconcurrency: 3,
            },
            //showselecttools: true,
            //mousetool: {
            //    type: Atalasoft.Utils.MouseToolType.Text,
            //    text: {
            //        selection: {
            //            /** Specifies the fill color. */
            //            color: 'green',
            //            /** Specifies the selection transparency level. */
            //            alpha: 0.25
            //        },
            //        hookcopy: true,
            //    }
            //}
        });

        _thumb = new Atalasoft.Controls.WebDocumentThumbnailer({
            parent: $('#thumb1'),
            serverurl: 'wdv',
            maxwidth: 120,
            minwidth: 60,
            viewer: _viewer,
            allowannotations: true,
            allowforms: false,
            allowdragdrop: true,
            showthumbcaption: true,
            //thumbcaptionformat: 'page {0}',
            selectionmode: Atalasoft.Utils.SelectionMode.MultiSelect,
            selecteditemsorder: Atalasoft.Utils.SelectedItemsOrder.SelectedOrder,
            direction: Atalasoft.Utils.ScrollDirection.Vertical,
            persistrotation: true,
            //tabular:true,
            //columns:2
        });

        // Initialize Second Thumbnail
        _thumb2 = new Atalasoft.Controls.WebDocumentThumbnailer({
            parent: $('#thumb2'),
            serverurl: 'wdv',
            maxwidth: 120,
            minwidth: 60,
            allowdragdrop: true,
            allowforms: false,
            viewer:_viewer,
            allowannotations: true,
            showthumbcaption: true,
            direction: Atalasoft.Utils.ScrollDirection.Vertical,
            selectionmode: Atalasoft.Utils.SelectionMode.MultiSelect,
            selecteditemsorder: Atalasoft.Utils.SelectedItemsOrder.ItemIndexOrder,
            //documenturl: 'images/10Numbered Pages.TIF',
        });

        _thumb.bind({
            'pageinserted': onPageInsert,
            'pageremoved': onPageRemove,
            'pagemoved': onPageMove,
            'documentchanged': onDocChange,
        })

        _thumb2.bind({
            'thumbdragstart':onDragStart,
            'thumbdragend': onDragEnd,
            'thumbdragcomplete': onDragComplete,
            'documentloaded':onDocLoaded,
            
        });

        // Uncomment the following 2 lines if the toolbar buttons should be displayed without text
        //$('.atala-ui-button .ui-button-text').html(' ');
        //$('.atala-ui-button').css({ height: '28px', width: '28px' });

        loadFile();


    } catch (error) {
        appendStatus("Thrown error: " + error.description);
    }

    _viewer.bind({
        'fileaddedtoupload': onFileAdded,
        'uploadstarted': onUploadStart,
        'fileuploadstarted': onFileUploadStart,
        'fileuploadfinished': onFileUploadFinished,
        'uploadfinished': onUploadFinished,
        'annotationtextchanged': onAnnoTextChanged,
        //'annotationcreated':onAnnoCreated,
        //'annotationloaded':onAnnoLoaded,
        'annotationsloaded':onAnnosLoaded,
        'error': onViewerError,
        'documentsaved': onDocSaved,
        'documentinfochanged': onInfoChanged,
        'beforehandlerrequest': beforereq,
        //'pagetextloaded':onTextLoaded,
    });

    $("#versionInfo").text("Version: " + Atalasoft.Controls.Version);
});

function onDocSaved(ev) {
    if (ev.success) {
        appendStatus("Document saved to: " + ev.fileName);
        appendStatus(ev.customData.Message);
    } else {
        appendStatus("Failed to save document");
    }
}

function onThumbSelected(e) {
    appendStatus("Selected thumb: " + e.index);
}

function onThumbDeselected(e) {
    appendStatus("Deselected thumb: " + e.index);
}

function beforereq(e) {
    if (e.request.type === 'docsave') {
        e.request.data.testparam = "{test: 'true'}";
    }
}

function onDocLoaded(event) {
    appendStatus(event.customData.CustomMessage);
}

function onInfoChanged(evnt) {
   if (evnt.customData)
        appendStatus(evnt.customData.CustomMessage);
}

function onAnnosLoaded(evnt) {
    if (evnt.customData) {
        appendStatus(evnt.customData.CustomMessage);
    } else {
        appendStatus("Server did not provided any additional info");
    }
    
    //if(Annotations.length != 0)
    //getAnnotations();
}

function onAnnoLoaded(evnt) {
    appendStatus(evnt.customData.CustomMessage);
}

function onTextLoaded(ev) {
    appendStatus(ev.customData.CustomMessage);
}

function onFileAdded (eventObj) {
    if (eventObj.success) {
        appendStatus('File '+ eventObj.filename + ' is ready to upload')
    } else {
        switch (eventObj.reason) {
        case 1:
            appendStatus("The size of file is greater then " + _viewer.config.upload.allowedmaxfilesize + " bytes permitted");
            break;
        case 2:
            appendStatus("Prohibited file type.");
            break;
        case 3:
            appendStatus("File with same name is already added to upload. " + eventObj.filename);
            break;
        }
        
    }

}

function onAnnoTextChanged(event) {
    appendStatus('Annotation text was changed: ' + event.annotation.text.value);
}

function onAnnoCreated(event) {
    //event.annotation.burn = true;
    //event.annotation.update();
    appendStatus('Annotation was created');
}

function onUploadStart() {
    appendStatus('Uploading started');
}

function onFileUploadStart(eventObj) {
    appendStatus('Start uploading file: ' + eventObj.fileinfo.filename);
}

function onFileUploadFinished(eventObj) {
    appendStatus('File ' + eventObj.filename + ' is uploaded.');
    lastUploadedFile = eventObj.filepath;
}

function onUploadFinished(eventObj) {
    appendStatus('Upload finished with result: ' + eventObj.success);
    appendStatus('-----------------------------');
    if (lastUploadedFile)
        _thumb2.OpenUrl(lastUploadedFile);
}

function uploadFiles() {
    var files = Array.from(document.getElementsByName('fileupload')[0].files);
    var subfldr = $('#txtSubUpload').val();
    if (subfldr) {
        _viewer.uploadFiles(files, subfldr);
    } else {
        _viewer.uploadFiles(files);
    }
}

function loadFile() {
    _thumb.OpenUrl($('#FileSelectionList').val());
}

function loadAnnotations(){
    var currFile = $('#FileSelectionList').val();
    var filename = currFile.split('/')[1];
    var fname = filename.split('.')[0];
    var xmpFile = "Saved/" + fname + ".xmp";
    _thumb.OpenUrl(null,xmpFile);
}

//Drug and Drop events

function onDragStart(evnt) {
    appendStatus("Drug'n'drop started. Page is going to be drugged: " + evnt.dragindex)
};
function onDragEnd(evnt, data) {
    appendStatus("Drug'n'drop almost ended.")
    //appendStatus(`Page drugged from page ${data.dragindex} to page ${data.dropindex} data.`)

}
function onDragComplete(evnt, data) {
    appendStatus("Drug'n'drop completed.")
    //appendStatus(`Page drugged from page ${data.dragindex} to page ${data.dropindex} data.`)
}

//Select pages
//Add page to set of selected pages.
function selectPage() {
    var pageToSelect = $("#PageToSelectNum").val()
    _thumb.selectThumb(pageToSelect, true)
}

//Select specified page only
function deselectPage() {
    var pageToSelect = $("#PageToSelectNum").val();
    _thumb.selectThumb(pageToSelect, false);
}

function getSelectPage() {
    appendStatus("Selected page: " + _thumb.getSelectedPageIndex());
}

function getSelectedPages() {
    appendStatus("Selected pages are: " + _thumb.getSelectedPagesIndices());
}

function deletePages() {
    var pagesToDel = _thumb.getSelectedPagesIndices();
    if (pagesToDel.length == 1) {
        var outmsg = "Page " + pagesToDel + " was deleted";
    } else {
        var outmsg = "Pages " + pagesToDel + " were deleted";
    }
    _thumb.document.removePages(pagesToDel, appendStatus(outmsg));
}

function rotatePages() {
    var pages = _thumb.getSelectedPagesIndices();
    var angle = 90;
    _thumb.document.rotatePages(pages, angle, appendStatus("Pages were rotated"))
}

function movePages() {
    var pages = _thumb.getSelectedPagesIndices();
    _thumb.document.movePages(pages, 0,
        appendStatus("Pages " + pages + "  were moved to begin of document"))
}

function insertPages() {
    var refs = [];
    var pages = _thumb.getSelectedPagesIndices();
    for (var i = 0; i < pages.length; i++) {
        refs.push(_thumb.document.getPageReference(pages[i]));
    }
    _thumb2.document.insertPages(null, refs, 0, appendStatus("Pages were inserted."));
};

function searchText() {
    var startind = 0;
    var endind;
    var start = $("#SearchStartPage").val();
    if (start != "") {
        startind = parseInt(start);
    }

    var end = $("#SearchEndPage").val();
    if (end != "") {
        endind = parseInt(end);
    } else {
        endind = _viewer.getDocumentInfo().count - 1;
    }

    var search = $("#searchPhrase").val();
    _viewer.text.searchOnPages(search, startind, endind, startind, onNextMatch);
}

function onViewerError(errEvent) {
    appendStatus("Oops, error with " + errEvent.name);
    appendStatus(errEvent.message);
}

function getAnnotations() {
    for (var i = 0; i < _viewer.getDocumentInfo().count; i++) {
        var annos = _viewer.getAnnotationsFromPage(i);
        for (var j = 0; j < annos.length; j++) {
            Annotations.push(annos[j]);
        }
    }
    _currAnnoIndx = 0;
    _viewer.annotations.scrollTo(Annotations[_currAnnoIndx]);
}

function onScroll() {
    var ann = _viewer.annotations.getSelected();
    appendStatus("Annotation " + ann.name);
}

function onFindNext() {
    if (_currIter && _currIter.isValid()) {
        _currIter.next(onNextMatch);
    } 
}

function onFindPrevious() {
    if (_currIter && _currIter.isValid()) {
        _currIter.prev(onNextMatch);
    } 
}

// callback signature is the same for search, next and prev functions.
function onNextMatch(iterator, match) {
    if (iterator.isValid()) {
        _currIter = iterator;
        _viewer.text.selectPageText(match.page, match.region, match.line, match.word);
    }
}

function goNextAnno() {
    var next = _currAnnoIndx + 1;
    if (next <= Annotations.length - 1) {
        _viewer.annotations.scrollTo(Annotations[next]);
        _currAnnoIndx = next;
    }
    
}

function goPrevAnno(){
    var next = _currAnnoIndx -1;
    if (next >= 0) {
        _viewer.annotations.scrollTo(Annotations[next]);
        _currAnnoIndx = next;
    }
}

function saveAsJpg() {
    _viewer.save('jpgs', 'jpg');
}

function copySelectedText() {
    _viewer.text.copySelected();
}

function requestImage()
{
    _viewer.reloadPage(0, true, false, { bpp: 'UnDefined' });
}

function burnAnnotation() {
    var index = parseInt($("#annoindex").val());
    var ann = _viewer.annotations.getFromPage(0)[index];
    ann.burn = true;
    ann.update();
}

function onPageInsert(e) {
    appendStatus("Page number " + e.srcindex + " from " + e.srcuri + " inserted to position " + e.destindex);
}

function onPageRemove(e) {
    appendStatus("Page with index " + e.index + " was removed.");
}

function onPageMove(e) {
    appendStatus("Page was moved from " + e.srcindex + " to " + e.destindex);
}

function onDocChange() {
    appendStatus("Document in the left thumb was changed.");
    appendStatus("----------------------------------------");
}

function reloadPage(){
    var pgnum = parseInt($("#numReload").val());
    if (isNaN(pgnum)) {
        pgnum = 0;
    }
    var reloadAnno = parseReloadField($("#txtReloadAnno").val());
    var reloadForms = parseReloadField($("#txtReloadForms").val());
    _viewer.reloadPage(pgnum,reloadAnno,reloadForms);
}

function parseReloadField(instr) {
            var ans;
            switch (instr.toLowerCase()) {
            case 'true':
                ans = true;
                break;
            case 'false':
                ans = false;
                break;
            default:
                ans = instr;
            }
            return ans;
        }