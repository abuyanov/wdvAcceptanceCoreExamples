using Atalasoft.Imaging.WebControls;
using Atalasoft.Imaging.WebControls.Core;
using System.IO;

namespace TestCore517
{
    internal class AbWdvCallbacks : WebDocumentViewerCallbacks
    {

        //public override void FileUpload(FileUploadEventArgs e)
        //{
        //    const long BytesInKB = 1024 * 1024;
        //    const long BytesInMB = BytesInKB * 1024;

        //    long memoryMaxSize = 10 * BytesInKB;

        //    if (e.Params.ContainsKey("memoryMaxSize"))
        //        memoryMaxSize = long.Parse(e.Params["memoryMaxSize"]);

        //    //Files bigger than 100MB should be rejected
        //    if (e.Size > 100 * BytesInMB)
        //        e.Cancel = true;

        //    //Files smaller than 'memoryMaxSize' should be saved in memory
        //    if (e.Size < memoryMaxSize)
        //        e.DestinationStream = new MemoryStream();

        //    //Files that should be uploaded in wrong folder
        //    //or have incorrect extension should be rejected
        //    if (e.SaveFolder.Contains("StopWord") ||
        //        e.FileName.EndsWith(".exe"))
        //        e.Cancel = true;
        //}

        public override void DocumentSaveResponseSend(ResponseSendEventArgs e)
        {
            e.CustomResponseData.Add("Message","All we need is love!!!");
        }

        public override void DocumentInfoRequestResponseSend(ResponseSendEventArgs e)
        {
            e.CustomResponseData.Add("CustomMessage","Doc info was requested.");
        }

        public override void PageTextSearchResponseSend(ResponseSendEventArgs e)
        {
            e.CustomResponseData.Add("CustomMessage","Text search");
        }

        public override void PageTextRequestResponseSend(ResponseSendEventArgs e)
        {
            e.CustomResponseData.Add("CustomMessage","Text request");
        }

        public override void AnnotationsDataResponseSend(ResponseSendEventArgs e)
        {
            e.CustomResponseData.Add("CustomMessage","Annotation response");
        }
    }
}