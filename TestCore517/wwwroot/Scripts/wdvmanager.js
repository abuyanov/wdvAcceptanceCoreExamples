var _viewer, _thumb, _thumb2;
var lastUploadedFile;
var selectedAnno;
var _currIter;
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
            'allowforms': true,
            allowannotations: true,
            //showerrors: true,
            'savepath': 'Saved',
            'annotations':{'atala_iuname': 'mm'},
            serverurl: 'wdv',
            allowtext: true,
            scrolltriggerarea: Atalasoft.Utils.ScrollArea.Normal,
            mousetool: {
                type: Atalasoft.Utils.MouseToolType.Pan
            },
            upload: {
                enabled:true,
                uploadpath: 'Upload/Viewer',
                allowedfiletypes: '.jpg,.pdf,.png,.jpeg,image/tiff',
                allowedmaxfilesize: 5*1024*1024,
                allowmultiplefiles: true,
                allowdragdrop: true,
                filesuploadconcurrency: 3,
            }

        });

        _thumb = new Atalasoft.Controls.WebDocumentThumbnailer({
            parent: $('#thumb1'),
            serverurl: 'wdv',
            maxwidth: 120,
            minwidth: 60,
            viewer: _viewer,
            allowannotations: true,
            allowdragdrop: true,
            showthumbcaption: false,
            thumbcaptionformat: 'page {0}',
            selectionmode: Atalasoft.Utils.SelectionMode.MultiSelect,
            selecteditemsorder: Atalasoft.Utils.SelectedItemsOrder.SelectedOrder,
            direction: Atalasoft.Utils.ScrollDirection.Horizontal,
        });

        // Initialize Second Thumbnail
        _thumb2 = new Atalasoft.Controls.WebDocumentThumbnailer({
            parent: $('#thumb2'),
            serverurl: 'wdv',
            maxwidth: 120,
            minwidth: 60,
            allowdragdrop: true,
            viewer:_viewer,
            allowannotations: true,
            showthumbcaption: true,
            direction: Atalasoft.Utils.ScrollDirection.Horizontal,
            selectionmode: Atalasoft.Utils.SelectionMode.MultiSelect,
            selecteditemsorder: Atalasoft.Utils.SelectedItemsOrder.SelectedOrder,
        });

        _thumb2.bind({
            'thumbdragstart':onDragStart,
            'thumbdragend': onDragEnd,
            'thumbdragcomplete': onDragComplete,
            
        });

        // Uncomment the following 2 lines if the toolbar buttons should be displayed without text
        //$('.atala-ui-button .ui-button-text').html(' ');
        //$('.atala-ui-button').css({ height: '28px', width: '28px' });

        loadFile();

    } catch (error) {
        appendStatus("Thrown error: " + error.description);
    }

    _viewer.bind({
        'fileaddedtoupload':onFileAdded,
        'uploadstarted':onUploadStart,
        'fileuploadstarted':onFileUploadStart,
        'fileuploadfinished': onFileUploadFinished,
        'uploadfinished':onUploadFinished,
        'annotationtextchanged':onAnnoTextChanged,
        'annotationcreated':onAnnoCreated,
        'error':onViewerError
        })
});

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
            appendStatus("File with same name is alredy added to upload. " + eventObj.filename);
            break;
        }
        
    }

}

function onAnnoTextChanged(event) {
    appendStatus('Annotation text was changed: ' + event.annotation.text.value)
}

function onAnnoCreated(event) {
    event.annotation.burn = true;
    event.annotation.update();
    appendStatus('Annotation was created')
}

function onUploadStart() {
    appendStatus('Uploading started')
}

function onFileUploadStart(eventObj) {
    appendStatus('Start uploading file: ' + eventObj.fileinfo.filename)
}

function onFileUploadFinished(eventObj) {
    appendStatus('File ' + eventObj.filename + ' is uploaded.');
    lastUploadedFile = eventObj.filepath;
}

function onUploadFinished(eventObj) {
    appendStatus('Upload finished with result: ' + eventObj.success)
    appendStatus('-----------------------------')
    if(lastUploadedFile)
        _thumb2.OpenUrl(lastUploadedFile)

}

function loadFile() {
    _thumb.OpenUrl($('#FileSelectionList').val());
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

function insertPages() {
    var page = $("#pagetomove").val()
    var insIndex = $("#targetinsindx").val();
    thumbs.document.insertPage(null, _thumb2.document.getPageReference(page), insIndex);
    appendStatus("Page were moved");
}

//Select pages
//Add page to set of selected pages.
function selectPage() {
    var pageToSelect = $("#PageToSelectNum").val()
    _thumb.selectThumb(pageToSelect, true)
}

//Select specified page only
function deselectPage() {
    var pageToSelect = $("#PageToSelectNum").val()
    _thumb.selectThumb(pageToSelect, false)
}

function getSelectPage() {
    appendStatus("Selected page: " + _thumb.getSelectedPageIndex())
}

function getSelectedPages() {
    appendStatus("Selected pages are: " + _thumb.getSelectedPagesIndices())
}

function deletePages() {
    var pagesToDel = _thumb.getSelectedPagesIndices();
    if (pagesToDel.length == 1) {
        var outmsg = "Page " + pagesToDel + " was deleted"
    } else {
        var outmsg = "Pages " + pagesToDel + " were deleted"
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
    var refs = []
    var pages = _thumb.getSelectedPagesIndices();
    for (var index in pages) {
        refs.push(_thumb.document.getPageReference(index))
    }

    _thumb2.document.insertPages(null,refs,0,appendStatus("Pages were inserted."))
};

function searchText() {
    var startind = 0;
    var endind;
    var start = $("#SearchStartPage").val();
    if (start != "") {
        startind = parseInt(start);
    }

    var end = $("#SearchEndPage").val()
    if (end != "") {
        endind = parseInt(end)
    } else {
        endind = _viewer.getDocumentInfo().count - 1;
    }

    var search = $("#searchPhrase").val();
    _viewer.text.searchOnPages(search, startind, endind, startind, onNextMatch);
}

function onViewerError(errEvent) {
    appendStatus("Oops, error with " + errEvent.name )
    appendStatus(errEvent.message)
}

function runThroughAnnot() {
    for (i = 0; i < _viewer.getDocumentInfo().count; i++) {
        var annos = _viewer.getAnnotationsFromPage(i);
        for (var j = 0; j < annos.length; j++) {
            _viewer.annotations.scrollTo(annos[j],onScroll)            
        }
    }
}

function onScroll() {
    var ann = _viewer.annotations.getSelected()
    appendStatus("Annotation " + ann.name)
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