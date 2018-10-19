var _viewer, _thumb;

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
            thumbcaptionformat: 'page {0}'// from file {1}'
        });

        // Uncomment the following 2 lines if the toolbar buttons should be displayed without text
        //$('.atala-ui-button .ui-button-text').html(' ');
        //$('.atala-ui-button').css({ height: '28px', width: '28px' });

        loadFile();

    } catch (error) {
        appendStatus("Thrown error: " + error.description);
    }
});


function loadFile() {
    _thumb.OpenUrl($('#FileSelectionList').val());
}

function copySelection() {
    _viewer.text.copySelected();
}

function clearSelected() {
    _viewer.text.clearSelection();
}

function reportFailure() {
    appendStatus("Failed to select text on page.")
}

function reportSuccess() {
    copySelection();
    appendStatus("Text selected.");
}


function selectPageTxt() {
    var pageIndex = $("#pagestosel").val()
    var regIndex = $("#regtosel").val()
    var lineIndex = $("#linetosel").val()
    var wrdIndex = $("#wordtosel").val()
    if (regIndex == "") {
        _viewer.text.selectPageText(pageIndex, null, reportSuccess, reportFailure)
    }
    else if (lineIndex == "") {
        _viewer.text.selectPageText(pageIndex, regIndex, reportSuccess, reportFailure)
    }
    else if (wrdIndex == "") {
        _viewer.text.selectPageText(pageIndex, regIndex, lineIndex, reportSuccess, reportFailure)
    } else {
        _viewer.text.selectPageText(pageIndex, regIndex, lineIndex, wrdIndex, reportSuccess, reportFailure)
    }   
}

function getPageTxt() {
    var pageIndex = $("#pagestosel").val()
    _viewer.text.getPageText(pageIndex, function (arguments) { alert(arguments) })
}

function selectPageTxt2() {
    var pageIndex = $("#pagestosel").val()
    _viewer.text.selectPageText(pageIndex, function () { console.log('success') }, function () { console.log('fail') })
}

function SearchAndSelectTxt() {
    var startPageIndex = $("#srchStartIndex").val()
    var searchTxt = $("#txtSearch").val()
    _viewer.text.search(searchTxt, startPageIndex, function (it,match) {
        if (it.isValid()) {
            _viewer.text.selectPageText(match.page,match.region,match.line,match.word)
        }
    })
}