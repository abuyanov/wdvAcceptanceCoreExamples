var _viewer, _thumb;
var lastUploadedFile;
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
            'savepath': '.',
            'annotations': {
                'atala_iuname': 'mm'
            },
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
                allowedmaxfilesize: 10*1024*1024,
                allowmultiplefiles: true,
                allowdragdrop: false,
                filesuploadconcurrency: 2,
            }

        });

        _thumb = new Atalasoft.Controls.WebDocumentThumbnailer({
            parent: $('.atala-document-thumbnailer'),
            serverurl: 'wdv',
            maxwidth: 120,
            minwidth: 60,
            // Note that specify relative URL to our
            // sample document on server here:
            viewer: _viewer,
            allowannotations: true,
            allowdragdrop: true,
            showthumbcaption: false,
            thumbcaptionformat: 'page {0}',
            //showselecttools: true,
        });

        // Uncomment the following 2 lines if the toolbar buttons should be displayed without text
        //$('.atala-ui-button .ui-button-text').html(' ');
        //$('.atala-ui-button').css({ height: '28px', width: '28px' });

        loadFile();

    } catch (error) {
        appendStatus("Thrown error: " + error.description);
    }

    _viewer.bind({
        'fileuploadstarted':onUploadStart,
        'fileuploadfinished': onFileUploadFinished,
        'uploadfinished':onUploadFinished,
        })
});

function onUploadStart(eventObj) {
    appendStatus('Start uploading file: ' + eventObj.fileinfo.filename)
}

function onFileUploadFinished(eventObj) {
    appendStatus('file upload finished with result ' + eventObj.success);
    lastUploadedFile = eventObj.filepath;
}

function onUploadFinished(eventObj) {
    appendStatus('Upload finished with result: ' + eventObj.success)
    if(lastUploadedFile)
        _thumb.OpenUrl(lastUploadedFile)

}

function loadFile() {
    _thumb.OpenUrl($('#FileSelectionList').val());
}

