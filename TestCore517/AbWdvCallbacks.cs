using System.Diagnostics;
using Atalasoft.Imaging.WebControls;
using Atalasoft.Imaging.WebControls.Core;
using System.IO;
using System.Runtime.CompilerServices;
using Atalasoft.Imaging;
using Atalasoft.Imaging.Codec;
using Atalasoft.Imaging.Codec.Office;
using Atalasoft.Imaging.Text;
using Atalasoft.Imaging.WebControls.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

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
            e.CustomResponseData.Add("Message","All we need is love!!!");
            //_logger.LogInformation("Response send for file save");
        }

        public override void DocumentSave(DocumentSaveEventArgs dseargs)
        {
            var result = dseargs.Params;
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
            e.CustomResponseData.Add("CustomMessage","Doc info was requested.");
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