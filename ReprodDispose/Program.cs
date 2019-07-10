using Atalasoft.PdfDoc.Generating;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReprodDispose
{
    class Program
    {
        static void Main(string[] args)
        {
            var inputFile = args[0];
            var shortname = Path.GetFileName(inputFile);
            using(var streamin = File.OpenRead(inputFile))
            {
                var doc = new PdfGeneratedDocument(streamin);
                doc.Save(Path.Combine(@"D:\Work\temp\",shortname));
            }
        }
    }
}
