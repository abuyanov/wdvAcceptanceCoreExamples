using System;
using Atalasoft.Imaging.Codec;
using Atalasoft.Imaging.Codec.Dicom;
using Atalasoft.Imaging.Codec.Jbig2;
using Atalasoft.Imaging.Codec.Jpeg2000;
using Atalasoft.Imaging.Codec.Office;
using Atalasoft.Imaging.Codec.Pdf;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace TestCore517
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //RegisteredDecoders.Decoders.Add(new OfficeAdapterDecoder());
            RegisteredDecoders.Decoders.Add(new PdfDecoder());
            RegisteredDecoders.Decoders.Add(new DicomDecoder());
            RegisteredDecoders.Decoders.Add(new Jb2Decoder());
            RegisteredDecoders.Decoders.Add(new Jp2Decoder());
            RegisteredDecoders.Decoders.Add(new WmfDecoder());
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();
    }
}
