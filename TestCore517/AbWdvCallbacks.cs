using System.Diagnostics;
using Atalasoft.Imaging.WebControls;
using Atalasoft.Imaging.WebControls.Core;
using System.IO;
using Atalasoft.Imaging;
using Atalasoft.Imaging.Codec;
using Atalasoft.Imaging.Codec.Office;
using Atalasoft.Imaging.Codec.Pdf;
using Atalasoft.Imaging.Text;
using Atalasoft.Imaging.WebControls.Text;
using Atalasoft.PdfDoc;
using Microsoft.AspNetCore.Hosting;

namespace TestCore517
{
    internal class AbWdvCallbacks : WebDocumentViewerCallbacks
    {
        private IHostingEnvironment _env;
        private readonly OfficeSession officeSession = OfficeSession.Open();
        private OfficeAdapterDecoder officeDecoder;
       
        public AbWdvCallbacks(IHostingEnvironment env)
        {
            _env = env;
            officeDecoder = new OfficeAdapterDecoder(officeSession);
        }

        public override void DocumentSaveResponseSend(ResponseSendEventArgs e)
        {
            if (!(bool)e.OriginalResponse["success"])
            {
                if (e.OriginalResponse["error"].ToString()
                    .Equals("Atalasoft.Imaging.WebControls.Exceptions.WebDocumentException"))
                {
                    e.CustomResponseData.Add("Message", "It is possible you're trying to save a multipage document using inappropriate format");
                }
                else
                {
                    e.CustomResponseData.Add("Message", e.OriginalResponse["error"].ToString());
                }
                
            }
            else
            {
                e.CustomResponseData.Add("Message", "Document saved successfully");
            }
        }

        public override void DocumentSave(DocumentSaveEventArgs docSaveArgs)
        {
            if (docSaveArgs.SaveFileFormat.Equals("pdf"))
            {
                var asPdfa = bool.Parse(docSaveArgs.Params["asPdfa"]);
                if (asPdfa)
                {
                    docSaveArgs.PreventDefaultSaving = true;
                    var encoder = new PdfEncoder
                    {
                        DocumentType = PdfDocumentType.PdfA1b
                    };
                    var imagesource = docSaveArgs.ImageSource;
                    var saveFolder = Path.Combine(_env.WebRootPath, docSaveArgs.SaveFolder, "pdfas");
                    var mappedSaveDocPath = Path.Combine(saveFolder, docSaveArgs.FileName);
                    if (!Directory.Exists(saveFolder))
                        Directory.CreateDirectory(saveFolder);

                    using (Stream documentOut = File.OpenWrite(mappedSaveDocPath))
                    {
                        encoder.Save(documentOut, imagesource, null);
                    }
                }
            }
        }

        public override void ImageRequested(ImageRequestedEventArgs e)
        {
            var fileName = Path.Combine(_env.WebRootPath, e.FilePath);
            if (File.Exists(fileName))
            {
                using (Stream stream = File.OpenRead(fileName))
                {
                    if (officeDecoder.IsValidFormat(stream))
                    {
                        e.Image = officeDecoder.Read(stream, e.FrameIndex, null);
                    }
                }
            }
        }

        //got
        public override void DocumentInfoRequestResponseSend(ResponseSendEventArgs e)
        {
            e.CustomResponseData.Add("CusDtomMessage","Doc info was requested.");
        }

        public override void DocumentInfoRequested(DocumentInfoRequestedEventArgs e)
        {
            e.ThumbCaptionFormat = "z {0} z";
            var fileName = Path.Combine(_env.WebRootPath,e.FilePath);
            if (File.Exists(fileName))
            {
                using (var stream = File.OpenRead(fileName))
                {
                    if (officeDecoder.IsValidFormat(stream))
                    {
                        var imageInfo = officeDecoder.GetImageInfo(stream);
                        int dpi = officeDecoder.Resolution;
                        e.Resolution = new Dpi(dpi, dpi, ResolutionUnit.DotsPerInch);
                        e.PageCount = imageInfo.FrameCount;
                        e.ColorDepth = imageInfo.ColorDepth;
                        e.PageSize = imageInfo.Size;
                    }
                }
            }
        }

        public override void PageTextSearchResponseSend(ResponseSendEventArgs e)
        {
            e.CustomResponseData.Add("CustomMessage","Text search");
        }

        public override void PageTextRequestResponseSend(ResponseSendEventArgs e)
        {
            e.CustomResponseData.Add("CustomMessage","Text request");
        }

        //got
        public override void AnnotationsDataResponseSend(ResponseSendEventArgs e)
        {
            e.CustomResponseData.Add("CustomMessage","Annotation response");
        }

        public override void AnnotationDataRequested(AnnotationDataRequestedEventArgs args)
        {
            //if (args.DocumentPath.Contains("Kitty") && args.FilePath == null)
            //{
            //    args.FilePath = "Saved/Kitty1.xmp";
            //}
        }

        public override void PageTextRequested(PageTextRequestedEventArgs pgArgs)
        {
            var serverPath = Path.Combine(_env.WebRootPath, pgArgs.FilePath);
            if (File.Exists(serverPath))
            {
                using (var stream = File.OpenRead(serverPath))
                {
                    try
                    {
                        var decoder = RegisteredDecoders.GetDecoder(stream) as ITextFormatDecoder;
                        if (decoder != null)
                        {
                            using (var extractor = new SegmentedTextTranslator(decoder.GetTextDocument(stream)))
                            {
                                // change default segmentation method.
                                extractor.RegionDetection = TextRegionDetectionMode.BlockDetection;

                                // each block boundaries inflated to one average character
                                // width and two average character height.
                                // All intersecting blocks are combined into single segment.
                                // Having vertical ratio bigger then horizontal behaves better on column-layout documents.
                                extractor.BlockDetectionDistance = new System.Drawing.SizeF(1, 2);
                                pgArgs.Page = extractor.ExtractPageText(pgArgs.Index);
                            }
                        }
                    }
                    catch (ImageReadException imagingException)
                    {
                        // RegisteredDecoders.GetDecoder could throws exception if no appropriate decoder were found.
                        Debug.WriteLine("Text extraction: image type is not recognized. {0}", imagingException);
                    }
                }
            }
        }
    }
}